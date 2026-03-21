import { formatPercent } from "@/lib/format";
import type { RelativePricePoint, ScoreboardEntry } from "@/lib/types";

type PerformanceChartProps = {
  left: ScoreboardEntry;
  right: ScoreboardEntry;
  leftSeries: RelativePricePoint[];
  rightSeries: RelativePricePoint[];
  leftComparisonReturnPct: number | null;
  rightComparisonReturnPct: number | null;
};

function buildPath(
  series: RelativePricePoint[],
  width: number,
  height: number,
  min: number,
  max: number,
  maxElapsedDays: number,
) {
  if (series.length === 0 || max === min || maxElapsedDays <= 0) {
    return "";
  }

  return series
    .map((point, index) => {
      const x = (point.elapsedDays / maxElapsedDays) * width;
      const y = height - ((point.close - min) / (max - min)) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function PerformanceChart({
  left,
  right,
  leftSeries,
  rightSeries,
  leftComparisonReturnPct,
  rightComparisonReturnPct,
}: PerformanceChartProps) {
  const width = 920;
  const height = 320;
  const chartLeft = 72;
  const chartRight = 16;
  const chartTop = 12;
  const chartBottom = 34;
  const plotWidth = width - chartLeft - chartRight;
  const plotHeight = height - chartTop - chartBottom;
  const values = [...leftSeries, ...rightSeries].map((point) => point.close);
  const maxElapsedDays = Math.max(
    leftSeries.at(-1)?.elapsedDays ?? 0,
    rightSeries.at(-1)?.elapsedDays ?? 0,
    365,
  );
  const maxElapsedYears = Math.max(1, Math.ceil(maxElapsedDays / 365));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 5);

  const leftPath = buildPath(leftSeries, plotWidth, plotHeight, min, max, maxElapsedDays);
  const rightPath = buildPath(rightSeries, plotWidth, plotHeight, min, max, maxElapsedDays);
  const ticks = [max, (max + min) / 2, min];
  const yearTicks = Array.from({ length: maxElapsedYears + 1 }, (_, index) => ({
    label: index === 0 ? "Year 0" : `Year ${index}`,
    elapsedDays: index * 365,
  }));

  return (
    <section className="panel-strong rounded-3xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Head To Head</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[0.02em] text-[var(--text)]">Relative term performance</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em]">
          <div className="pill rounded-full px-4 py-2 text-[var(--muted)]">
            <span className="text-[var(--accent)]">{left.displayName}</span> {formatPercent(leftComparisonReturnPct)}
          </div>
          <div className="pill rounded-full px-4 py-2 text-[var(--muted)]">
            <span className="text-cyan-700">{right.displayName}</span> {formatPercent(rightComparisonReturnPct)}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white/60 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full">
          {yearTicks.map((tick) => {
            const x = chartLeft + Math.min(tick.elapsedDays / maxElapsedDays, 1) * plotWidth;
            return (
              <g key={tick.label}>
                <line x1={x} x2={x} y1={chartTop} y2={chartTop + plotHeight} stroke="rgba(70,48,18,0.08)" />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor={tick.elapsedDays === 0 ? "start" : tick.elapsedDays >= maxElapsedDays ? "end" : "middle"}
                  fill="rgba(70,48,18,0.68)"
                  fontSize="12"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}
          {ticks.map((tick) => {
            const y = chartTop + (plotHeight - ((tick - min) / (max - min || 1)) * plotHeight);
            return (
              <g key={tick}>
                <line
                  x1={chartLeft}
                  x2={chartLeft + plotWidth}
                  y1={y}
                  y2={y}
                  stroke="rgba(70,48,18,0.14)"
                  strokeDasharray="6 8"
                />
                <text x="0" y={Math.max(chartTop + 12, y - 8)} fill="rgba(70,48,18,0.68)" fontSize="12">
                  {formatPercent(tick)}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${chartLeft} ${chartTop})`}>
            <path d={leftPath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            <path d={rightPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        Lines are aligned by years since inauguration. Longer presidencies extend farther across the x-axis, and ongoing terms only extend through the years completed so far.
      </p>
    </section>
  );
}
