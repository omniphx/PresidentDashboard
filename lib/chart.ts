import type { Benchmark, ComparisonChartMode, ComparisonPricePoint } from "@/lib/types";

type BuildComparisonChartModelOptions = {
  benchmark: Benchmark;
  chartMode: ComparisonChartMode;
  leftSeries: ComparisonPricePoint[];
  rightSeries: ComparisonPricePoint[];
  width?: number;
  height?: number;
  chartLeft?: number;
  chartRight?: number;
  chartTop?: number;
  chartBottom?: number;
};

function buildPath(
  series: ComparisonPricePoint[],
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

export function buildComparisonChartModel({
  benchmark,
  chartMode,
  leftSeries,
  rightSeries,
  width = 920,
  height = 320,
  chartLeft = 72,
  chartRight = 16,
  chartTop = 12,
  chartBottom = 34,
}: BuildComparisonChartModelOptions) {
  const plotWidth = width - chartLeft - chartRight;
  const plotHeight = height - chartTop - chartBottom;
  const values = [...leftSeries, ...rightSeries].map((point) => point.close);
  const maxElapsedDays = Math.max(
    leftSeries.at(-1)?.elapsedDays ?? 0,
    rightSeries.at(-1)?.elapsedDays ?? 0,
    365,
  );
  const maxElapsedYears = Math.max(1, Math.floor(maxElapsedDays / 365));
  const defaultMin = 0;
  const defaultMax =
    chartMode === "relative"
      ? benchmark.changeDisplay === "points"
        ? 1
        : 5
      : 1;
  const rawMin = values.length > 0 ? Math.min(...values) : defaultMin;
  const rawMax = values.length > 0 ? Math.max(...values) : defaultMax;
  const min = chartMode === "relative" ? Math.min(rawMin, 0) : rawMin;
  const max =
    chartMode === "relative"
      ? Math.max(rawMax, defaultMax)
      : rawMax === rawMin
        ? rawMax + 1
        : rawMax;
  const ticks = [max, (max + min) / 2, min];
  const yearTicks = Array.from({ length: maxElapsedYears + 1 }, (_, index) => ({
    label: index === 0 ? "Year 0" : `Year ${index}`,
    elapsedDays: index * 365,
  })).filter((tick, index, allTicks) => {
    if (index === 0) {
      return true;
    }

    const isWithinRange = tick.elapsedDays <= maxElapsedDays;
    const previousTick = allTicks[index - 1];

    return isWithinRange && tick.elapsedDays > previousTick.elapsedDays;
  });

  return {
    width,
    height,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    plotWidth,
    plotHeight,
    min,
    max,
    ticks,
    yearTicks,
    maxElapsedDays,
    leftPath: buildPath(leftSeries, plotWidth, plotHeight, min, max, maxElapsedDays),
    rightPath: buildPath(rightSeries, plotWidth, plotHeight, min, max, maxElapsedDays),
  };
}
