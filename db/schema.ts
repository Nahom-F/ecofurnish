import { pgTable, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  // Drizzle handles the numeric prices perfectly
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  // Used to group products in the catalog filters (e.g. "Seating", "Storage")
  category: text("category").notNull().default("Other"),
  stock: integer("stock").default(0).notNull(),
  // Tracking the environmental impact
  plasticWeightKg: numeric("plastic_weight_kg", { precision: 5, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// One row per checkout. We snapshot the customer's contact details here
// rather than requiring an account, so guest checkout works.
export const orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  // Always set now that checkout requires an account — left nullable
  // (rather than migrating) since any earlier guest orders still have
  // null here. Not a foreign key: Better Auth manages the `user` table
  // separately from this Drizzle schema.
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  // pending -> processing -> shipped -> delivered (or cancelled) — see
  // VALID_STATUSES in app/admin/actions.ts, the actual source of truth
  status: text("status").notNull().default("pending"),
  // unpaid until Chapa confirms the transaction server-to-server
  // (see verifyChapaTransaction / confirmPayment)
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  chapaTxRef: text("chapa_tx_ref"),
  // Free-text, e.g. a Telebirr tracking number — set from the admin
  // panel, included in the "shipped" status email if present.
  trackingNote: text("tracking_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per product in an order. Name and price are copied at order time
// so a later price change or product edit never rewrites past orders.
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

// One row per customer per product. Submission is only allowed for users
// with a delivered order containing this product (see canReviewProduct in
// lib/reviews.ts) — so every row here is inherently a verified purchase,
// with nothing extra to store for that. One review per (userId,
// productId) is enforced in the submitReview action itself (check, then
// insert or update) rather than a DB constraint — fine at this store's
// scale, and keeps the migration a plain additive `pnpm db:push`.
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  // Not a foreign key — same reasoning as orders.userId above.
  userId: text("user_id").notNull(),
  // Snapshotted at submission time, same reasoning as
  // orderItems.productName — a later display-name change shouldn't
  // rewrite old reviews, and this avoids a live join into Better Auth's
  // user table just to render a name.
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});