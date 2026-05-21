import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { ApproveReviewPanel } from "@/components/dashboard/approve-review-panel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const review = await db.review.findFirst({
    where: { id, location: { userId: session!.user!.id } },
    include: {
      response: true,
      location: { select: { name: true, id: true } },
    },
  });

  if (!review) notFound();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/dashboard/reviews"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0d253d] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to reviews
      </Link>

      {/* Review card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">{review.location.name}</p>
              <h1 className="text-lg font-bold text-[#0d253d]">{review.reviewerName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-slate-400 text-xs">{formatRelativeTime(review.reviewDate)}</span>
              </div>
            </div>
            <Badge
              variant={review.status.toLowerCase() as "pending" | "posted" | "dismissed"}
            />
          </div>
        </CardHeader>
        <CardBody>
          {review.comment ? (
            <p className="text-slate-700 leading-relaxed">{review.comment}</p>
          ) : (
            <p className="text-slate-400 italic">No written review — star rating only.</p>
          )}
        </CardBody>
      </Card>

      {/* AI Response panel */}
      <ApproveReviewPanel review={review} />
    </div>
  );
}
