import { buildComparisonChartModel } from "@/lib/chart";
import { formatMetricChange, formatMetricValue } from "@/lib/format";
import type { Benchmark, ComparisonChartMode, ComparisonPricePoint, ScoreboardEntry } from "@/lib/types";

type PerformanceChartProps = {
  benchmark: Benchmark;
  chartMode: ComparisonChartMode;
  left: ScoreboardEntry;
  right: ScoreboardEntry;
  leftSeries: ComparisonPricePoint[];
  rightSeries: ComparisonPricePoint[];
  leftComparisonValue: number | null;
  rightComparisonValue: number | null;
};

export function PerformanceChart({
  benchmark,
  chartMode,
  left,
  right,
  leftSeries,
  rightSeries,
  leftComparisonValue,
  rightComparisonValue,
}: PerformanceChartProps) {
  const chart = buildComparisonChartModel({
    benchmark,
    chartMode,
    leftSeries,
    rightSeries,
  });
  const chartTitle = chartMode === "relative" ? "Relative term change" : "Absolute term values";
  const chartDescription =
    chartMode === "relative"
      ? "Compare how the selected series moved after each inauguration, using elapsed years in office."
      : "Compare the raw level of the selected series over each presidency, aligned by elapsed years in office.";
  const chartNote =
    chartMode === "relative"
      ? "Lines are aligned by years since inauguration. Longer presidencies extend farther across the x-axis, and ongoing terms only extend through the years completed so far."
      : "Lines are aligned by years since inauguration and keep each series on its original scale, so level differences stay visible across presidencies.";
  return (
    <section className="panel-strong rounded-3xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Head To Head</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[0.02em] text-[var(--text)]">
            {chartTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {chartDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em]">
          <div className="pill rounded-full px-4 py-2 text-[var(--muted)]">
            <span className="text-[var(--accent)]">{left.displayName}</span>{" "}
            {chartMode === "relative"
              ? formatMetricChange(benchmark, leftComparisonValue)
              : formatMetricValue(benchmark, leftComparisonValue)}
          </div>
          <div className="pill rounded-full px-4 py-2 text-[var(--muted)]">
            <span className="text-cyan-700">{right.displayName}</span>{" "}
            {chartMode === "relative"
              ? formatMetricChange(benchmark, rightComparisonValue)
              : formatMetricValue(benchmark, rightComparisonValue)}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white/60 p-4">
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[320px] w-full">
          {chart.yearTicks.map((tick) => {
            const x =
              chart.chartLeft +
              Math.min(tick.elapsedDays / chart.maxElapsedDays, 1) * chart.plotWidth;
            return (
              <g key={tick.label}>
                <line
                  x1={x}
                  x2={x}
                  y1={chart.chartTop}
                  y2={chart.chartTop + chart.plotHeight}
                  stroke="rgba(70,48,18,0.08)"
                />
                <text
                  x={x}
                  y={chart.height - 8}
                  textAnchor={
                    tick.elapsedDays === 0
                      ? "start"
                      : tick.elapsedDays >= chart.maxElapsedDays
                        ? "end"
                        : "middle"
                  }
                  fill="rgba(70,48,18,0.68)"
                  fontSize="12"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}
          {chart.ticks.map((tick) => {
            const y =
              chart.chartTop +
              (chart.plotHeight -
                ((tick - chart.min) / (chart.max - chart.min || 1)) * chart.plotHeight);
            return (
              <g key={tick}>
                <line
                  x1={chart.chartLeft}
                  x2={chart.chartLeft + chart.plotWidth}
                  y1={y}
                  y2={y}
                  stroke="rgba(70,48,18,0.14)"
                  strokeDasharray="6 8"
                />
                <text
                  x="0"
                  y={Math.max(chart.chartTop + 12, y - 8)}
                  fill="rgba(70,48,18,0.68)"
                  fontSize="12"
                >
                  {chartMode === "relative"
                    ? formatMetricChange(benchmark, tick)
                    : formatMetricValue(benchmark, tick)}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${chart.chartLeft} ${chart.chartTop})`}>
            <path d={chart.leftPath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            <path d={chart.rightPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        {chartNote}
      </p>
    </section>
  );
}
