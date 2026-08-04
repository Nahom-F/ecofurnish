import { pgTable, text, numeric, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  // Drizzle handles the numeric prices perfectly
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  // Used to group products in the catalog filters (e.g. "Seating", "Storage")
  category: text("category").notNull().default("Other"),
  // Which room(s) this piece suits (e.g. "Living Room", "Bedroom") — kept
  // separate from `category` since it's a different axis (furniture type
  // vs. where it's used) and a product can reasonably belong to more than
  // one room at once, e.g. a modular shelf fitting both a living room and
  // an office.
  rooms: text("rooms").array().notNull().default([]),
  stock: integer("stock").default(0).notNull(),
  // Tracking the environmental impact
  plasticWeightKg: numeric("plastic_weight_kg", { precision: 5, scale: 2 }).default('0.00').notNull(),
  // Optional site-run discount (e.g. a launch promo). 0 = no discount.
  // Manually controlled from the admin product form — no auto-expiry, it
  // runs until whoever's managing the store clears it.
  discountPercent: integer("discount_percent").default(0).notNull(),
  discountReason: text("discount_reason"),
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
  // Any referral reward applied at checkout (store credit, or a % code) —
  // kept separate from totalAmount (which is the final charged amount) so
  // there's a record, in the order itself and in admin, of what discount
  // was applied and why.
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  discountNote: text("discount_note"),
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

// One row per user who has ever generated a referral link. Codes are
// created lazily the first time someone visits their referral page —
// not every user has one.
export const referralCodes = pgTable("referral_codes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per person who signed up via someone else's referral link.
// `qualified` flips true the first time that person's first order is
// actually paid for — invites alone never count, only ones who actually
// buy something, per how this was scoped.
export const referrals = pgTable("referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerId: text("referrer_id").notNull(),
  // unique: one person can only ever have been referred by one other person
  referredUserId: text("referred_user_id").notNull().unique(),
  qualified: boolean("qualified").default(false).notNull(),
  qualifiedAt: timestamp("qualified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per reward a referrer actually earned by crossing a milestone
// (see MILESTONES in lib/referrals.ts). `code` is the redeemable string
// for discount_code / free_shipping types; `creditAmount` is the balance
// for store_credit (and is decremented as it's spent, rather than being
// all-or-nothing against a single order).
export const referralRewards = pgTable("referral_rewards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "discount_code" | "store_credit" | "free_shipping"
  milestone: integer("milestone").notNull(), // 5, 15, or 30 — which tier earned this
  code: text("code").unique(), // set for discount_code / free_shipping
  percentOff: integer("percent_off"), // set for discount_code
  creditAmount: numeric("credit_amount", { precision: 10, scale: 2 }), // set for store_credit / free_shipping
  redeemed: boolean("redeemed").default(false).notNull(),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});