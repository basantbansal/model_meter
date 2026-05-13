import type {
  AuditFinding,
  AuditInput,
  AuditRecommendation,
  AuditToolInput,
  AuditUseCase,
} from "@/types/audit";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AuditChartDatum = {
  tool: AuditRecommendation["tool"];
  currentSpend: number;
  projectedSpend: number;
  savings: number;
  share: number;
};

export type StoredAuditPayload = {
  input: AuditInput;
  monthlySpend: number;
  monthlySavings: number;
  yearlySavings: number;
  primarySavingsDriver: string;
  summary: string;
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  chartData: AuditChartDatum[];
};

export type AuditRow = {
  id: string;
  created_at: string;
  team_size: number;
  use_case: AuditUseCase;
  tool_selections: AuditToolInput[];
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  chart_data: AuditChartDatum[];
  monthly_spend: number;
  monthly_savings: number;
  yearly_savings: number;
  primary_savings_driver: string;
  generated_summary: string;
  audit_payload: StoredAuditPayload;
};

export type AuditInsert = {
  id?: string;
  created_at?: string;
  team_size: number;
  use_case: AuditUseCase;
  tool_selections: AuditToolInput[];
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  chart_data: AuditChartDatum[];
  monthly_spend: number;
  monthly_savings: number;
  yearly_savings: number;
  primary_savings_driver: string;
  generated_summary: string;
  audit_payload: StoredAuditPayload;
};

export type AuditUpdate = Partial<AuditInsert>;

export type LeadRow = {
  id: string;
  created_at: string;
  audit_id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  email_status: "sent" | "skipped" | "failed";
};

export type LeadInsert = {
  id?: string;
  created_at?: string;
  audit_id: string;
  email: string;
  company_name?: string | null;
  role?: string | null;
  team_size?: number | null;
  email_status?: LeadRow["email_status"];
};

export type LeadUpdate = Partial<LeadInsert>;

export type Database = {
  public: {
    Tables: {
      audits: {
        Row: AuditRow;
        Insert: AuditInsert;
        Update: AuditUpdate;
        Relationships: [];
      };
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
