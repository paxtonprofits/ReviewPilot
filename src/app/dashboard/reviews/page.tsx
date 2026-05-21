import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Reviews — ReviewPilot" };
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { label: "Pending", value: "PENDING" },
  { label: "Posted", value: "POSTED" },
  { label: "All", value: "" },
] as const;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; locationId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const statusFilter = params.status ?? "PENDING";
  const locationFilter = params.locationId;

  const where: Record<string, unknown> = {
    location: { userId: session!.user!.id },
  };
  if (statusFilter) where.status = statusFilter;
  if (locationFilter) where.locationId = locationFilter;

  const reviews = await db.review.findMany({
    where,
    include: {
      response: true,
      location: { select: { name: true } },
    },
    orderBy: { reviewDate: "desc" },
    take: 100,
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0d253d] mb-6">Reviews</h1>

      {/* Status tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/dashboard/reviews?status=${tab.value}${locationFilter ? `&locationId=${locationFilter}` : ""}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-100 ${
                active
                  ? "bg-white text-[#0d253d] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <p className="text-slate-400">
              {statusFilter === "PENDING"
                ? "No pending reviews — you're all caught up."
                : "No reviews found."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:border-indigo-100 transition-colors">
              <CardBody className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StarRating rating={review.rating} />
                      <Badge
                        variant={review.status.toLowerCase() as "pending" | "posted" | "dismissed"}
                      />
                      <span className="text-slate-400 text-xs ml-auto">
                        {review.location.name} · {formatRelativeTime(review.reviewDate)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#0d253d]">{review.reviewerName}</p>
                    {review.comment && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{review.comment}</p>
                    )}
                    {review.response && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">
                        Response: {review.response.content}
                      </p>
                    )}
                  </div>
                  {review.status === "PENDING" && (
                    <Link
                      href={`/dashboard/reviews/${review.id}`}
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Approve &rarr;
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
