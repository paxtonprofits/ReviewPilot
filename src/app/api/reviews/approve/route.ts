import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { postGbpReply } from "@/lib/google/gbp";
import { z } from "zod";

const schema = z.object({ reviewId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { reviewId } = schema.parse(body);

  const review = await db.review.findFirst({
    where: { id: reviewId, location: { userId: session.user.id } },
    include: { response: true, location: true },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (!review.response) {
    return NextResponse.json({ error: "No response to approve" }, { status: 400 });
  }
  if (review.status === "POSTED") {
    return NextResponse.json({ error: "Already posted" }, { status: 400 });
  }

  const locationId = review.locationId;
  const gbpLocationName = review.location.locationId;

  if (gbpLocationName) {
    await postGbpReply(
      locationId,
      gbpLocationName,
      review.googleReviewId,
      review.response.content
    );
  }

  await db.$transaction([
    db.review.update({
      where: { id: reviewId },
      data: { status: "POSTED" },
    }),
    db.reviewResponse.update({
      where: { reviewId },
      data: { postedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
