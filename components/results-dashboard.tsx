"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  MessageSquareText,
  Share2,
  TrendingDown,
} from "lucide-react";

import { LeadCaptureCard } from "@/components/lead-capture-card";
import { ResultsCard } from "@/components/results-card";
import { SavingsChart } from "@/components/savings-chart";
import { Button } from "@/components/ui/button";
import type { AuditResult } from "@/types/audit";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ResultsDashboard({
  auditResult,
  auditId,
  shareUrl,
}: {
  auditResult: AuditResult;
  auditId: string;
  shareUrl: string;
}) {
  const [shareMessage, setShareMessage] = useState("");
  const hasSavings = auditResult.monthlySavings > 0;
  const hasHighSavings = auditResult.monthlySavings > 500;
  const findingCategories = new Set(
    auditResult.findings.map((finding) => finding.category),
  );
  const operatingChecks = [
    findingCategories.has("seat-efficiency") ||
    findingCategories.has("premium-tier")
      ? "Review seat assignment before renewal"
      : null,
    findingCategories.has("tool-overlap")
      ? "Assign ownership for overlapping tools"
      : null,
    findingCategories.has("workflow-fit")
      ? "Confirm tool fit against the primary workflow"
      : null,
    findingCategories.has("spend-normalization")
      ? "Reconcile monthly versus annual billing"
      : null,
    findingCategories.has("enterprise-overkill")
      ? "Validate enterprise controls before renewal"
      : null,
  ].filter((item): item is string => Boolean(item));
  const checks =
    operatingChecks.length > 0
      ? operatingChecks
      : ["Review active seats monthly", "Keep billing owners assigned"];

  async function copyShareUrl() {
    if (!navigator.clipboard) {
      setShareMessage("Copy is not available in this browser.");
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareMessage("Report link copied.");
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="ModelMeter home">
            <span className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-sm font-semibold text-teal-800 shadow-sm">
              M
            </span>
            <span className="text-sm font-semibold tracking-tight">ModelMeter</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="hidden bg-background sm:inline-flex"
              onClick={copyShareUrl}
              aria-label="Copy shareable report link"
            >
              <Share2 className="size-4" />
              Share
            </Button>
            <Button asChild variant="outline" className="hidden bg-background sm:inline-flex">
              <a href={`/api/reports/${auditId}/pdf`}>
                <Download className="size-4" />
                PDF
              </a>
            </Button>
            <Button asChild variant="outline" className="bg-background">
              <Link href="/">
                <ArrowLeft className="size-4" />
                New audit
              </Link>
            </Button>
          </div>
        </header>

        <section className="py-7 sm:py-10">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_24px_70px_rgba(87,83,78,0.14)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800">
                  <TrendingDown className="size-3.5" />
                  {hasSavings ? "Savings found" : "Benchmark review complete"}
                </div>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {hasSavings
                    ? `You could save ${currency.format(auditResult.monthlySavings)} per month.`
                    : "No major waste detected."}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-stone-500">
                  {hasSavings
                    ? "Shareable AI spend report with savings, recommendations, and tool-level benchmarks."
                    : "The report still includes operational checks and plan-fit context without forcing a savings claim."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium text-stone-500">
                    Current monthly spend
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {currency.format(auditResult.monthlySpend)}
                  </p>
                </div>
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900">
                  <p className="text-xs font-medium">Estimated yearly savings</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {currency.format(auditResult.yearlySavings)}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium text-stone-500">
                    Primary savings driver
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-6">
                    {auditResult.primarySavingsDriver}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <SavingsChart data={auditResult.recommendations} />

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 px-5 py-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Savings breakdown
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <caption className="sr-only">
                    Tool-level current spend, projected spend, savings, and savings share.
                  </caption>
                  <thead className="bg-stone-50 text-left text-xs font-medium text-stone-500">
                    <tr>
                      <th className="px-5 py-3">Tool</th>
                      <th className="px-5 py-3">Current</th>
                      <th className="px-5 py-3">Projected</th>
                      <th className="px-5 py-3">Savings</th>
                      <th className="px-5 py-3">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {auditResult.recommendations.map((item) => (
                      <tr key={item.tool}>
                        <td className="px-5 py-3 font-medium">{item.tool}</td>
                        <td className="px-5 py-3 text-stone-500">
                          {currency.format(item.currentSpend)}
                        </td>
                        <td className="px-5 py-3 text-stone-500">
                          {currency.format(item.projectedSpend)}
                        </td>
                        <td className="px-5 py-3 font-medium text-teal-800">
                          {currency.format(item.savings)}
                        </td>
                        <td className="px-5 py-3 text-stone-500">{item.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Recommendations
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Prioritized by savings size and billing impact.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {auditResult.recommendations.map((recommendation) => (
                <ResultsCard
                  key={recommendation.tool}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <LeadCaptureCard
              auditId={auditId}
              teamSize={auditResult.input.teamSize}
              monthlySavings={auditResult.monthlySavings}
            />

            {hasHighSavings ? (
              <div className="rounded-2xl border border-teal-950 bg-teal-950 p-5 text-white shadow-xl shadow-stone-300/60">
                <h2 className="text-lg font-semibold tracking-tight">
                  High-savings case
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  This audit found more than $500 per month in modeled savings.
                  Credex can help review discounted credits and renewal options for
                  the tools behind this report.
                </p>
                <Button asChild className="mt-5 h-11 w-full bg-white text-zinc-950 hover:bg-zinc-100">
                  <a href="https://credex.rocks" target="_blank" rel="noreferrer">
                    Book Credex consultation
                  </a>
                </Button>
              </div>
            ) : null}

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-stone-100">
                <MessageSquareText className="size-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                Audit summary
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                {auditResult.summary}
              </p>
              <div className="mt-5 space-y-3 text-sm">
                {checks.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-teal-950 bg-teal-950 p-5 text-white shadow-xl shadow-stone-300/60">
              <h2 className="text-lg font-semibold tracking-tight">
                Export or forward the report
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Use the PDF for procurement reviews or copy the saved report link for quick team discussion.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <Button asChild className="h-11 bg-white text-zinc-950 hover:bg-zinc-100">
                  <a
                    href={`/api/reports/${auditId}/pdf`}
                    aria-label="Download ModelMeter PDF report"
                  >
                    <Download className="size-4" />
                    Download PDF
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyShareUrl}
                  className="h-11 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Share2 className="size-4" />
                  Copy link
                </Button>
              </div>
              {shareMessage ? (
                <p className="mt-3 text-xs text-zinc-300" role="status">
                  {shareMessage}
                </p>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
