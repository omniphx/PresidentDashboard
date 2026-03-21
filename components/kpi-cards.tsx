import { formatPercent } from "@/lib/format";
import type { ScoreboardEntry } from "@/lib/types";

type KpiCardsProps = {
  scoreboard: ScoreboardEntry[];
};

export function KpiCards({ scoreboard }: KpiCardsProps) {
  const completed = scoreboard.filter((entry) => entry.performance.totalReturnPct !== null);
  const leader = completed[0];
  const laggard = completed.at(-1);
  const average =
    completed.reduce((sum, entry) => sum + (entry.performance.totalReturnPct ?? 0), 0) /
    Math.max(completed.length, 1);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <article className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Top Term</p>
        <p className="mt-4 text-2xl font-semibold text-[var(--text)]">{leader?.displayName ?? "N/A"}</p>
        <p className="mt-2 text-sm text-[var(--positive)]">{formatPercent(leader?.performance.totalReturnPct ?? null)}</p>
      </article>
      <article className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Average Term</p>
        <p className="mt-4 text-2xl font-semibold text-[var(--text)]">{formatPercent(Number.isFinite(average) ? average : null)}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Across presidents with coverage in the selected benchmark.</p>
      </article>
      <article className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Worst Term</p>
        <p className="mt-4 text-2xl font-semibold text-[var(--text)]">{laggard?.displayName ?? "N/A"}</p>
        <p className="mt-2 text-sm text-[var(--negative)]">{formatPercent(laggard?.performance.totalReturnPct ?? null)}</p>
      </article>
    </div>
  );
}
