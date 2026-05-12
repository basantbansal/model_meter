"use client";

import { useState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ToolCard, fieldClass } from "@/components/tool-card";
import { createAudit } from "@/lib/audits";
import { runAudit } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/generate-summary";
import {
  planOptions,
  primaryUseCases,
  type AuditTool,
} from "@/lib/mock-data";
import type { AuditInput, AuditUseCase, SupportedAuditTool } from "@/types/audit";

function createTool(id: number): AuditTool {
  return {
    id,
    tool: "Cursor",
    plan: "Pro",
    spend: "",
    seats: "1",
  };
}

export function AuditForm() {
  const router = useRouter();
  const [toolRows, setToolRows] = useState<AuditTool[]>([createTool(1)]);
  const [teamSize, setTeamSize] = useState("");
  const [useCase, setUseCase] = useState(primaryUseCases[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateTool(id: number, updates: Partial<AuditTool>) {
    setToolRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const nextTool = updates.tool ?? row.tool;
        const currentPlan = updates.plan ?? row.plan;

        return {
          ...row,
          ...updates,
          plan: planOptions[nextTool].includes(currentPlan)
            ? currentPlan
            : planOptions[nextTool][0],
        };
      }),
    );
  }

  function addTool() {
    setToolRows((currentRows) => [...currentRows, createTool(Date.now())]);
  }

  function removeTool(id: number) {
    setToolRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows.filter((row) => row.id !== id),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setSubmitError("");

    try {
      const input: AuditInput = {
        teamSize: Math.max(1, Number(teamSize) || 1),
        primaryUseCase: useCase as AuditUseCase,
        tools: toolRows.map((row) => ({
          tool: row.tool as SupportedAuditTool,
          plan: row.plan,
          monthlySpend: Math.max(0, Number(row.spend) || 0),
          seats: Math.max(1, Number(row.seats) || 1),
        })),
      };

      const result = runAudit(input);
      const summary = await generateAuditSummary(result);
      const auditId = await createAudit({ ...result, summary });

      router.push(`/results/${auditId}`);
    } catch (error) {
      const detail =
        error instanceof Error && process.env.NODE_ENV === "development"
          ? ` ${error.message}`
          : "";

      setSubmitError(`We could not save this audit.${detail}`);
      setIsGenerating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_24px_70px_rgba(87,83,78,0.14)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-950">
            Audit inputs
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Add current tools, seats, and monthly spend.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
          <ClipboardCheck className="size-3.5" />
          No signup
        </span>
      </div>

      <div className="space-y-3">
        {toolRows.map((row, index) => (
          <ToolCard
            key={row.id}
            tool={row}
            index={index}
            canRemove={toolRows.length > 1}
            onChange={(updates) => updateTool(row.id, updates)}
            onRemove={() => removeTool(row.id)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addTool}
        className="mt-3 h-11 w-full border-dashed border-stone-300 bg-stone-50/60 text-sm text-stone-700 hover:bg-stone-100"
      >
        <Plus className="size-4" />
        Add Tool
      </Button>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Team size</span>
          <input
            type="number"
            min="1"
            placeholder="24"
            value={teamSize}
            onChange={(event) => setTeamSize(event.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Primary use case
          </span>
          <select
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
            className={fieldClass}
          >
            {primaryUseCases.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button
        type="submit"
        disabled={isGenerating}
        className="mt-5 h-12 w-full bg-teal-700 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-800"
      >
        {isGenerating ? "Generating..." : "Generate Audit"}
      </Button>

      {submitError ? (
        <p className="mt-3 text-center text-xs font-medium text-red-600">
          {submitError}
        </p>
      ) : null}

      <p className="mt-3 text-center text-xs text-stone-500">
        Results are saved to a shareable report link.
      </p>
    </form>
  );
}
