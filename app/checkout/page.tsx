"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart-context";
import { formatPrice, type Currency } from "@/lib/currency";
import { useSession } from "@/lib/auth-client";
import { createOrder, createCheckoutSession } from "@/app/actions/orders";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { data: session, isPending } = useSession();
  const preferredCurrency = (session?.user?.preferredCurrency as Currency | undefined) || "ETB";
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-6" render={<Link href="/" />} nativeButton={false}>
          Back to shop
        </Button>
      </div>
    );
  }

  // Real orders and payments require an account — this also means your
  // cart automatically merges into your account the moment you sign in
  // (see CartProvider), so nothing gets lost by signing in right here.
  if (!isPending && !session?.user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Sign in to check out</h1>
        <p className="mt-2 text-muted-foreground">
          Your {items.length} cart {items.length === 1 ? "item stays" : "items stay"} right
          here — sign in or create an account to complete your order.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/sign-in" />} nativeButton={false}>
            Sign in
          </Button>
          <Button variant="outline" render={<Link href="/sign-up" />} nativeButton={false}>
            Create account
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const orderResult = await createOrder({
        customerName: String(formData.get("name") || ""),
        customerEmail: String(formData.get("email") || ""),
        customerPhone: String(formData.get("phone") || ""),
        shippingAddress: String(formData.get("address") || ""),
        city: String(formData.get("city") || ""),
        notes: String(formData.get("notes") || ""),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      if (!orderResult.success) {
        toast.error(orderResult.error || "Something went wrong placing your order.");
        setSubmitting(false);
        return;
      }

      const sessionResult = await createCheckoutSession(orderResult.orderId);
      if (!sessionResult.success) {
        toast.error(sessionResult.error || "Couldn't start checkout. Please try again.");
        setSubmitting(false);
        return;
      }

      // Cart is intentionally left alone until payment is confirmed —
      // if the customer cancels on Chapa's page, their cart is still here.
      window.location.href = sessionResult.url;
    } catch {
      toast.error("Couldn't place your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Checkout</h1>
      {canceled && (
        <p className="mb-6 rounded-lg border border-border/60 bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
          Payment was canceled — your cart is untouched, try again whenever you&apos;re ready.
        </p>
      )}

      <div className="mt-6 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address">Shipping address</Label>
              <Input id="address" name="address" required autoComplete="street-address" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required autoComplete="address-level2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Delivery notes (optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Gate code, landmark, preferred time…" />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            You&apos;ll complete payment on Chapa&apos;s secure checkout page next —
            card, mobile money, or bank transfer, charged in ETB. This is
            running in test mode, so no real money moves.
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Preparing checkout…" : `Continue to Payment — ${formatPrice(subtotal, "ETB")}`}
          </Button>
        </form>

        <div className="h-fit rounded-lg border border-border/60 p-5">
          <h2 className="mb-4 font-semibold">Order summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice((parseFloat(item.price) * item.quantity).toFixed(2), "ETB")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border/60 pt-4 font-semibold">
            <span>Total</span>
            <div className="text-right">
              <span className="text-primary">{formatPrice(subtotal, "ETB")}</span>
              {preferredCurrency !== "ETB" && (
                <p className="text-xs font-normal text-muted-foreground">
                  ≈ {formatPrice(subtotal, preferredCurrency)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
