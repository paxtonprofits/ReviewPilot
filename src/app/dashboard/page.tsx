import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { AddLocationButton } from "@/components/dashboard/add-location-button";
import { ConnectGbpButton } from "@/components/dashboard/connect-gbp-button";
import { SubscribeButton } from "@/components/dashboard/subscribe-button";
import { TiltCard } from "@/components/ui/tilt-card";
import { DeleteLocationButton } from "@/components/dashboard/delete-location-button";

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
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const pendingCount = await db.review.count({
    where: { location: { userId: session!.user!.id }, status: "PENDING" },
  });

  const postedCount = await db.review.count({
    where: { location: { userId: session!.user!.id }, status: "POSTED" },
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
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-8 py-6 animate-fade-in">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0a1f35] tracking-tight">
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
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 dashboard-grid">
        {/* Alerts */}
        {params.subscribed && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium animate-fade-up">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Subscription activated — your reviews will now be monitored automatically.
          </div>
        )}
        {params.connected && (
          <div className="mb-6 flex items-center gap-3 bg-indigo-50 border border-indigo-200/80 text-indigo-800 px-4 py-3 rounded-xl text-sm font-medium animate-fade-up">
            <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Google Business Profile connected successfully.
          </div>
        )}
        {params.error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200/80 text-red-800 px-4 py-3 rounded-xl text-sm font-medium animate-fade-up">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {params.error === "gbp_denied"
              ? "Google Business Profile connection was cancelled."
              : "Something went wrong. Please try again."}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Reviews",
              value: totalReviews,
              color: "indigo" as const,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
              delay: 0,
            },
            {
              label: "Responses Posted",
              value: postedCount,
              color: "emerald" as const,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
              delay: 60,
            },
            {
              label: "Pending Approval",
              value: pendingCount,
              color: (pendingCount > 0 ? "amber" : "slate") as "amber" | "slate",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
              delay: 120,
            },
            {
              label: "Avg Rating",
              value: avgRating ? avgRating.toFixed(1) : "—",
              suffix: "/ 5",
              color: "amber" as const,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
              delay: 180,
            },
          ].map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Locations */}
        {locations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {locations.map((loc, i) => (
              <TiltCard
                key={loc.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-card-reveal"
                style={{ animationDelay: `${i * 100}ms` }}
                intensity={5}
              >
                {/* Location header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 animate-icon-float">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#0a1f35] text-[15px] leading-tight">{loc.name}</h2>
                      {loc.address && (
                        <p className="text-slate-400 text-xs mt-0.5">{loc.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <DeleteLocationButton locationId={loc.id} locationName={loc.name} />
                    {loc.subscription ? (
                      <Badge
                        variant={loc.subscription.status.toLowerCase() as "trialing" | "active" | "past_due" | "canceled"}
                      />
                    ) : (
                      <SubscribeButton locationId={loc.id} />
                    )}
                    {!loc.gbpToken && <ConnectGbpButton locationId={loc.id} />}
                  </div>
                </div>

                {/* Reviews */}
                <div className="px-6 py-4">
                  {loc.reviews.length === 0 ? (
                    <p className="text-slate-400 text-sm py-2">
                      {loc.gbpToken
                        ? "No reviews yet — we check every 15 minutes."
                        : "Connect your Google Business Profile to start monitoring reviews automatically."}
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {loc.reviews.map((review) => (
                        <div key={review.id} className="flex items-start gap-4 py-3.5 first:pt-1 last:pb-1">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 text-xs font-bold uppercase mt-0.5">
                            {review.reviewerName?.[0] ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-[13px] font-semibold text-[#0a1f35]">{review.reviewerName}</span>
                              <StarRating rating={review.rating} />
                              <span className="text-slate-400 text-[11px]">{formatRelativeTime(review.reviewDate)}</span>
                              <Badge variant={review.status.toLowerCase() as "pending" | "posted" | "dismissed"} />
                            </div>
                            {review.comment && (
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                          {review.status === "PENDING" && (
                            <Link
                              href={`/dashboard/reviews/${review.id}`}
                              className="flex-shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap hover:scale-[1.03]"
                            >
                              Review →
                            </Link>
                          )}
                        </div>
                      ))}
                      {loc._count.reviews > 3 && (
                        <div className="pt-3 pb-1">
                          <Link
                            href={`/dashboard/reviews?locationId=${loc.id}`}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            View all {loc._count.reviews} reviews →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const colorMap = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-500", value: "text-[#0a1f35]" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-500", value: "text-[#0a1f35]" },
  amber: { bg: "bg-amber-50", text: "text-amber-500", value: "text-amber-600" },
  slate: { bg: "bg-slate-50", text: "text-slate-400", value: "text-[#0a1f35]" },
};

function StatCard({
  label,
  value,
  suffix,
  icon,
  color = "indigo",
  delay = 0,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color?: keyof typeof colorMap;
  delay?: number;
}) {
  const c = colorMap[color];
  return (
    <TiltCard
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
      intensity={10}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 ${c.bg} rounded-xl flex items-center justify-center animate-icon-float`}>
          <svg className={`w-4 h-4 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight tabular-nums stat-number ${c.value}`}>
        {value}
        {suffix && <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>}
      </p>
    </TiltCard>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-scale-in">
      <div className="py-20 text-center px-8">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-float">
          <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-[#0a1f35] font-semibold text-lg mb-2 tracking-tight">Add your first location</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-7 leading-relaxed">
          Connect your Google Business Profile and we&apos;ll start monitoring and responding to reviews automatically.
        </p>
        <AddLocationButton />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
