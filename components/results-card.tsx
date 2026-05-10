import { ArrowDownRight } from "lucide-react";

import type { AuditRecommendation } from "@/types/audit";
import { cn } from "@/lib/utils";

const severityStyles: Record<AuditRecommendation["severity"], string> = {
  High: "border-teal-200 bg-teal-50 text-teal-800",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ResultsCard({
  recommendation,
}: {
  recommendation: AuditRecommendation;
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">
            {recommendation.title}
          </h3>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {recommendation.explanation}
          </p>
          <p className="mt-2 text-xs text-stone-400">
            {recommendation.tool}: {recommendation.optimizationAction}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
            severityStyles[recommendation.severity],
          )}
        >
          {recommendation.severity}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="text-xs text-stone-500">Current</p>
          <p className="mt-1 font-semibold">
            {currency.format(recommendation.currentSpend)}
          </p>
        </div>
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="text-xs text-stone-500">Projected</p>
          <p className="mt-1 font-semibold">
            {currency.format(recommendation.projectedSpend)}
          </p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3 text-teal-800">
          <p className="flex items-center gap-1 text-xs">
            <ArrowDownRight className="size-3.5" />
            Saves
          </p>
          <p className="mt-1 font-semibold">
            {currency.format(recommendation.savings)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-teal-700"
          style={{ width: `${recommendation.share}%` }}
        />
      </div>
    </article>
  );
}
