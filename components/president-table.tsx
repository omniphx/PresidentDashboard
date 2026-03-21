import {
  formatCompactDate,
  formatMetricChange,
  formatMetricValue,
} from "@/lib/format";
import type { Benchmark, ScoreboardEntry } from "@/lib/types";

type PresidentTableProps = {
  benchmark: Benchmark;
  scoreboard: ScoreboardEntry[];
  hiddenCount?: number;
};

export function PresidentTable({ benchmark, scoreboard, hiddenCount = 0 }: PresidentTableProps) {
  return (
    <section className="panel rounded-3xl p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Leaderboard</p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text)]">
            Presidential Scoreboard
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-[var(--muted)]">
          {hiddenCount > 0
            ? `${hiddenCount} presidents without coverage in the selected series are hidden.`
            : "All presidents in the selected series have coverage."}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead className="text-left uppercase tracking-[0.18em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">President</th>
              <th className="px-3 py-2">Party</th>
              <th className="px-3 py-2">Term</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">End</th>
              <th className="px-3 py-2">Change</th>
              <th className="px-3 py-2">Annualized</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.map((entry) => (
              <tr key={entry.id} className="panel">
                <td className="rounded-l-2xl px-3 py-4">
                  <p className="font-semibold text-[var(--text)]">{entry.displayName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {entry.orderLabel} President
                  </p>
                </td>
                <td className="px-3 py-4 text-[var(--muted)]">{entry.party}</td>
                <td className="px-3 py-4 text-[var(--muted)]">
                  <span className="whitespace-nowrap">
                    {formatCompactDate(entry.startDate)} - {formatCompactDate(entry.endDate)}
                  </span>
                </td>
                <td className="px-3 py-4 text-[var(--muted)]">
                  {formatMetricValue(benchmark, entry.performance.startValue)}
                </td>
                <td className="px-3 py-4 text-[var(--muted)]">
                  {formatMetricValue(benchmark, entry.performance.endValue)}
                </td>
                <td className="px-3 py-4 text-[var(--text)]">
                  {formatMetricChange(benchmark, entry.performance.totalChange)}
                </td>
                <td className="rounded-r-2xl px-3 py-4 text-[var(--muted)]">
                  {formatMetricChange(benchmark, entry.performance.annualizedChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
