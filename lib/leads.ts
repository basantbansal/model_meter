import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { LeadInsert, LeadRow } from "@/types/database";

export type LeadCaptureInput = {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number | null;
  emailStatus?: LeadRow["email_status"];
};

export async function createLead(input: LeadCaptureInput) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const payload: LeadInsert = {
    audit_id: input.auditId,
    email: input.email.trim().toLowerCase(),
    company_name: input.companyName?.trim() || null,
    role: input.role?.trim() || null,
    team_size: input.teamSize ?? null,
    email_status: input.emailStatus ?? "skipped",
  };

  const { error } = await supabase.from("leads").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  return { emailStatus: payload.email_status } as const;
}
