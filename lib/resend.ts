import type { AuditResult } from "@/types/audit";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReportEmailHtml(result: AuditResult, reportUrl: string) {
  return `
    <div style="margin:0;background:#f7f4ef;padding:32px 16px;font-family:Arial,sans-serif;color:#1c1917;">
      <div style="margin:0 auto;max-width:640px;border:1px solid #e7e5e4;border-radius:20px;background:#ffffff;padding:28px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0f766e;">ModelMeter report ready</p>
        <h1 style="margin:0 0 14px;font-size:28px;line-height:1.2;">Your AI spend audit is saved.</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#57534e;">
          Thanks for reviewing your spend profile with ModelMeter. The report remains available at the secure share link below.
        </p>
        <div style="margin:0 0 22px;border:1px solid #ccfbf1;border-radius:16px;background:#f0fdfa;padding:18px;">
          <p style="margin:0 0 6px;font-size:13px;color:#115e59;">Estimated yearly savings</p>
          <p style="margin:0 0 10px;font-size:32px;font-weight:700;color:#134e4a;">${currency.format(result.yearlySavings)}</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#115e59;">
            ${currency.format(result.monthlySavings)} per month in modeled savings, led by ${escapeHtml(result.primarySavingsDriver)}.
          </p>
        </div>
        <a href="${escapeHtml(reportUrl)}" style="display:inline-block;border-radius:12px;background:#0f766e;padding:14px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
          Open shareable report
        </a>
        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#78716c;">
          This is a deterministic optimization estimate based on the inputs provided. Treat it as a practical review aid, not a procurement commitment.
        </p>
        ${
          result.monthlySavings > 500
            ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#115e59;">Because this audit shows more than $500/month in modeled savings, Credex may be able to help review discounted AI credits or renewal options.</p>`
            : ""
        }
      </div>
    </div>
  `;
}

export async function sendLeadConfirmationEmail({
  email,
  reportUrl,
  result,
}: {
  email: string;
  reportUrl: string;
  result: AuditResult;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "ModelMeter <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      status: "skipped" as const,
      reason: "RESEND_API_KEY is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `ModelMeter report: ${currency.format(result.yearlySavings)} in modeled yearly savings`,
      html: buildReportEmailHtml(result, reportUrl),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    return {
      status: "failed" as const,
      reason: detail || "Resend rejected the email request.",
    };
  }

  return { status: "sent" as const };
}
