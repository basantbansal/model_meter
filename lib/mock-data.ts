export type ToolName =
  | "Cursor"
  | "GitHub Copilot"
  | "Claude"
  | "ChatGPT"
  | "Gemini"
  | "OpenAI API"
  | "Anthropic API"
  | "Windsurf";

export type AuditTool = {
  id: number;
  tool: ToolName;
  plan: string;
  spend: string;
  seats: string;
};

export type ResultRecommendation = {
  tool: ToolName;
  currentSpend: number;
  projectedSpend: number;
  savings: number;
  share: number;
  severity: "High" | "Medium" | "Low";
  recommendation: string;
};

export const supportedTools: ToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Gemini",
  "OpenAI API",
  "Anthropic API",
  "Windsurf",
];

export const planOptions: Record<ToolName, string[]> = {
  Cursor: ["Hobby", "Pro", "Pro+", "Teams", "Enterprise"],
  "GitHub Copilot": ["Free", "Pro", "Pro+", "Business", "Enterprise"],
  Claude: ["Free", "Pro", "Team", "Enterprise"],
  ChatGPT: ["Free", "Plus", "Pro", "Business", "Enterprise"],
  Gemini: ["Free", "Advanced", "Workspace"],
  "OpenAI API": ["Pay as you go", "Scale tier", "Enterprise"],
  "Anthropic API": ["Build", "Scale", "Enterprise"],
  Windsurf: ["Free", "Pro", "Teams"],
};

export const primaryUseCases = [
  "Engineering productivity",
  "Customer support",
  "Content and marketing",
  "Data analysis",
  "Product automation",
  "Company-wide AI access",
];

export const mockResults = {
  monthlySpend: 4280,
  monthlySavings: 1260,
  yearlySavings: 15120,
  confidence: 87,
  teamSize: 32,
  summary:
    "Your largest savings opportunity is seat consolidation across coding assistants and moving intermittent API experiments into budget-capped projects.",
  recommendations: [
    {
      tool: "Cursor",
      currentSpend: 960,
      projectedSpend: 720,
      savings: 240,
      share: 19,
      severity: "Medium",
      recommendation:
        "Downgrade inactive Business seats and keep Pro only for weekly active engineers.",
    },
    {
      tool: "ChatGPT",
      currentSpend: 900,
      projectedSpend: 600,
      savings: 300,
      share: 24,
      severity: "High",
      recommendation:
        "Consolidate duplicate Plus accounts into a smaller Team workspace with shared billing.",
    },
    {
      tool: "OpenAI API",
      currentSpend: 1620,
      projectedSpend: 1050,
      savings: 570,
      share: 45,
      severity: "High",
      recommendation:
        "Add project budgets, route low-risk jobs to smaller models, and archive unused keys.",
    },
    {
      tool: "GitHub Copilot",
      currentSpend: 800,
      projectedSpend: 650,
      savings: 150,
      share: 12,
      severity: "Low",
      recommendation:
        "Remove seats with no recent IDE activity before the next billing cycle.",
    },
  ] satisfies ResultRecommendation[],
};
