export type SupportedAuditTool =
  | "Claude"
  | "ChatGPT"
  | "Cursor"
  | "GitHub Copilot"
  | "Gemini"
  | "OpenAI API"
  | "Anthropic API"
  | "Windsurf";

export type AuditUseCase =
  | "Engineering productivity"
  | "Customer support"
  | "Content and marketing"
  | "Data analysis"
  | "Product automation"
  | "Company-wide AI access";

export type AuditToolInput = {
  tool: SupportedAuditTool;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  primaryUseCase: AuditUseCase;
  tools: AuditToolInput[];
};

export type PricedAuditTool = "Claude" | "ChatGPT" | "Cursor" | "GitHub Copilot";

export type RecommendationSeverity = "High" | "Medium" | "Low";

export type WasteCategory =
  | "plan-fit"
  | "seat-efficiency"
  | "tool-overlap"
  | "enterprise-overkill"
  | "premium-tier"
  | "workflow-fit"
  | "unpriced-tool";

export type UsageIntensity = "light" | "standard" | "heavy" | "enterprise";

export type PlanMetadata = {
  tool: PricedAuditTool;
  planName: string;
  monthlyPrice: number;
  intendedTeamSize: {
    min: number;
    max: number | null;
  };
  features: {
    collaboration: boolean;
    adminControls: boolean;
    sso: boolean;
    analytics: boolean;
    connectors: boolean;
  };
  security: {
    dataControls: boolean;
    auditLogs: boolean;
    scim: boolean;
    ipIndemnity: boolean;
    customRetention: boolean;
  };
  idealUseCases: AuditUseCase[];
  codingFocused: boolean;
  usageIntensity: UsageIntensity;
  enterpriseFocused: boolean;
  description: string;
};

export type AuditFinding = {
  id: string;
  tool: SupportedAuditTool;
  severity: RecommendationSeverity;
  category: WasteCategory;
  title: string;
  detail: string;
  estimatedWaste: number;
  scoreImpact: number;
};

export type AuditRecommendation = {
  tool: SupportedAuditTool;
  title: string;
  explanation: string;
  optimizationAction: string;
  currentPlan: string;
  recommendedPlan?: string;
  currentSpend: number;
  projectedSpend: number;
  savings: number;
  share: number;
  severity: RecommendationSeverity;
  recommendation: string;
  findings: AuditFinding[];
};

export type AuditResult = {
  input: AuditInput;
  monthlySpend: number;
  monthlySavings: number;
  yearlySavings: number;
  primarySavingsDriver: string;
  summary: string;
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
};
