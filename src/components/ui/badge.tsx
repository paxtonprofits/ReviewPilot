import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type BadgeVariant = "pending" | "approved" | "posted" | "dismissed" | "trialing" | "active" | "past_due" | "canceled";

const variantStyles: Record<BadgeVariant, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  posted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dismissed: "bg-slate-50 text-slate-500 border-slate-200",
  trialing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  past_due: "bg-red-50 text-red-700 border-red-200",
  canceled: "bg-slate-50 text-slate-500 border-slate-200",
};

const labels: Record<BadgeVariant, string> = {
  pending: "Pending",
  approved: "Approved",
  posted: "Posted",
  dismissed: "Dismissed",
  trialing: "Free Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

export function Badge({ variant, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {labels[variant]}
    </span>
  );
}
