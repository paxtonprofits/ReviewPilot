import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManageBillingButton } from "@/components/dashboard/manage-billing-button";
import { SubscribeButton } from "@/components/dashboard/subscribe-button";

export const metadata = { title: "Billing — ReviewPilot" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await auth();

  const locations = await db.businessLocation.findMany({
    where: { userId: session!.user!.id },
    include: { subscription: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0d253d] mb-2">Billing</h1>
      <p className="text-slate-500 text-sm mb-8">
        $49/month per location · 7-day free trial · Cancel anytime
      </p>

      <div className="space-y-4">
        {locations.map((loc) => {
          const sub = loc.subscription;
          const status = sub?.status?.toLowerCase() as
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | undefined;

          return (
            <Card key={loc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-[#0d253d]">{loc.name}</h2>
                    {loc.address && (
                      <p className="text-slate-400 text-sm mt-0.5">{loc.address}</p>
                    )}
                  </div>
                  {status && <Badge variant={status} />}
                </div>
              </CardHeader>
              <CardBody>
                {!sub ? (
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">No active subscription</p>
                    <SubscribeButton locationId={loc.id} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      {sub.status === "TRIALING" && sub.trialEndsAt && (
                        <span>
                          Free trial ends{" "}
                          <strong className="text-[#0d253d]">
                            {new Date(sub.trialEndsAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </strong>
                        </span>
                      )}
                      {sub.status === "ACTIVE" && sub.currentPeriodEnd && (
                        <span>
                          Next billing{" "}
                          <strong className="text-[#0d253d]">
                            {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </strong>{" "}
                          · $49/mo
                        </span>
                      )}
                      {sub.status === "PAST_DUE" && (
                        <span className="text-red-600 font-medium">Payment failed — update your card</span>
                      )}
                    </div>
                    {sub.stripeCustomerId && (
                      <ManageBillingButton locationId={loc.id} />
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}

        {locations.length === 0 && (
          <Card>
            <CardBody className="py-12 text-center">
              <p className="text-slate-400 text-sm">
                Add a location first to manage billing.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
