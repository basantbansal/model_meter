import { getAuditById } from "@/lib/audits";
import { createLead } from "@/lib/leads";
import { sendLeadConfirmationEmail } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";

type LeadRequestBody = {
  auditId?: string;
  email?: string;
  companyName?: string;
  role?: string;
  teamSize?: number | string | null;
  website?: string;
};

function normalizeTeamSize(value: LeadRequestBody["teamSize"]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LeadRequestBody | null;

  if (!body) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bot submissions look successful but are never stored or emailed.
  if (body.website?.trim()) {
    return Response.json({ ok: true, emailStatus: "skipped" });
  }

  const auditId = body.auditId?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!auditId || !isUuid(auditId) || !email || !isValidEmail(email)) {
    return Response.json(
      { error: "A valid email and report are required." },
      { status: 400 },
    );
  }

  const { result, error } = await getAuditById(auditId);

  if (error || !result) {
    return Response.json(
      { error: "The report could not be loaded." },
      { status: 404 },
    );
  }

  const reportUrl = `${getSiteUrl()}/results/${auditId}`;
  const emailResult = await sendLeadConfirmationEmail({
    email,
    reportUrl,
    result,
  }).catch(() => ({
    status: "failed" as const,
    reason: "Email provider request failed.",
  }));

  try {
    await createLead({
      auditId,
      email,
      companyName: body.companyName,
      role: body.role,
      teamSize: normalizeTeamSize(body.teamSize),
      emailStatus: emailResult.status,
    });
  } catch (leadError) {
    const detail =
      leadError instanceof Error && process.env.NODE_ENV === "development"
        ? ` ${leadError.message}`
        : "";

    return Response.json(
      { error: `We could not save these contact details.${detail}` },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    emailStatus: emailResult.status,
    emailMessage:
      emailResult.status === "sent"
        ? "Confirmation email sent."
        : emailResult.status === "skipped"
          ? "Lead saved, but email delivery is not configured."
          : "Lead saved, but the confirmation email could not be sent.",
    emailDebug:
      process.env.NODE_ENV === "development" ? emailResult.reason : undefined,
  });
}
