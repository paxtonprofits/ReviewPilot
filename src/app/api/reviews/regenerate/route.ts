import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateReviewResponse } from "@/lib/ai";
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
    include: { location: { select: { name: true } } },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const content = await generateReviewResponse({
    businessName: review.location.name,
    reviewerName: review.reviewerName,
    rating: review.rating,
    reviewText: review.comment,
  });

  const response = await db.reviewResponse.upsert({
    where: { reviewId },
    update: { content, aiGenerated: true, postedAt: null },
    create: { reviewId, content, aiGenerated: true },
  });

  return NextResponse.json({ content: response.content });
}
