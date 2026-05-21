import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
  }
  return _stripe;
}

// Convenience re-export for webhook verification (needs the raw client)
export { Stripe };

export const PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_PRICE_ID ?? "",
    amount: 4900,
    interval: "month" as const,
    trialDays: 14,
  },
} as const;

export async function createStripeCustomer(email: string, name?: string) {
  return getStripe().customers.create({ email, name });
}

export async function createCheckoutSession({
  customerId,
  locationId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  locationId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PLANS.MONTHLY.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: PLANS.MONTHLY.trialDays,
      metadata: { locationId, userId },
    },
    metadata: { locationId, userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as {
    type?: string;
    subscription_details?: { subscription?: string };
  } | null;
  if (parent?.subscription_details?.subscription) {
    return parent.subscription_details.subscription;
  }
  return null;
}
