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
  Cursor: ["Hobby", "Pro", "Pro+", "Business", "Teams", "Enterprise"],
  "GitHub Copilot": ["Free", "Individual", "Pro", "Pro+", "Business", "Enterprise"],
  Claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API direct"],
  ChatGPT: ["Free", "Plus", "Pro", "Team", "Business", "Enterprise", "API direct"],
  Gemini: ["Free", "Pro", "Ultra", "API"],
  "OpenAI API": ["Pay as you go", "Scale tier", "Enterprise"],
  "Anthropic API": ["Build", "Scale", "Enterprise"],
  Windsurf: ["Free", "Pro", "Teams"],
};

export const primaryUseCases = [
  "Engineering productivity",
  "Customer support",
  "Content and marketing",
  "Data analysis",
  "Research",
  "Mixed usage",
  "Product automation",
  "Company-wide AI access",
];
