import { findPlan, getPlansForTool } from "@/lib/pricing";
import type {
  AuditFinding,
  AuditInput,
  AuditRecommendation,
  AuditResult,
  AuditToolInput,
  PlanMetadata,
  RecommendationSeverity,
  WasteCategory,
} from "@/types/audit";

const codingTools = new Set(["Cursor", "GitHub Copilot", "Windsurf"]);
const generalAssistants = new Set(["Claude", "ChatGPT", "Gemini"]);
const apiTools = new Set(["OpenAI API", "Anthropic API"]);

type PlanScore = {
  plan: PlanMetadata;
  score: number;
  reasons: string[];
};

type EvaluationContext = {
  input: AuditInput;
  tool: AuditToolInput;
  currentPlan?: PlanMetadata;
  recommendedPlan?: PlanMetadata;
  selectedTools: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeMoney(value: number) {
  return Math.max(0, Math.round(value));
}

function countTools(input: AuditInput, group: Set<string>) {
  return input.tools.filter((tool) => group.has(tool.tool)).length;
}

function getPlanRangeDistance(plan: PlanMetadata, teamSize: number) {
  const max = plan.intendedTeamSize.max ?? Number.POSITIVE_INFINITY;

  if (teamSize >= plan.intendedTeamSize.min && teamSize <= max) {
    return 0;
  }

  if (teamSize < plan.intendedTeamSize.min) {
    return plan.intendedTeamSize.min - teamSize;
  }

  return Number.isFinite(max) ? teamSize - max : 0;
}

function evaluateTeamFit(plan: PlanMetadata, input: AuditInput) {
  const distance = getPlanRangeDistance(plan, input.teamSize);

  if (distance === 0) {
    return 35;
  }

  return clamp(18 - distance * 2, -35, 18);
}

function evaluateUseCaseFit(plan: PlanMetadata, input: AuditInput) {
  let score = plan.idealUseCases.includes(input.primaryUseCase) ? 24 : 0;

  if (input.primaryUseCase === "Engineering productivity" && plan.codingFocused) {
    score += 12;
  }

  if (input.primaryUseCase !== "Engineering productivity" && plan.codingFocused) {
    score -= 12;
  }

  return score;
}

function evaluateGovernanceFit(plan: PlanMetadata, input: AuditInput) {
  const needsAdmin =
    input.teamSize >= 10 || input.primaryUseCase === "Company-wide AI access";
  const needsEnterpriseSecurity =
    input.teamSize >= 100 || input.primaryUseCase === "Product automation";

  let score = 0;

  if (plan.features.adminControls === needsAdmin) {
    score += 12;
  }

  if (plan.features.analytics && input.teamSize >= 25) {
    score += 6;
  }

  if (plan.security.auditLogs && !needsEnterpriseSecurity) {
    score -= 14;
  }

  if (plan.enterpriseFocused && !needsEnterpriseSecurity) {
    score -= 24;
  }

  if (plan.enterpriseFocused && needsEnterpriseSecurity) {
    score += 18;
  }

  return score;
}

function evaluateSeatEfficiency(plan: PlanMetadata, tool: AuditToolInput) {
  const expectedSpend = plan.monthlyPrice * tool.seats;

  if (plan.monthlyPrice === 0 || expectedSpend === 0 || tool.monthlySpend === 0) {
    return 0;
  }

  const overspendRatio = tool.monthlySpend / expectedSpend;

  if (overspendRatio > 1.6) {
    return 8;
  }

  if (overspendRatio < 0.65) {
    return -4;
  }

  return 4;
}

function scorePlan(input: AuditInput, tool: AuditToolInput, plan: PlanMetadata): PlanScore {
  const score =
    evaluateTeamFit(plan, input) +
    evaluateUseCaseFit(plan, input) +
    evaluateGovernanceFit(plan, input) +
    evaluateSeatEfficiency(plan, tool) -
    Math.min(plan.monthlyPrice / 10, 12);

  return {
    plan,
    score,
    reasons: [
      "team-size fit",
      "workflow fit",
      "governance fit",
      "price discipline",
    ],
  };
}

function pickBestPlan(input: AuditInput, tool: AuditToolInput) {
  const plans = getPlansForTool(tool.tool);

  if (plans.length === 0) {
    return undefined;
  }

  return plans
    .map((plan) => scorePlan(input, tool, plan))
    .sort((a, b) => b.score - a.score)[0]?.plan;
}

function makeFinding(
  context: EvaluationContext,
  category: WasteCategory,
  severity: RecommendationSeverity,
  title: string,
  detail: string,
  estimatedWaste: number,
  scoreImpact: number,
): AuditFinding {
  return {
    id: `${context.tool.tool}-${category}-${title.toLowerCase().replaceAll(" ", "-")}`,
    tool: context.tool.tool,
    category,
    severity,
    title,
    detail,
    estimatedWaste: normalizeMoney(estimatedWaste),
    scoreImpact,
  };
}

function evaluatePlanFit(context: EvaluationContext) {
  const { input, tool, currentPlan, recommendedPlan } = context;
  const findings: AuditFinding[] = [];

  if (!currentPlan) {
    if (getPlansForTool(tool.tool).length === 0) {
      findings.push(
        makeFinding(
          context,
          "unpriced-tool",
          "Low",
          "Pricing metadata unavailable",
          "ModelMeter does not yet have structured pricing for this tool, so it only evaluates overlap and reported spend.",
          Math.round(tool.monthlySpend * 0.05),
          4,
        ),
      );
    }

    return findings;
  }

  const distance = getPlanRangeDistance(currentPlan, input.teamSize);

  if (distance > 0) {
    findings.push(
      makeFinding(
        context,
        "plan-fit",
        distance > 50 ? "High" : "Medium",
        "Plan does not match team size",
        `${currentPlan.planName} is designed for a different team-size band than the ${input.teamSize}-person profile provided.`,
        Math.round(tool.monthlySpend * clamp(distance / 100, 0.08, 0.25)),
        distance > 50 ? 18 : 10,
      ),
    );
  }

  if (
    recommendedPlan &&
    currentPlan.planName !== recommendedPlan.planName &&
    currentPlan.monthlyPrice > recommendedPlan.monthlyPrice &&
    recommendedPlan.monthlyPrice > 0
  ) {
    findings.push(
      makeFinding(
        context,
        "premium-tier",
        currentPlan.monthlyPrice / recommendedPlan.monthlyPrice > 2 ? "High" : "Medium",
        "Lower-cost tier appears sufficient",
        `${recommendedPlan.planName} better matches the team profile and use case than ${currentPlan.planName}.`,
        Math.max(0, (currentPlan.monthlyPrice - recommendedPlan.monthlyPrice) * tool.seats),
        14,
      ),
    );
  }

  return findings;
}

function evaluateEnterpriseOverkill(context: EvaluationContext) {
  const { input, tool, currentPlan } = context;

  if (!currentPlan?.enterpriseFocused || input.teamSize >= 100) {
    return [];
  }

  const securityFlags = [
    currentPlan.security.auditLogs,
    currentPlan.security.scim,
    currentPlan.security.customRetention,
    currentPlan.features.analytics,
  ].filter(Boolean).length;

  return [
    makeFinding(
      context,
      "enterprise-overkill",
      input.teamSize < 25 ? "High" : "Medium",
      "Enterprise controls may be oversized",
      `The current plan includes ${securityFlags} enterprise-oriented control areas that smaller teams often do not fully use yet.`,
      Math.round(tool.monthlySpend * (input.teamSize < 25 ? 0.3 : 0.18)),
      input.teamSize < 25 ? 22 : 14,
    ),
  ];
}

function evaluateToolOverlap(context: EvaluationContext) {
  const { input, tool } = context;
  const codingOverlap = countTools(input, codingTools);
  const assistantOverlap = countTools(input, generalAssistants);
  const apiOverlap = countTools(input, apiTools);
  const findings: AuditFinding[] = [];

  if (codingTools.has(tool.tool) && codingOverlap > 1) {
    findings.push(
      makeFinding(
        context,
        "tool-overlap",
        "Medium",
        "Redundant coding assistant coverage",
        "Multiple coding assistants are active. Assigning one primary coding assistant and limiting secondary tools to specific teams can reduce duplicate seats.",
        Math.round(tool.monthlySpend * 0.18),
        12,
      ),
    );
  }

  if (generalAssistants.has(tool.tool) && assistantOverlap > 1) {
    findings.push(
      makeFinding(
        context,
        "tool-overlap",
        "Medium",
        "Overlapping general assistant subscriptions",
        "Two or more broad AI assistants can cover similar knowledge-work jobs. Consolidating light users can reduce duplicated subscriptions.",
        Math.round(tool.monthlySpend * 0.16),
        11,
      ),
    );
  }

  if (apiTools.has(tool.tool) && apiOverlap > 1) {
    findings.push(
      makeFinding(
        context,
        "tool-overlap",
        "Low",
        "Parallel API providers need budget ownership",
        "Multiple model APIs can be useful, but each should have a clear owner, budget cap, and workload purpose.",
        Math.round(tool.monthlySpend * 0.08),
        6,
      ),
    );
  }

  return findings;
}

function evaluateUseCaseFitForTool(context: EvaluationContext) {
  const { input, tool, currentPlan } = context;

  if (
    input.primaryUseCase === "Engineering productivity" &&
    generalAssistants.has(tool.tool) &&
    countTools(input, codingTools) > 0
  ) {
    return [
      makeFinding(
        context,
        "workflow-fit",
        "Low",
        "Clarify assistant ownership for engineering work",
        "For engineering-heavy teams, general-purpose assistants should have a defined role beside coding-specialized tools.",
        Math.round(tool.monthlySpend * 0.08),
        5,
      ),
    ];
  }

  if (
    currentPlan?.codingFocused &&
    input.primaryUseCase !== "Engineering productivity" &&
    input.primaryUseCase !== "Company-wide AI access"
  ) {
    return [
      makeFinding(
        context,
        "workflow-fit",
        "Medium",
        "Coding-focused plan may not match primary workflow",
        "The selected plan is optimized for software development, while the stated primary use case points elsewhere.",
        Math.round(tool.monthlySpend * 0.12),
        9,
      ),
    ];
  }

  return [];
}

function evaluateSeatEfficiencyForTool(context: EvaluationContext) {
  const { input, tool, currentPlan } = context;

  if (!currentPlan || tool.seats <= input.teamSize) {
    return [];
  }

  const excessSeats = tool.seats - input.teamSize;
  const unitPrice = currentPlan.monthlyPrice || tool.monthlySpend / tool.seats;

  return [
    makeFinding(
      context,
      "seat-efficiency",
      excessSeats >= 10 ? "High" : "Medium",
      "Purchased seats exceed team size",
      `${tool.seats} seats were entered for a ${input.teamSize}-person team. This suggests inactive, duplicate, or unassigned seats may exist.`,
      excessSeats * unitPrice,
      excessSeats >= 10 ? 18 : 10,
    ),
  ];
}

function getProjectedSpend(
  tool: AuditToolInput,
  currentPlan: PlanMetadata | undefined,
  recommendedPlan: PlanMetadata | undefined,
  findings: AuditFinding[],
) {
  const hasFinancialPlanChange =
    currentPlan &&
    recommendedPlan &&
    currentPlan.planName !== recommendedPlan.planName &&
    currentPlan.monthlyPrice > recommendedPlan.monthlyPrice &&
    recommendedPlan.monthlyPrice > 0;
  const planSpend = hasFinancialPlanChange
    ? recommendedPlan.monthlyPrice * tool.seats
    : tool.monthlySpend;
  const findingWaste = findings.reduce((sum, finding) => sum + finding.estimatedWaste, 0);
  const cappedWaste = Math.min(findingWaste, tool.monthlySpend * 0.55);

  return normalizeMoney(
    Math.max(
      0,
      Math.min(tool.monthlySpend, planSpend, tool.monthlySpend - cappedWaste),
    ),
  );
}

function severityFromSavings(savings: number, spend: number): RecommendationSeverity {
  const ratio = spend > 0 ? savings / spend : 0;

  if (savings >= 500 || ratio >= 0.35) {
    return "High";
  }

  if (savings >= 100 || ratio >= 0.15) {
    return "Medium";
  }

  return "Low";
}

function buildRecommendationText(
  tool: AuditToolInput,
  currentPlan: PlanMetadata | undefined,
  recommendedPlan: PlanMetadata | undefined,
  savings: number,
  findings: AuditFinding[],
) {
  const sortedFindings = [...findings].sort((a, b) => b.scoreImpact - a.scoreImpact);
  const topFinding = sortedFindings[0];
  const hasFinancialPlanChange =
    currentPlan &&
    recommendedPlan &&
    currentPlan.planName !== recommendedPlan.planName &&
    currentPlan.monthlyPrice > recommendedPlan.monthlyPrice &&
    recommendedPlan.monthlyPrice > 0;

  if (savings <= 0 || !topFinding) {
    return {
      title: `${tool.tool} looks reasonably aligned`,
      optimizationAction: "Maintain current plan and review seat activity monthly",
      explanation:
        "Current spend is close to the pricing benchmark for the provided team size and use case. Continue reviewing assigned seats before renewals.",
    };
  }

  if (topFinding.category === "seat-efficiency") {
    return {
      title: "Reduce inactive or unassigned seats",
      optimizationAction: "Remove excess seats before the next billing cycle",
      explanation: `${topFinding.detail} Savings come from lowering billed seat count, not changing the core plan.`,
    };
  }

  if (topFinding.category === "tool-overlap") {
    return {
      title: codingTools.has(tool.tool)
        ? "Standardize coding assistant usage"
        : "Consolidate overlapping assistant usage",
      optimizationAction: codingTools.has(tool.tool)
        ? "Assign one primary coding assistant and limit secondary seats"
        : "Consolidate light users onto fewer general-purpose assistants",
      explanation: `${topFinding.detail} Savings come from reducing duplicate coverage and lightly used seats.`,
    };
  }

  if (topFinding.category === "enterprise-overkill") {
    return {
      title: "Reduce unused enterprise overhead",
      optimizationAction: hasFinancialPlanChange
        ? `Move eligible users from ${currentPlan?.planName} to ${recommendedPlan?.planName}`
        : "Review enterprise controls and remove seats that do not need them",
      explanation: `${topFinding.detail} Savings are modeled from reducing premium governance overhead for users who do not need it.`,
    };
  }

  if (hasFinancialPlanChange) {
    return {
      title: "Move light users to a lower-cost tier",
      optimizationAction: `Move eligible users from ${currentPlan.planName} to ${recommendedPlan.planName}`,
      explanation: `${topFinding.detail} Savings are based on the price difference between the current tier and the lower-cost tier for the entered seat count.`,
    };
  }

  return {
    title: topFinding.title,
    optimizationAction: "Review usage ownership and reduce avoidable spend",
    explanation: `${topFinding.detail} Savings are modeled from operational cleanup rather than a direct plan change.`,
  };
}

function evaluateTool(input: AuditInput, tool: AuditToolInput) {
  const currentPlan = findPlan(tool.tool, tool.plan);
  const recommendedPlan = pickBestPlan(input, tool) ?? currentPlan;
  const context: EvaluationContext = {
    input,
    tool,
    currentPlan,
    recommendedPlan,
    selectedTools: input.tools.map((item) => item.tool),
  };
  const findings = [
    ...evaluatePlanFit(context),
    ...evaluateEnterpriseOverkill(context),
    ...evaluateToolOverlap(context),
    ...evaluateUseCaseFitForTool(context),
    ...evaluateSeatEfficiencyForTool(context),
  ];
  const projectedSpend = getProjectedSpend(tool, currentPlan, recommendedPlan, findings);
  const savings = normalizeMoney(tool.monthlySpend - projectedSpend);
  const severity = severityFromSavings(savings, tool.monthlySpend);
  const copy = buildRecommendationText(
    tool,
    currentPlan,
    recommendedPlan,
    savings,
    findings,
  );
  const hasFinancialPlanChange =
    currentPlan &&
    recommendedPlan &&
    currentPlan.planName !== recommendedPlan.planName &&
    currentPlan.monthlyPrice > recommendedPlan.monthlyPrice &&
    recommendedPlan.monthlyPrice > 0;

  return {
    tool: tool.tool,
    title: copy.title,
    explanation: copy.explanation,
    optimizationAction: copy.optimizationAction,
    currentPlan: tool.plan,
    recommendedPlan: hasFinancialPlanChange ? recommendedPlan.planName : undefined,
    currentSpend: normalizeMoney(tool.monthlySpend),
    projectedSpend,
    savings,
    severity,
    recommendation: copy.explanation,
    findings,
  } satisfies Omit<AuditRecommendation, "share">;
}

export function runAudit(input: AuditInput): AuditResult {
  const normalizedInput: AuditInput = {
    ...input,
    teamSize: Math.max(1, Math.round(input.teamSize)),
    tools: input.tools.map((tool) => ({
      ...tool,
      seats: Math.max(1, Math.round(tool.seats)),
      monthlySpend: normalizeMoney(tool.monthlySpend),
    })),
  };
  const monthlySpend = normalizeMoney(
    normalizedInput.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0),
  );
  const recommendationsWithoutShare = normalizedInput.tools.map((tool) =>
    evaluateTool(normalizedInput, tool),
  );
  const monthlySavings = normalizeMoney(
    recommendationsWithoutShare.reduce((sum, item) => sum + item.savings, 0),
  );
  const recommendations = recommendationsWithoutShare
    .map((item) => ({
      ...item,
      share:
        monthlySavings > 0 ? Math.round((item.savings / monthlySavings) * 100) : 0,
    }))
    .sort((a, b) => b.savings - a.savings);
  const findings = recommendations.flatMap((recommendation) => recommendation.findings);
  const primarySavingsDriver =
    recommendations.find((recommendation) => recommendation.savings > 0)?.title ??
    "No major waste detected";

  return {
    input: normalizedInput,
    monthlySpend,
    monthlySavings,
    yearlySavings: monthlySavings * 12,
    primarySavingsDriver,
    summary: "",
    findings,
    recommendations,
  };
}

export function createDemoAuditInput(): AuditInput {
  return {
    teamSize: 32,
    primaryUseCase: "Engineering productivity",
    tools: [
      { tool: "Cursor", plan: "Teams", monthlySpend: 960, seats: 24 },
      { tool: "ChatGPT", plan: "Business", monthlySpend: 900, seats: 30 },
      { tool: "Claude", plan: "Team", monthlySpend: 650, seats: 18 },
      { tool: "GitHub Copilot", plan: "Business", monthlySpend: 800, seats: 32 },
    ],
  };
}
