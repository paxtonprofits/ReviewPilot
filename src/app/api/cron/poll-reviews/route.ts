import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchGbpReviews } from "@/lib/google/gbp";
import { generateReviewResponse } from "@/lib/ai";
import { sendNewReviewEmail } from "@/lib/email/resend";

// Vercel Cron: runs every 15 minutes
// vercel.json: { "crons": [{ "path": "/api/cron/poll-reviews", "schedule": "*/15 * * * *" }] }
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only poll locations with active subscriptions and a connected GBP token
  const locations = await db.businessLocation.findMany({
    where: {
      gbpToken: { isNot: null },
      locationId: { not: null },
      subscription: { status: { in: ["ACTIVE", "TRIALING"] } },
    },
    include: {
      user: { select: { email: true } },
      gbpToken: true,
    },
  });

  const results = await Promise.allSettled(
    locations.map((location) => processLocation(location))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ processed: locations.length, succeeded, failed });
}

async function processLocation(location: {
  id: string;
  name: string;
  locationId: string | null;
  user: { email: string | null };
}) {
  if (!location.locationId) return;

  const rawReviews = await fetchGbpReviews(location.id, location.locationId);

  interface GbpReview {
    name: string;
    starRating: string;
    comment?: string;
    createTime: string;
    reviewer?: { displayName?: string };
  }

  for (const raw of rawReviews as GbpReview[]) {
    const googleReviewId = raw.name;

    // Skip if we already have this review
    const existing = await db.review.findUnique({ where: { googleReviewId } });
    if (existing) continue;

    const rating = starRatingToNumber(raw.starRating);
    const reviewText = raw.comment ?? null;
    const reviewerName = raw.reviewer?.displayName ?? "Anonymous";

    const review = await db.review.create({
      data: {
        locationId: location.id,
        googleReviewId,
        reviewerName,
        rating,
        comment: reviewText,
        reviewDate: new Date(raw.createTime),
        status: "PENDING",
      },
    });

    // Generate AI response
    const responseText = await generateReviewResponse({
      businessName: location.name,
      reviewerName,
      rating,
      reviewText,
    });

    await db.reviewResponse.create({
      data: { reviewId: review.id, content: responseText },
    });

    // Email the owner
    if (location.user.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
      await sendNewReviewEmail({
        to: location.user.email,
        businessName: location.name,
        reviewerName,
        rating,
        reviewText,
        approveUrl: `${appUrl}/dashboard/reviews/${review.id}`,
      });
    }
  }
}

function starRatingToNumber(starRating: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[starRating] ?? 3;
}
