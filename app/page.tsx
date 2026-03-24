import { BenchmarkTabs } from "@/components/benchmark-tabs";
import { ComparisonControls } from "@/components/comparison-controls";
import { DataStatus } from "@/components/data-status";
import { KpiCards } from "@/components/kpi-cards";
import { LiveQuoteCard } from "@/components/live-quote-card";
import { PerformanceChart } from "@/components/performance-chart";
import { PresidentTable } from "@/components/president-table";
import { getBenchmark } from "@/lib/benchmarks";
import {
  buildAbsoluteSeries,
  buildRelativeSeries,
  getComparison,
  getLiveQuote,
  getAvailableComparisonIds,
  getDefaultComparisonIds,
  normalizeComparisonIds,
  getScoreboard,
} from "@/lib/market";
import type { BenchmarkId, ComparisonChartMode } from "@/lib/types";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const benchmarkId = (
    Array.isArray(params.benchmark) ? params.benchmark[0] : params.benchmark
  ) as BenchmarkId | undefined;
  const benchmark = getBenchmark(benchmarkId);
  const defaults = getDefaultComparisonIds(benchmark.id);
  const leftId = Array.isArray(params.left)
    ? params.left[0]
    : (params.left ?? defaults.leftId);
  const rightId = Array.isArray(params.right)
    ? params.right[0]
    : (params.right ?? defaults.rightId);
  const chartModeParam = Array.isArray(params.mode)
    ? params.mode[0]
    : params.mode;
  const chartMode: ComparisonChartMode =
    chartModeParam === "absolute" ? "absolute" : "relative";
  const availableComparisonIds = getAvailableComparisonIds(benchmark.id);
  const hasAvailableComparisons = availableComparisonIds.length > 0;
  const normalizedComparisonIds = normalizeComparisonIds(benchmark.id, leftId, rightId);
  const resolvedLeftId = hasAvailableComparisons
    ? normalizedComparisonIds.leftId
    : defaults.leftId;
  const resolvedRightId = hasAvailableComparisons
    ? normalizedComparisonIds.rightId
    : defaults.rightId;

  const [scoreboardResult, comparisonResult, quoteResult] =
    await Promise.allSettled([
      getScoreboard(benchmark.id),
      getComparison(benchmark.id, resolvedLeftId, resolvedRightId),
      getLiveQuote(benchmark.id),
    ]);
  const scoreboard =
    scoreboardResult.status === "fulfilled" ? scoreboardResult.value : [];
  const comparison =
    comparisonResult.status === "fulfilled" ? comparisonResult.value : null;
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
  const coveredScoreboard = scoreboard.filter(
    (entry) => entry.performance.totalChange !== null,
  );
  const hiddenCount = scoreboard.length - coveredScoreboard.length;
  const sortMostRecentFirst = <T extends { startDate: string }>(entries: T[]) =>
    [...entries].sort((left, right) =>
      right.startDate.localeCompare(left.startDate),
    );
  const comparisonOptions = sortMostRecentFirst(
    scoreboard.filter((entry) => entry.startDate >= benchmark.inceptionDate),
  ).map((entry) => ({
    id: entry.id,
    displayName:
      entry.performance.totalChange === null
        ? `${entry.displayName} (No data)`
        : entry.displayName,
  }));

  return (
    <main className="grid-noise min-h-screen px-4 py-4 md:px-6 md:py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <section className="rounded-3xl border border-[var(--line)] bg-white/70 px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">
                Presidential Markets
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[0.01em] text-[var(--text)] md:text-3xl">
                U.S. presidents against markets and macro.
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                Compare presidential terms across stock indexes,
                inflation-adjusted oil, the job market, and interest rates.
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                <a
                  href="https://github.com/omniphx/PresidentDashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 font-[600] text-[var(--accent)] no-underline transition-colors hover:text-[var(--text)]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.95c-2.94.64-3.56-1.25-3.56-1.25-.48-1.2-1.16-1.52-1.16-1.52-.95-.65.07-.64.07-.64 1.05.08 1.6 1.08 1.6 1.08.94 1.6 2.45 1.14 3.05.87.1-.68.37-1.14.67-1.4-2.35-.27-4.82-1.18-4.82-5.24 0-1.16.42-2.11 1.08-2.85-.11-.27-.47-1.38.11-2.88 0 0 .89-.29 2.92 1.09a10.1 10.1 0 0 1 5.32 0c2.03-1.38 2.92-1.09 2.92-1.09.58 1.5.22 2.61.11 2.88.67.74 1.08 1.69 1.08 2.85 0 4.07-2.47 4.96-4.83 5.22.38.33.72.98.72 1.98v2.93c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
                  </svg>
                  <span className="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] group-hover:decoration-current">
                    View the project on
                  </span>
                  <span className="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] group-hover:decoration-current">
                    GitHub
                  </span>
                </a>
              </p>
            </div>
            <div className="grid gap-1 text-sm text-[var(--muted)] md:text-right">
              <p>
                <span className="text-[var(--text)]">Selected series:</span>{" "}
                {benchmark.label}
              </p>
              <p>
                <span className="text-[var(--text)]">Coverage starts:</span>{" "}
                {benchmark.inceptionDate}
              </p>
            </div>
          </div>
        </section>

        <DataStatus historyError={historyError} quoteError={quoteError} />
        <section className="panel rounded-3xl p-4 md:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="grid gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                  Series View
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Switch the series and keep the same head-to-head matchup in
                  view.
                </p>
              </div>
              <BenchmarkTabs
                activeBenchmarkId={benchmark.id}
                leftId={resolvedLeftId}
                rightId={resolvedRightId}
                chartMode={chartMode}
              />
            </div>
            <div>
              <ComparisonControls
                benchmarkId={benchmark.id}
                leftId={resolvedLeftId}
                rightId={resolvedRightId}
                chartMode={chartMode}
                options={comparisonOptions}
              />
            </div>
          </div>
        </section>
        {comparison ? (
          <PerformanceChart
            benchmark={benchmark}
            chartMode={chartMode}
            left={comparison.left}
            right={comparison.right}
            leftSeries={
              chartMode === "absolute"
                ? buildAbsoluteSeries(comparison.left)
                : buildRelativeSeries(comparison.left)
            }
            rightSeries={
              chartMode === "absolute"
                ? buildAbsoluteSeries(comparison.right)
                : buildRelativeSeries(comparison.right)
            }
            leftComparisonValue={
              chartMode === "absolute"
                ? comparison.left.performance.endValue
                : comparison.leftComparisonReturnPct
            }
            rightComparisonValue={
              chartMode === "absolute"
                ? comparison.right.performance.endValue
                : comparison.rightComparisonReturnPct
            }
          />
        ) : null}
        <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          {quote ? (
            <LiveQuoteCard benchmark={benchmark} quote={quote} />
          ) : (
            <div />
          )}
          {coveredScoreboard.length > 0 ? (
            <KpiCards benchmark={benchmark} scoreboard={coveredScoreboard} />
          ) : (
            <div />
          )}
        </section>
        <PresidentTable
          benchmark={benchmark}
          scoreboard={coveredScoreboard}
          hiddenCount={hiddenCount}
        />
      </div>
    </main>
  );
}
