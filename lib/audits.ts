import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { AuditResult } from "@/types/audit";
import type {
  AuditChartDatum,
  AuditInsert,
  AuditRow,
  StoredAuditPayload,
} from "@/types/database";

function createChartData(result: AuditResult): AuditChartDatum[] {
  return result.recommendations.map((recommendation) => ({
    tool: recommendation.tool,
    currentSpend: recommendation.currentSpend,
    projectedSpend: recommendation.projectedSpend,
    savings: recommendation.savings,
    share: recommendation.share,
  }));
}

function createStoredPayload(result: AuditResult): StoredAuditPayload {
  return {
    input: result.input,
    monthlySpend: result.monthlySpend,
    monthlySavings: result.monthlySavings,
    yearlySavings: result.yearlySavings,
    primarySavingsDriver: result.primarySavingsDriver,
    summary: result.summary,
    findings: result.findings,
    recommendations: result.recommendations,
    chartData: createChartData(result),
  };
}

function createAuditInsert(result: AuditResult): AuditInsert {
  const chartData = createChartData(result);

  return {
    team_size: result.input.teamSize,
    use_case: result.input.primaryUseCase,
    tool_selections: result.input.tools,
    findings: result.findings,
    recommendations: result.recommendations,
    chart_data: chartData,
    monthly_spend: result.monthlySpend,
    monthly_savings: result.monthlySavings,
    yearly_savings: result.yearlySavings,
    primary_savings_driver: result.primarySavingsDriver,
    generated_summary: result.summary,
    audit_payload: {
      ...createStoredPayload(result),
      chartData,
    },
  };
}

export function auditRowToResult(row: AuditRow): AuditResult {
  const payload = row.audit_payload;

  return {
    input: payload?.input ?? {
      teamSize: row.team_size,
      primaryUseCase: row.use_case,
      tools: row.tool_selections,
    },
    monthlySpend: payload?.monthlySpend ?? row.monthly_spend,
    monthlySavings: payload?.monthlySavings ?? row.monthly_savings,
    yearlySavings: payload?.yearlySavings ?? row.yearly_savings,
    primarySavingsDriver:
      payload?.primarySavingsDriver ?? row.primary_savings_driver,
    summary: payload?.summary ?? row.generated_summary,
    findings: payload?.findings ?? row.findings,
    recommendations: payload?.recommendations ?? row.recommendations,
  };
}

export async function createAudit(result: AuditResult) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase
    .from("audits")
    .insert(createAuditInsert(result))
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function getAuditById(id: string) {
  if (!hasSupabaseConfig()) {
    return {
      result: null,
      error: "Supabase environment variables are not configured.",
    };
  }

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      result: null,
      error: error.message,
    };
  }

  if (!data) {
    return {
      result: null,
      error: null,
    };
  }

  return {
    result: auditRowToResult(data),
    error: null,
  };
}
