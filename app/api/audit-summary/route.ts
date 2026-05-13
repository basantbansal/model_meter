import {
  buildAuditSummaryPrompt,
  createFallbackAuditSummary,
} from "@/lib/audit-summary";
import type { AuditResult } from "@/types/audit";

type SummaryRequestBody = {
  result?: AuditResult;
};

function isValidResult(result: SummaryRequestBody["result"]): result is AuditResult {
  return Boolean(
    result &&
      typeof result.monthlySpend === "number" &&
      typeof result.monthlySavings === "number" &&
      Array.isArray(result.recommendations),
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SummaryRequestBody | null;
  const result = body?.result;

  if (!isValidResult(result)) {
    return Response.json({ error: "Invalid audit result." }, { status: 400 });
  }

  const fallback = createFallbackAuditSummary(result);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ summary: fallback, source: "fallback" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022",
        max_tokens: 180,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: buildAuditSummaryPrompt(result),
          },
        ],
      }),
    });

    if (!response.ok) {
      return Response.json({ summary: fallback, source: "fallback" });
    }

    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const summary = payload.content
      ?.find((item) => item.type === "text")
      ?.text?.trim();

    return Response.json({
      summary: summary || fallback,
      source: summary ? "anthropic" : "fallback",
    });
  } catch {
    return Response.json({ summary: fallback, source: "fallback" });
  }
}
