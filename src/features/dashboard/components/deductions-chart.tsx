"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatInr, formatLakh } from "@/lib/format";
import type { DeductionMetric } from "../domain/metrics";

export function DeductionsChart({ deductions }: { deductions: DeductionMetric[] }) {
  if (deductions.length === 0) {
    return (
      <div className="border-border bg-surface flex h-64 flex-col items-center justify-center rounded-lg border p-6 text-center shadow-2xs">
        <p className="text-muted-foreground text-xs">No claims settled in this period.</p>
      </div>
    );
  }

  const chartData = deductions.map((d) => ({
    ...d,
    displayAmount: d.amount,
  }));

  const height = Math.max(220, deductions.length * 40 + 50);

  return (
    <div className="border-border bg-surface rounded-lg border p-4 shadow-2xs">
      <div className="mb-2">
        <h3 className="text-foreground text-sm font-semibold">Deductions by Reason</h3>
        <p className="text-muted-foreground text-xs">Settled in selected period</p>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 75, left: 15, bottom: 5 }}>
            <XAxis
              type="number"
              tickFormatter={(val: number) => formatLakh(val)}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={125}
              tick={{ fontSize: 11, fill: "var(--color-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload as DeductionMetric;
                return (
                  <div className="border-border bg-surface rounded-md border p-2 text-xs shadow-md">
                    <p className="text-foreground font-semibold">{d.label}</p>
                    <p className="text-muted-foreground mt-0.5">
                      Amount:{" "}
                      <span className="text-foreground font-mono font-medium">{formatInr(d.amount)}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Share: <span className="text-foreground font-mono font-medium">{d.share}%</span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="displayAmount" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.reason}
                  fill={
                    entry.reason === "MISSING_DOCUMENT"
                      ? "var(--color-primary)"
                      : "oklch(0.5 0.015 255 / 0.4)"
                  }
                />
              ))}
              <LabelList
                dataKey="displayAmount"
                position="right"
                formatter={(val) => {
                  const num = Number(val) || 0;
                  const item = chartData.find((d) => d.displayAmount === num);
                  return item ? `${formatLakh(num)} · ${item.share}%` : formatLakh(num);
                }}
                className="fill-foreground font-mono text-[11px]"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
