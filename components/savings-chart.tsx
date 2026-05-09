"use client";

import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
} from "recharts";

import type { ResultRecommendation } from "@/lib/mock-data";

const colors = ["#0f766e", "#14b8a6", "#f59e0b", "#64748b"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function SavingsChart({
  data,
}: {
  data: ResultRecommendation[];
}) {
  const total = data.reduce((sum, item) => sum + item.savings, 0);
  const topTool = data.reduce((top, item) =>
    item.savings > top.savings ? item : top,
  );

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Savings concentration
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {topTool.tool} drives the largest opportunity.
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
          {topTool.share}% top driver
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center">
        <div className="relative mx-auto h-56 w-56">
          <PieChart width={224} height={224}>
            <Pie
              data={data}
              dataKey="savings"
              nameKey="tool"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.tool} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => currency.format(Number(value))}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e7e5e4",
                boxShadow: "0 12px 30px rgb(15 23 42 / 0.12)",
                fontSize: "12px",
              }}
            />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-stone-500">Monthly</span>
            <span className="text-2xl font-semibold tracking-tight">
              {currency.format(total)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.tool} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="truncate text-sm font-medium">{item.tool}</span>
              </div>
              <span className="text-sm text-stone-500">
                {currency.format(item.savings)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
