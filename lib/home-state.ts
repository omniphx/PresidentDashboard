import { getBenchmark } from "@/lib/benchmarks";
import {
  getAvailableComparisonIds,
  getDefaultComparisonIds,
  normalizeComparisonIds,
} from "@/lib/market";
import type { BenchmarkId, ComparisonChartMode } from "@/lib/types";

export type HomeSearchParams = Record<string, string | string[] | undefined>;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getHomePageState(params: HomeSearchParams) {
  const benchmarkId = getFirstValue(params.benchmark) as BenchmarkId | undefined;
  const benchmark = getBenchmark(benchmarkId);
  const defaults = getDefaultComparisonIds(benchmark.id);
  const leftId = getFirstValue(params.left) ?? defaults.leftId;
  const rightId = getFirstValue(params.right) ?? defaults.rightId;
  const chartModeParam = getFirstValue(params.mode);
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

  return {
    benchmark,
    chartMode,
    resolvedLeftId,
    resolvedRightId,
  };
}
