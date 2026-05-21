import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createStripeCustomer, createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({ locationId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { locationId } = schema.parse(body);

  const location = await db.businessLocation.findFirst({
    where: { id: locationId, userId: session.user.id },
    include: { subscription: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  let stripeCustomerId = location.subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await createStripeCustomer(
      session.user.email!,
      session.user.name ?? undefined
    );
    stripeCustomerId = customer.id;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const checkoutSession = await createCheckoutSession({
    customerId: stripeCustomerId,
    locationId,
    userId: session.user.id,
    successUrl: `${appUrl}/dashboard?subscribed=true`,
    cancelUrl: `${appUrl}/dashboard`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
