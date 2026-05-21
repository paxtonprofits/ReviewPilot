import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBillingPortalSession } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({ locationId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { locationId } = schema.parse(body);

  const subscription = await db.subscription.findFirst({
    where: {
      locationId,
      location: { userId: session.user.id },
    },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const portalSession = await createBillingPortalSession(
    subscription.stripeCustomerId,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  );

  return NextResponse.json({ url: portalSession.url });
}
