import type { AuditResult } from "@/types/audit";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function fallbackSummary(result: AuditResult) {
  const topRecommendation = result.recommendations[0];

  if (!topRecommendation || result.monthlySavings === 0) {
    return "The current stack is broadly aligned with the provided team size and workflow. The main control to maintain is monthly seat review, especially for premium collaboration plans where assigned seats can drift beyond active usage.";
  }

  const categories = new Set(result.findings.map((finding) => finding.category));
  const drivers = [
    categories.has("tool-overlap") ? "overlapping tools" : null,
    categories.has("premium-tier") || categories.has("plan-fit")
      ? "plan rightsizing"
      : null,
    categories.has("seat-efficiency") ? "seat optimization" : null,
    categories.has("enterprise-overkill") ? "unused enterprise controls" : null,
  ].filter(Boolean);

  return `ModelMeter found ${currency.format(
    result.monthlySavings,
  )} in estimated monthly savings, led by ${topRecommendation.tool}. The main drivers are ${drivers.join(
    ", ",
  ) || "seat and plan hygiene"}, with recommendations focused on reducing duplicated spend patterns rather than changing tools without an operational reason.`;
}

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  try {
    const apiKey =
      process.env.NEXT_PUBLIC_MODEL_METER_SUMMARY_API_KEY ??
      process.env.MODEL_METER_SUMMARY_API_KEY;

    if (!apiKey) {
      return fallbackSummary(result);
    }

    const summaryPrompt = {
      monthlySavings: result.monthlySavings,
      yearlySavings: result.yearlySavings,
      findings: result.findings.map((finding) => ({
        tool: finding.tool,
        category: finding.category,
        severity: finding.severity,
        title: finding.title,
        estimatedWaste: finding.estimatedWaste,
      })),
    };

    void summaryPrompt;

    // Placeholder for a future server-side OpenAI/Anthropic route:
    // send summaryPrompt to a model and ask for one concise paragraph.
    // The model output must never modify calculations, plan choices, or savings.
    return fallbackSummary(result);
  } catch {
    return fallbackSummary(result);
  }
}
