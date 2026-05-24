import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOutreachEmail, OUTREACH_STEP_DELAYS } from "@/lib/email/resend";

// Vercel Cron: runs daily at 9am ET
// vercel.json: { "path": "/api/cron/outreach", "schedule": "0 14 * * *" }
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find prospects that need their next email
  const prospects = await db.outreachProspect.findMany({
    where: {
      unsubscribed: false,
      replied: false,
      emailStep: { gte: 1, lt: 5 },
      lastEmailSentAt: { not: null },
    },
  });

  const toSend = prospects.filter((p) => {
    const nextStep = p.emailStep + 1;
    const daysRequired = OUTREACH_STEP_DELAYS[nextStep] - OUTREACH_STEP_DELAYS[p.emailStep];
    const daysSinceLast = (now.getTime() - p.lastEmailSentAt!.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLast >= daysRequired;
  });

  const results = await Promise.allSettled(
    toSend.map(async (p) => {
      const nextStep = p.emailStep + 1;
      await sendOutreachEmail({ to: p.email, firstName: p.firstName, businessName: p.businessName, step: nextStep });
      await db.outreachProspect.update({
        where: { id: p.id },
        data: { emailStep: nextStep, lastEmailSentAt: now },
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ checked: prospects.length, sent, failed });
}
