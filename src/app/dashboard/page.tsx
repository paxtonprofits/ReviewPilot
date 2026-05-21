import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { AddLocationButton } from "@/components/dashboard/add-location-button";
import { ConnectGbpButton } from "@/components/dashboard/connect-gbp-button";
import { SubscribeButton } from "@/components/dashboard/subscribe-button";

export const metadata = { title: "Dashboard — ReviewPilot" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; connected?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const locations = await db.businessLocation.findMany({
    where: { userId: session!.user!.id },
    include: {
      subscription: true,
      gbpToken: { select: { id: true } },
      reviews: {
        orderBy: { reviewDate: "desc" },
        take: 3,
        include: { response: true },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const pendingCount = await db.review.count({
    where: {
      location: { userId: session!.user!.id },
      status: "PENDING",
    },
  });

  const postedCount = await db.review.count({
    where: {
      location: { userId: session!.user!.id },
      status: "POSTED",
    },
  });

  const totalReviews = await db.review.count({
    where: { location: { userId: session!.user!.id } },
  });

  const avgRatingResult = await db.review.aggregate({
    where: { location: { userId: session!.user!.id } },
    _avg: { rating: true },
  });

  const avgRating = avgRatingResult._avg.rating ?? 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0d253d]">
            Good {getGreeting()}, {session!.user!.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} review${pendingCount !== 1 ? "s" : ""} waiting for your approval`
              : "All caught up — no pending reviews"}
          </p>
        </div>
        <AddLocationButton />
      </div>

      {/* Alerts */}
      {params.subscribed && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium">
          Subscription activated — your reviews will now be monitored automatically.
        </div>
      )}
      {params.connected && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg text-sm font-medium">
          Google Business Profile connected successfully.
        </div>
      )}
      {params.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">
          {params.error === "gbp_denied"
            ? "Google Business Profile connection was cancelled."
            : "Something went wrong. Please try again."}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Reviews" value={totalReviews} />
        <StatCard label="Responses Posted" value={postedCount} />
        <StatCard label="Pending Approval" value={pendingCount} highlight={pendingCount > 0} />
        <StatCard label="Avg Rating" value={avgRating ? avgRating.toFixed(1) : "—"} suffix="/ 5" />
      </div>

      {/* Locations */}
      {locations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-[#0d253d] text-lg">{loc.name}</h2>
                    {loc.address && (
                      <p className="text-slate-400 text-sm mt-0.5">{loc.address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {loc.subscription ? (
                      <Badge
                        variant={
                          loc.subscription.status.toLowerCase() as
                            | "trialing"
                            | "active"
                            | "past_due"
                            | "canceled"
                        }
                      />
                    ) : (
                      <SubscribeButton locationId={loc.id} />
                    )}
                    {!loc.gbpToken && <ConnectGbpButton locationId={loc.id} />}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {loc.reviews.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    {loc.gbpToken
                      ? "No reviews yet — we check every 15 minutes."
                      : "Connect your Google Business Profile to start monitoring reviews."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {loc.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0 border-slate-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating rating={review.rating} />
                            <span className="text-slate-400 text-xs">
                              {formatRelativeTime(review.reviewDate)}
                            </span>
                            <Badge
                              variant={review.status.toLowerCase() as "pending" | "posted" | "dismissed"}
                            />
                          </div>
                          <p className="text-sm font-medium text-[#0d253d]">
                            {review.reviewerName}
                          </p>
                          {review.comment && (
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                              {review.comment}
                            </p>
                          )}
                        </div>
                        {review.status === "PENDING" && (
                          <Link
                            href={`/dashboard/reviews/${review.id}`}
                            className="flex-shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Review &rarr;
                          </Link>
                        )}
                      </div>
                    ))}
                    {loc._count.reviews > 3 && (
                      <Link
                        href={`/dashboard/reviews?locationId=${loc.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View all {loc._count.reviews} reviews &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardBody className="py-4">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
          {label}
        </p>
        <p
          className={`text-3xl font-bold tracking-tight ${
            highlight ? "text-amber-500" : "text-[#0d253d]"
          }`}
        >
          {value}
          {suffix && <span className="text-base font-normal text-slate-400 ml-1">{suffix}</span>}
        </p>
      </CardBody>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardBody className="py-16 text-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </div>
        <h3 className="text-[#0d253d] font-semibold text-lg mb-2">Add your first location</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
          Connect your salon or med spa&apos;s Google Business Profile and we&apos;ll start monitoring and responding to reviews automatically.
        </p>
        <AddLocationButton />
      </CardBody>
    </Card>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
