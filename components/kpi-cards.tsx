import { formatMetricChange } from "@/lib/format";
import type { Benchmark, ScoreboardEntry } from "@/lib/types";

type KpiCardsProps = {
  benchmark: Benchmark;
  scoreboard: ScoreboardEntry[];
};

export function KpiCards({ benchmark, scoreboard }: KpiCardsProps) {
  const completed = scoreboard.filter((entry) => entry.performance.totalChange !== null);
  const leader = completed[0];
  const laggard = completed.at(-1);
  const average =
    completed.reduce((sum, entry) => sum + (entry.performance.totalChange ?? 0), 0) /
    Math.max(completed.length, 1);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <article className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Largest Increase</p>
        <p className="mt-4 text-2xl font-semibold text-[var(--text)]">{leader?.displayName ?? "N/A"}</p>
        <p className="mt-2 text-sm text-[var(--positive)]">
          {formatMetricChange(benchmark, leader?.performance.totalChange ?? null)}
        </p>
      </article>
      <article className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Average Change</p>
        <p className="mt-4 text-2xl font-semibold text-[var(--text)]">
          {formatMetricChange(benchmark, Number.isFinite(average) ? average : null)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">Across presidents with coverage in the selected series.</p>
      </article>
      <article className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Largest Decrease</p>
        <p className="mt-4 text-2xl font-semibold text-[var(--text)]">{laggard?.displayName ?? "N/A"}</p>
        <p className="mt-2 text-sm text-[var(--negative)]">
          {formatMetricChange(benchmark, laggard?.performance.totalChange ?? null)}
        </p>
      </article>
    </div>
  );
}
