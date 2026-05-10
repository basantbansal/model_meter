"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MessageSquareText,
  Share2,
  TrendingDown,
} from "lucide-react";

import { ResultsCard } from "@/components/results-card";
import { SavingsChart } from "@/components/savings-chart";
import { Button } from "@/components/ui/button";
import { createDemoAuditInput, runAudit } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/generate-summary";
import type { AuditResult } from "@/types/audit";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function DemoResultsPage() {
  const [auditResult, setAuditResult] = useState<AuditResult>(() =>
    runAudit(createDemoAuditInput()),
  );

  useEffect(() => {
    let mounted = true;

    async function loadAuditResult() {
      const storedResult = sessionStorage.getItem("modelmeter:audit-result");

      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult) as AuditResult;

          if (mounted) {
            setAuditResult(parsedResult);
          }

          return;
        } catch {
          sessionStorage.removeItem("modelmeter:audit-result");
        }
      }

      const demoResult = runAudit(createDemoAuditInput());
      const summary = await generateAuditSummary(demoResult);

      if (mounted) {
        setAuditResult({ ...demoResult, summary });
      }
    }

    loadAuditResult();

    return () => {
      mounted = false;
    };
  }, []);

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
            <Button variant="outline" className="hidden bg-background sm:inline-flex">
              <Share2 className="size-4" />
              Share
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
                  Savings found
                </div>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  You could save {currency.format(auditResult.monthlySavings)} per month.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-stone-500">
                  Audit based on a {auditResult.input.teamSize}-person team using AI
                  for {auditResult.input.primaryUseCase.toLowerCase()}.
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
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-stone-100">
                <MessageSquareText className="size-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                AI-generated summary
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                {auditResult.summary}
              </p>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  "Review inactive seats before renewals",
                  "Set budget caps on API projects",
                  "Consolidate duplicate assistant subscriptions",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-teal-950 bg-teal-950 p-5 text-white shadow-xl shadow-stone-300/60">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white/10">
                <CalendarDays className="size-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                High savings detected
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Credex can help convert this audit into a 30-minute cost-control
                plan for billing owners and engineering leads.
              </p>
              <Button className="mt-5 h-11 w-full bg-white text-zinc-950 hover:bg-zinc-100">
                Book Credex consultation
              </Button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
