import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOutreachEmail } from "@/lib/email/resend";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email, firstName, businessName, city } = await req.json();
    if (!email || !firstName || !businessName) {
      return NextResponse.json({ error: "email, firstName, and businessName are required" }, { status: 400 });
    }

    const existing = await db.outreachProspect.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Prospect already exists" }, { status: 409 });
    }

    const prospect = await db.outreachProspect.create({
      data: { email, firstName, businessName, city: city || null, emailStep: 1, lastEmailSentAt: new Date() },
    });

    let emailError: string | null = null;
    try {
      await sendOutreachEmail({ to: email, firstName, businessName, step: 1 });
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Email failed to send";
    }

    return NextResponse.json({ success: true, prospect, emailError });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prospects = await db.outreachProspect.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ prospects });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, replied, unsubscribed } = await req.json();
  const prospect = await db.outreachProspect.update({
    where: { id },
    data: { ...(replied !== undefined && { replied }), ...(unsubscribed !== undefined && { unsubscribed }) },
  });

  return NextResponse.json({ prospect });
}
