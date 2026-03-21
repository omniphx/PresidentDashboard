import { BenchmarkTabs } from "@/components/benchmark-tabs";
import { ComparisonControls } from "@/components/comparison-controls";
import { DataStatus } from "@/components/data-status";
import { KpiCards } from "@/components/kpi-cards";
import { LiveQuoteCard } from "@/components/live-quote-card";
import { PerformanceChart } from "@/components/performance-chart";
import { PresidentTable } from "@/components/president-table";
import { getBenchmark } from "@/lib/benchmarks";
import {
  getComparison,
  getDefaultComparisonIds,
  getLiveQuote,
  getScoreboard,
} from "@/lib/market";
import type { BenchmarkId } from "@/lib/types";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const benchmarkId = (Array.isArray(params.benchmark) ? params.benchmark[0] : params.benchmark) as
    | BenchmarkId
    | undefined;
  const benchmark = getBenchmark(benchmarkId);
  const defaults = getDefaultComparisonIds(benchmark.id);
  const leftId = Array.isArray(params.left) ? params.left[0] : params.left ?? defaults.leftId;
  const rightId = Array.isArray(params.right) ? params.right[0] : params.right ?? defaults.rightId;

  const [scoreboardResult, comparisonResult, quoteResult] = await Promise.allSettled([
    getScoreboard(benchmark.id),
    getComparison(benchmark.id, leftId, rightId),
    getLiveQuote(benchmark.id),
  ]);
  const scoreboard = scoreboardResult.status === "fulfilled" ? scoreboardResult.value : [];
  const comparison = comparisonResult.status === "fulfilled" ? comparisonResult.value : null;
  const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const historyError =
    scoreboardResult.status === "rejected"
      ? scoreboardResult.reason instanceof Error
        ? scoreboardResult.reason.message
        : "Unknown market history error."
      : undefined;
  const quoteError =
    quoteResult.status === "rejected"
      ? quoteResult.reason instanceof Error
        ? quoteResult.reason.message
        : "Unknown live quote error."
      : undefined;
  const coveredScoreboard = scoreboard.filter((entry) => entry.performance.totalReturnPct !== null);
  const hiddenCount = scoreboard.length - coveredScoreboard.length;
  const sortMostRecentFirst = <T extends { startDate: string }>(entries: T[]) =>
    [...entries].sort((left, right) => right.startDate.localeCompare(left.startDate));
  const comparisonOptions =
    coveredScoreboard.length > 0
      ? sortMostRecentFirst(coveredScoreboard).map((entry) => ({
          id: entry.id,
          displayName: entry.displayName,
        }))
      : sortMostRecentFirst(scoreboard).map((entry) => ({
          id: entry.id,
          displayName: entry.displayName,
        }));

  return (
    <main className="grid-noise min-h-screen px-4 py-4 md:px-6 md:py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <section className="rounded-3xl border border-[var(--line)] bg-white/70 px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">Presidential Markets</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[0.01em] text-[var(--text)] md:text-3xl">
                U.S. presidents against the market.
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                Compare presidential terms across major benchmarks using daily historical performance and a live market snapshot.
              </p>
            </div>
            <div className="grid gap-1 text-sm text-[var(--muted)] md:text-right">
              <p><span className="text-[var(--text)]">Default benchmark:</span> {benchmark.label}</p>
              <p><span className="text-[var(--text)]">Coverage starts:</span> {benchmark.inceptionDate}</p>
            </div>
          </div>
        </section>

        <DataStatus historyError={historyError} quoteError={quoteError} />
        <section className="panel rounded-3xl p-4 md:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="grid gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Market View</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Switch the benchmark and keep the same head-to-head matchup in view.
                </p>
              </div>
              <BenchmarkTabs activeBenchmarkId={benchmark.id} leftId={leftId} rightId={rightId} />
            </div>
            <div>
              <ComparisonControls
                benchmarkId={benchmark.id}
                leftId={leftId}
                rightId={rightId}
                options={comparisonOptions}
              />
            </div>
          </div>
        </section>
        {comparison ? (
          <PerformanceChart
            left={comparison.left}
            right={comparison.right}
            leftSeries={comparison.leftRelativeSeries}
            rightSeries={comparison.rightRelativeSeries}
            leftComparisonReturnPct={comparison.leftComparisonReturnPct}
            rightComparisonReturnPct={comparison.rightComparisonReturnPct}
          />
        ) : null}
        <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          {quote ? <LiveQuoteCard benchmark={benchmark} quote={quote} /> : <div />}
          {coveredScoreboard.length > 0 ? <KpiCards scoreboard={coveredScoreboard} /> : <div />}
        </section>
        <PresidentTable scoreboard={coveredScoreboard} hiddenCount={hiddenCount} />
      </div>
    </main>
  );
}
