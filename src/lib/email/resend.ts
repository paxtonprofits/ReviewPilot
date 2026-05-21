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
