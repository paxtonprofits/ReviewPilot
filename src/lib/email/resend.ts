import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = () =>
  process.env.RESEND_FROM_EMAIL ?? "ReviewPilot <noreply@reviewpilot.co>";

export async function sendNewReviewEmail({
  to,
  businessName,
  reviewerName,
  rating,
  reviewText,
  approveUrl,
}: {
  to: string;
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewText: string | null;
  approveUrl: string;
}) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  await getResend().emails.send({
    from: FROM(),
    to,
    subject: `New ${rating}-star review for ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0d253d;margin-bottom:8px">New review for ${businessName}</h2>
        <p style="color:#533afd;font-size:24px;margin:0">${stars}</p>
        <p style="color:#444;margin-top:16px"><strong>${reviewerName}</strong> left a ${rating}-star review:</p>
        <blockquote style="border-left:3px solid #533afd;padding-left:16px;color:#555;font-style:italic">
          ${reviewText ?? "(No text — star rating only)"}
        </blockquote>
        <p style="color:#444">We've generated a response for you. Click below to approve and post it:</p>
        <a href="${approveUrl}" style="display:inline-block;background:#533afd;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
          Review &amp; Approve Response
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px">ReviewPilot — AI-powered review management</p>
      </div>
    `,
  });
}

const OUTREACH_FROM = () =>
  process.env.RESEND_FROM_EMAIL ?? "Paxton <paxton@reviewpilot.co>";

const DAYS: Record<number, number> = { 1: 0, 2: 3, 3: 7, 4: 12, 5: 16 };
export const OUTREACH_STEP_DELAYS = DAYS;

type OutreachVars = { firstName: string; businessName: string };

const outreachSubjects: Record<number, (v: OutreachVars) => string> = {
  1: ({ businessName }) => `${businessName} — quick question about your reviews`,
  2: () => `that 3-star review from last week`,
  3: () => `what happens when you don't respond`,
  4: () => `"it's only $49?"`,
  5: () => `closing your file`,
};

const outreachBodies: Record<number, (v: OutreachVars & { appUrl: string }) => string> = {
  1: ({ firstName, businessName, appUrl }) => `
    <p>Hey ${firstName},</p>
    <p>Checked out ${businessName} on Google — great spot. Noticed a few reviews without responses.</p>
    <p>Quick heads up: 89% of customers read a business's response before deciding whether to visit. No response = lost tables.</p>
    <p>I built a tool called ReviewPilot that drafts professional responses to every review using AI. You get a one-tap approval, it posts automatically. Takes about 10 seconds per review.</p>
    <p>7-day free trial, no card needed:</p>
    <a href="${appUrl}" style="display:inline-block;background:#5046e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
      Try ReviewPilot Free →
    </a>
    <p>Worth a look?</p>
    <p>— Paxton</p>
  `,
  2: ({ firstName, businessName, appUrl }) => `
    <p>Hey ${firstName},</p>
    <p>Most ${businessName.split(" ")[0]} owners I talk to have the same problem: they know they should respond to every Google review, but by the time service is done, it's midnight and the last thing they want to do is write a professional reply.</p>
    <p>So it just… doesn't happen.</p>
    <p>ReviewPilot handles it for you. You get a notification, read the draft, tap approve. The response goes live under your name. If you don't like the draft, edit it or regenerate — takes 30 seconds.</p>
    <p>$49/month per location. First 7 days free:</p>
    <a href="${appUrl}" style="display:inline-block;background:#5046e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
      Start Free Trial →
    </a>
    <p>— Paxton</p>
  `,
  3: ({ firstName, appUrl }) => `
    <p>Hey ${firstName},</p>
    <p>A local business was getting 4.1 stars with 200+ reviews. Solid, but not standing out.</p>
    <p>Started responding to every review — compliments, complaints, everything — within 24 hours.</p>
    <p>Six months later: 4.6 stars. Rank jumped in local search. More customers found them on Google.</p>
    <p>The responses weren't long. Just genuine, professional, specific. That's exactly what ReviewPilot writes.</p>
    <a href="${appUrl}" style="display:inline-block;background:#5046e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
      Free trial still open →
    </a>
    <p>— Paxton</p>
  `,
  4: ({ firstName, appUrl }) => `
    <p>Hey ${firstName},</p>
    <p>Got a reply last week from a business owner who said: "I thought something like this would cost hundreds a month."</p>
    <p>It's $49/month per location. That's one sale. One table.</p>
    <p>And it handles every single review — five stars, one star, the weird ones — automatically. You just approve before anything goes live. Nothing posts without your okay.</p>
    <p>If it saves you 2 hours a month of stress and makes you look more professional to every potential customer reading your reviews: pretty easy math.</p>
    <a href="${appUrl}" style="display:inline-block;background:#5046e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
      7 days free → review-pilot-tb98.vercel.app
    </a>
    <p>— Paxton</p>
  `,
  5: ({ firstName, businessName, appUrl }) => `
    <p>Hey ${firstName},</p>
    <p>Last email from me — I don't want to clog your inbox.</p>
    <p>If responding to Google reviews isn't a priority right now, totally get it. I'll leave the free trial open if you ever want to try it.</p>
    <p>If the timing is just off, reply and I'll check back in next month.</p>
    <p>Either way — good luck with ${businessName}. Hope the reviews keep coming in.</p>
    <a href="${appUrl}" style="display:inline-block;background:#5046e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
      review-pilot-tb98.vercel.app
    </a>
    <p>— Paxton</p>
  `,
};

export async function sendOutreachEmail({
  to,
  firstName,
  businessName,
  step,
}: {
  to: string;
  firstName: string;
  businessName: string;
  step: number;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://review-pilot-tb98.vercel.app";
  const vars = { firstName, businessName, appUrl };
  const subject = outreachSubjects[step](vars);
  const bodyContent = outreachBodies[step](vars);

  await getResend().emails.send({
    from: OUTREACH_FROM(),
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#333;line-height:1.6;font-size:15px">
        ${bodyContent}
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0" />
        <p style="color:#999;font-size:12px">
          You're receiving this because you run ${businessName}.
          <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(to)}" style="color:#999">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export async function sendTrialEndingEmail({
  to,
  businessName,
  trialEndsAt,
  billingUrl,
}: {
  to: string;
  businessName: string;
  trialEndsAt: Date;
  billingUrl: string;
}) {
  const days = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  await getResend().emails.send({
    from: FROM(),
    to,
    subject: `Your ReviewPilot trial ends in ${days} days`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0d253d">Your free trial is ending soon</h2>
        <p style="color:#444">Your 14-day free trial for <strong>${businessName}</strong> ends in <strong>${days} days</strong>.</p>
        <p style="color:#444">To keep your reviews automatically responded to, add a payment method:</p>
        <a href="${billingUrl}" style="display:inline-block;background:#533afd;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
          Manage Billing — $49/month
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px">ReviewPilot — AI-powered review management</p>
      </div>
    `,
  });
}
