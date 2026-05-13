"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import {
  planOptions,
  supportedTools,
  type AuditTool,
  type ToolName,
} from "@/lib/audit-options";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10";

function ToolCombobox({
  value,
  onChange,
}: {
  value: ToolName;
  onChange: (value: ToolName) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return supportedTools;
    }

    return supportedTools.filter((tool) =>
      tool.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(fieldClass, "flex items-center justify-between text-left")}
      >
        <span>{value}</span>
        <ChevronDown className="size-4 text-stone-400" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-11 z-20 rounded-xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-200/80">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools..."
              className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10"
            />
          </div>

          <div role="listbox" className="max-h-48 overflow-y-auto">
            {filteredTools.map((tool) => (
              <button
                key={tool}
                type="button"
                role="option"
                aria-selected={tool === value}
                onClick={() => {
                  onChange(tool);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100 aria-selected:bg-teal-700 aria-selected:text-white"
              >
                {tool}
                {tool === value ? <span className="text-xs">Selected</span> : null}
              </button>
            ))}

            {filteredTools.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-stone-500">
                No tools found.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ToolCard({
  tool,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  tool: AuditTool;
  index: number;
  canRemove: boolean;
  onChange: (updates: Partial<AuditTool>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-800">
          Tool {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium text-stone-400 transition hover:bg-white hover:text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Remove tool ${index + 1}`}
        >
          <X className="size-3.5" />
          Remove
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-stone-500">Tool</span>
          <ToolCombobox
            value={tool.tool}
            onChange={(value) => onChange({ tool: value })}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-stone-500">Plan</span>
          <select
            value={tool.plan}
            onChange={(event) => onChange({ plan: event.target.value })}
            className={fieldClass}
          >
            {planOptions[tool.tool].map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-stone-500">
            Monthly spend
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              $
            </span>
            <input
              inputMode="decimal"
              min="0"
              placeholder="240"
              value={tool.spend}
              onChange={(event) => onChange({ spend: event.target.value })}
              className={cn(fieldClass, "pl-7")}
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-stone-500">Seats</span>
          <input
            type="number"
            min="1"
            placeholder="8"
            value={tool.seats}
            onChange={(event) => onChange({ seats: event.target.value })}
            className={fieldClass}
          />
        </label>
      </div>
    </div>
  );
}

export { fieldClass };
