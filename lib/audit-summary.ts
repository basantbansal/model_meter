import type { AuditResult } from "@/types/audit";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function createFallbackAuditSummary(result: AuditResult) {
  const topRecommendation = result.recommendations[0];

  if (!topRecommendation || result.monthlySavings === 0) {
    const contextualFinding = result.findings[0];

    return contextualFinding
      ? `The current stack does not show a strong modeled savings case, but there is still a useful operating check: ${contextualFinding.detail} ModelMeter is treating this as a context review rather than forcing a downgrade that the inputs do not support.`
      : "The current stack is broadly aligned with the provided team size and workflow. The main control to maintain is monthly seat review, especially for premium collaboration plans where assigned seats can drift beyond active usage.";
  }

  const categories = new Set(result.findings.map((finding) => finding.category));
  const drivers = [
    categories.has("tool-overlap") ? "overlapping tools" : null,
    categories.has("premium-tier") || categories.has("plan-fit")
      ? "plan rightsizing"
      : null,
    categories.has("seat-efficiency") ? "seat optimization" : null,
    categories.has("spend-normalization") ? "billing normalization" : null,
    categories.has("enterprise-overkill") ? "unused enterprise controls" : null,
  ].filter(Boolean);

  return `ModelMeter found ${currency.format(
    result.monthlySavings,
  )} in estimated monthly savings, led by ${topRecommendation.tool}. The main drivers are ${drivers.join(
    ", ",
  ) || "seat and plan hygiene"}, with recommendations focused on reducing duplicated spend patterns rather than changing tools without an operational reason.`;
}

export function buildAuditSummaryPrompt(result: AuditResult) {
  return `Write a concise ~100-word audit summary for a startup founder or engineering manager.

Rules:
- Use only the deterministic audit data below.
- Do not invent pricing, tools, usage, benchmarks, confidence scores, or savings.
- Do not change any numbers.
- Make clear that savings are modeled estimates.
- Mention Credex only if monthly savings are over $500.
- Keep the tone operational and finance-friendly, not salesy.

Audit data:
Monthly spend: ${currency.format(result.monthlySpend)}
Modeled monthly savings: ${currency.format(result.monthlySavings)}
Modeled yearly savings: ${currency.format(result.yearlySavings)}
Primary savings driver: ${result.primarySavingsDriver}
Top recommendations:
${result.recommendations
  .slice(0, 4)
  .map(
    (recommendation) =>
      `- ${recommendation.tool}: ${recommendation.title}; ${currency.format(
        recommendation.savings,
      )}/mo modeled savings; action: ${recommendation.optimizationAction}`,
  )
  .join("\n")}`;
}
