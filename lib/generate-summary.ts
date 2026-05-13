import { createFallbackAuditSummary } from "@/lib/audit-summary";
import type { AuditResult } from "@/types/audit";

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  try {
    const response = await fetch("/api/audit-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });

    if (!response.ok) {
      return createFallbackAuditSummary(result);
    }

    const payload = (await response.json()) as { summary?: string };
    return payload.summary?.trim() || createFallbackAuditSummary(result);
  } catch {
    return createFallbackAuditSummary(result);
  }
}
