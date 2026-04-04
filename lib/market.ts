import { unstable_cache } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getBenchmark } from "@/lib/benchmarks";
import { getPresident, presidentTerms } from "@/lib/presidents";
import type {
  BenchmarkId,
  ComparisonChartMode,
  ComparisonPricePoint,
  MetricSnapshot,
  PresidentChartPayload,
  PricePoint,
  ScoreboardEntry,
  TermMarketPerformance,
} from "@/lib/types";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const FRED_API_URL = "https://api.stlouisfed.org/fred/series/observations";
const HISTORY_CACHE_VERSION = "macro-v4";
const HISTORY_REVALIDATE_SECONDS = 60 * 60 * 24;
export const PRESIDENT_CACHE_VERSION = "president-v1";
export const PRESIDENT_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;
export const ACTIVE_PRESIDENT_REVALIDATE_SECONDS = 60 * 60;

function getMarketApiKey() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FMP_API_KEY. Add it to .env.local to enable live market data.");
  }

  return apiKey;
}

function getFredApiKey() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FRED_API_KEY. Add it to .env.local to enable FRED-backed macro data.");
  }

  return apiKey;
}

async function fetchJson<T>(url: string, revalidate: number, sourceLabel?: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(
      `${sourceLabel ? `${sourceLabel} request failed` : "Request failed"}: ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

type FredObservation = {
  date: string;
  value: string;
};

type FredSeriesResponse = {
  observations: FredObservation[];
};

function parseHistoricalCsv(csv: string, columnName: string): PricePoint[] {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine?.split(",") ?? [];
  const dateIndex =
    headers.indexOf("observation_date") !== -1
      ? headers.indexOf("observation_date")
      : headers.indexOf("Date");
  const closeIndex =
    headers.indexOf(columnName) !== -1 ? headers.indexOf(columnName) : headers.indexOf("Close");

  if (dateIndex === -1 || closeIndex === -1) {
    throw new Error(`Unexpected CSV format for ${columnName}.`);
  }

  return rows
    .map((row) => row.split(","))
    .map((columns) => ({
      date: columns[dateIndex]?.trim(),
      close: Number(columns[closeIndex]),
    }))
    .filter(
      (point): point is PricePoint =>
        typeof point.date === "string" &&
        point.date.length > 0 &&
        Number.isFinite(point.close),
    )
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((point) => ({
      date: point.date,
      close: Number(point.close.toFixed(2)),
    }));
}

async function loadCsvHistory(historyFile: string, historyColumn: string) {
  const csvPath = path.join(process.cwd(), "data", historyFile);
  const csv = await readFile(csvPath, "utf8");

  return parseHistoricalCsv(csv, historyColumn);
}

async function loadFredSeries(seriesId: string) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: getFredApiKey(),
    file_type: "json",
    sort_order: "asc",
  });
  const response = await fetchJson<FredSeriesResponse>(
    `${FRED_API_URL}?${params.toString()}`,
    HISTORY_REVALIDATE_SECONDS,
    "FRED",
  );

  return response.observations
    .map((observation) => ({
      date: observation.date,
      close: Number(observation.value),
    }))
    .filter(
      (point): point is PricePoint =>
        typeof point.date === "string" &&
        point.date.length > 0 &&
        Number.isFinite(point.close),
    )
    .map((point) => ({
      date: point.date,
      close: Number(point.close.toFixed(2)),
    }));
}

function alignRealOilSeries(oilSeries: PricePoint[], cpiSeries: PricePoint[]) {
  const latestCpi = cpiSeries.at(-1)?.close;

  if (!latestCpi) {
    return [];
  }

  const realOil: PricePoint[] = [];
  let cpiIndex = 0;

  for (const oilPoint of oilSeries) {
    while (
      cpiIndex + 1 < cpiSeries.length &&
      cpiSeries[cpiIndex + 1].date <= oilPoint.date
    ) {
      cpiIndex += 1;
    }

    const cpiPoint = cpiSeries[cpiIndex];

    if (!cpiPoint || cpiPoint.date > oilPoint.date) {
      continue;
    }

    if (!Number.isFinite(oilPoint.close) || oilPoint.close <= 0) {
      continue;
    }

    realOil.push({
      date: oilPoint.date,
      close: Number((oilPoint.close * (latestCpi / cpiPoint.close)).toFixed(2)),
    });
  }

  return realOil;
}

async function loadHistoricalSeries(benchmarkId: BenchmarkId) {
  const benchmark = getBenchmark(benchmarkId);

  switch (benchmark.historySource.kind) {
    case "csv":
      return loadCsvHistory(
        benchmark.historySource.historyFile,
        benchmark.historySource.historyColumn,
      );
    case "fred":
      return loadFredSeries(benchmark.historySource.seriesId);
    case "real-oil": {
      const [oilSeries, cpiSeries] = await Promise.all([
        loadFredSeries(benchmark.historySource.oilSeriesId),
        loadFredSeries(benchmark.historySource.cpiSeriesId),
      ]);

      return alignRealOilSeries(oilSeries, cpiSeries);
    }
  }
}

export async function getHistoricalSeries(benchmarkId: BenchmarkId) {
  const cachedSeries = unstable_cache(
    async () => loadHistoricalSeries(benchmarkId),
    [`historical-series:${benchmarkId}:${HISTORY_CACHE_VERSION}`],
    {
      revalidate: HISTORY_REVALIDATE_SECONDS,
      tags: [`history:${benchmarkId}`],
    },
  );

  return cachedSeries();
}

export function getPresidentCacheTtlSeconds(presidentId: string) {
  const president = getPresident(presidentId);

  return president.endDate ? PRESIDENT_REVALIDATE_SECONDS : ACTIVE_PRESIDENT_REVALIDATE_SECONDS;
}

export function getPresidentsCacheTtlSeconds(presidentIds: string[]) {
  return presidentIds.some(
    (presidentId) => getPresidentCacheTtlSeconds(presidentId) === ACTIVE_PRESIDENT_REVALIDATE_SECONDS,
  )
    ? ACTIVE_PRESIDENT_REVALIDATE_SECONDS
    : PRESIDENT_REVALIDATE_SECONDS;
}

function pickCoverageSeries(series: PricePoint[], startDate: string, endDate: string) {
  const coverageStart = series.find((point) => point.date >= startDate);
  const coverage = series.filter(
    (point) => point.date >= (coverageStart?.date ?? startDate) && point.date <= endDate,
  );

  if (coverage.length < 2) {
    return [];
  }

  return coverage;
}

function calculateAnnualizedPercentChange(totalChange: number, totalDays: number) {
  if (totalDays <= 0) {
    return null;
  }

  const grossReturn = 1 + totalChange / 100;
  const annualized = Math.pow(grossReturn, 365 / totalDays) - 1;
  return annualized * 100;
}

function calculateAnnualizedPointChange(totalChange: number, totalDays: number) {
  if (totalDays <= 0) {
    return null;
  }

  return totalChange / (totalDays / 365);
}

export function calculateTermPerformance(
  benchmarkId: BenchmarkId,
  series: PricePoint[],
  startDate: string,
  endDate: string,
  presidentId: string,
): TermMarketPerformance {
  const benchmark = getBenchmark(benchmarkId);
  const coverage = pickCoverageSeries(series, startDate, endDate);

  if (coverage.length < 2) {
    return {
      presidentId,
      benchmarkId,
      startValue: null,
      endValue: null,
      totalChange: null,
      annualizedChange: null,
      coverageStart: null,
      coverageEnd: null,
      series: [],
    };
  }

  const startValue = coverage[0].close;
  const endValue = coverage.at(-1)?.close ?? null;
  const totalDays =
    (new Date(coverage.at(-1)?.date ?? endDate).getTime() - new Date(coverage[0].date).getTime()) /
    (1000 * 60 * 60 * 24);
  const totalChange =
    endValue === null
      ? null
      : benchmark.changeDisplay === "points"
        ? endValue - startValue
        : ((endValue - startValue) / startValue) * 100;
  const annualizedChange =
    totalChange === null
      ? null
      : benchmark.changeDisplay === "points"
        ? calculateAnnualizedPointChange(totalChange, totalDays)
        : calculateAnnualizedPercentChange(totalChange, totalDays);

  return {
    presidentId,
    benchmarkId,
    startValue,
    endValue,
    totalChange,
    annualizedChange,
    coverageStart: coverage[0].date,
    coverageEnd: coverage.at(-1)?.date ?? null,
    series: coverage,
  };
}

async function computePresidentPerformance(
  benchmarkId: BenchmarkId,
  presidentId: string,
): Promise<ScoreboardEntry> {
  const history = await getHistoricalSeries(benchmarkId);
  const president = getPresident(presidentId);
  const today = new Date().toISOString().slice(0, 10);

  return {
    ...president,
    performance: calculateTermPerformance(
      benchmarkId,
      history,
      president.startDate,
      president.endDate ?? today,
      president.id,
    ),
  };
}

export async function getPresidentPerformance(
  benchmarkId: BenchmarkId,
  presidentId: string,
): Promise<ScoreboardEntry> {
  const cachedPerformance = unstable_cache(
    async () => computePresidentPerformance(benchmarkId, presidentId),
    [`president-performance:${benchmarkId}:${presidentId}:${PRESIDENT_CACHE_VERSION}`],
    {
      revalidate: getPresidentCacheTtlSeconds(presidentId),
      tags: [`performance:${benchmarkId}`, `performance:${benchmarkId}:${presidentId}`],
    },
  );

  return cachedPerformance();
}

export async function getScoreboard(benchmarkId: BenchmarkId): Promise<ScoreboardEntry[]> {
  const cachedScoreboard = unstable_cache(
    async () => {
      const entries = await Promise.all(
        presidentTerms.map((president) => getPresidentPerformance(benchmarkId, president.id)),
      );

      return entries.sort((left, right) => {
        const leftValue = left.performance.totalChange ?? Number.NEGATIVE_INFINITY;
        const rightValue = right.performance.totalChange ?? Number.NEGATIVE_INFINITY;
        return rightValue - leftValue;
      });
    },
    [`scoreboard:${benchmarkId}:${PRESIDENT_CACHE_VERSION}`],
    {
      revalidate: getPresidentsCacheTtlSeconds(presidentTerms.map((president) => president.id)),
      tags: [`performance:${benchmarkId}`, `scoreboard:${benchmarkId}`],
    },
  );

  return cachedScoreboard();
}

function getRelativeTermEndDate(entry: ScoreboardEntry) {
  if (entry.endDate) {
    return entry.endDate;
  }

  const scheduledEndDate = new Date(entry.startDate);
  scheduledEndDate.setFullYear(scheduledEndDate.getFullYear() + 4);
  return scheduledEndDate.toISOString().slice(0, 10);
}

function buildComparisonSeries(
  entry: ScoreboardEntry,
  mode: ComparisonChartMode,
): ComparisonPricePoint[] {
  const benchmark = getBenchmark(entry.performance.benchmarkId);
  const series = entry.performance.series;
  const first = series[0]?.close;

  if (!first) {
    return [];
  }

  const startTime = new Date(entry.startDate).getTime();
  const termEndTime = new Date(getRelativeTermEndDate(entry)).getTime();
  const totalTermDays = Math.max((termEndTime - startTime) / (1000 * 60 * 60 * 24), 1);

  return series.map((point) => ({
    date: point.date,
    close: Number(
      (
        mode === "absolute"
          ? point.close
          : benchmark.changeDisplay === "points"
            ? point.close - first
            : ((point.close / first) - 1) * 100
      ).toFixed(2),
    ),
    elapsedDays: Math.max((new Date(point.date).getTime() - startTime) / (1000 * 60 * 60 * 24), 0),
    progressRatio: Math.min(
      Math.max(
        (new Date(point.date).getTime() - startTime) / (1000 * 60 * 60 * 24) / totalTermDays,
        0,
      ),
      1,
    ),
  }));
}

export function buildRelativeSeries(entry: ScoreboardEntry): ComparisonPricePoint[] {
  return buildComparisonSeries(entry, "relative");
}

export function buildAbsoluteSeries(entry: ScoreboardEntry): ComparisonPricePoint[] {
  return buildComparisonSeries(entry, "absolute");
}

export async function getPresidentChartData(
  benchmarkId: BenchmarkId,
  presidentId: string,
  chartMode: ComparisonChartMode,
): Promise<PresidentChartPayload> {
  const normalizedPresidentId = getPresident(presidentId).id;
  const cachedChartData = unstable_cache(
    async () => {
      const entry = await getPresidentPerformance(benchmarkId, normalizedPresidentId);
      const series =
        chartMode === "absolute" ? buildAbsoluteSeries(entry) : buildRelativeSeries(entry);

      return {
        benchmark: getBenchmark(benchmarkId),
        chartMode,
        entry,
        series,
        comparisonValue:
          chartMode === "absolute" ? entry.performance.endValue : (series.at(-1)?.close ?? null),
      };
    },
    [`president-chart:${benchmarkId}:${normalizedPresidentId}:${chartMode}:${PRESIDENT_CACHE_VERSION}`],
    {
      revalidate: getPresidentCacheTtlSeconds(normalizedPresidentId),
      tags: [
        `performance:${benchmarkId}:${normalizedPresidentId}`,
        `president-chart:${benchmarkId}:${normalizedPresidentId}`,
      ],
    },
  );

  return cachedChartData();
}

async function getMacroSnapshot(benchmarkId: BenchmarkId): Promise<MetricSnapshot> {
  const benchmark = getBenchmark(benchmarkId);
  const history = await getHistoricalSeries(benchmarkId);
  const latest = history.at(-1);
  const prior = history.at(-2);

  if (!latest) {
    throw new Error(`Missing historical data for ${benchmark.label}`);
  }

  let secondaryValue: number | null | undefined;
  if (benchmark.secondarySnapshot) {
    const secondarySeries = await loadFredSeries(benchmark.secondarySnapshot.seriesId);
    secondaryValue = secondarySeries.at(-1)?.close ?? null;
  }

  return {
    benchmarkId,
    value: latest.close,
    delta: prior ? Number((latest.close - prior.close).toFixed(2)) : null,
    asOf: latest.date,
    isDelayed: true,
    source: benchmark.sourceLabel,
    secondaryValue,
    secondaryLabel: benchmark.secondarySnapshot?.label,
    secondaryValueFormat: benchmark.secondarySnapshot?.valueFormat,
  };
}

export async function getLiveQuote(benchmarkId: BenchmarkId): Promise<MetricSnapshot> {
  const benchmark = getBenchmark(benchmarkId);

  if (!benchmark.supportsLiveQuote) {
    return getMacroSnapshot(benchmarkId);
  }

  const apiKey = getMarketApiKey();
  const params = new URLSearchParams({
    symbol: benchmark.ticker ?? "",
    apikey: apiKey,
  });
  const url = `${FMP_BASE_URL}/quote?${params.toString()}`;
  const payload = await fetchJson<FmpQuote[]>(url, 60 * 5, "Financial Modeling Prep");
  const quote = payload[0];

  if (!quote) {
    throw new Error(`Missing quote for ${benchmark.ticker}`);
  }

  const marketPrice = quote.price;

  if (marketPrice === undefined) {
    throw new Error(`Missing market price for ${benchmark.ticker}`);
  }

  const changePct = quote.changesPercentage ?? quote.changePercent ?? 0;
  const marketTime = quote.timestamp ?? Math.floor(Date.now() / 1000);

  return {
    benchmarkId,
    value: marketPrice,
    delta: changePct,
    asOf: new Date(marketTime * 1000).toISOString(),
    isDelayed: true,
    source: "Financial Modeling Prep",
  };
}

export async function getComparison(benchmarkId: BenchmarkId, leftId: string, rightId: string) {
  const fallbackLeftId = getPresident(leftId).id;
  const fallbackRightId = getPresident(rightId).id;
  const cachedComparison = unstable_cache(
    async () => {
      const [left, right] = await Promise.all([
        getPresidentPerformance(benchmarkId, fallbackLeftId),
        getPresidentPerformance(benchmarkId, fallbackRightId),
      ]);

      const leftRelativeSeries = buildRelativeSeries(left);
      const rightRelativeSeries = buildRelativeSeries(right);

      return {
        benchmark: getBenchmark(benchmarkId),
        left,
        right,
        leftRelativeSeries,
        rightRelativeSeries,
        leftComparisonReturnPct: leftRelativeSeries.at(-1)?.close ?? null,
        rightComparisonReturnPct: rightRelativeSeries.at(-1)?.close ?? null,
      };
    },
    [`comparison:${benchmarkId}:${fallbackLeftId}:${fallbackRightId}:${PRESIDENT_CACHE_VERSION}`],
    {
      revalidate: getPresidentsCacheTtlSeconds([fallbackLeftId, fallbackRightId]),
      tags: [
        `comparison:${benchmarkId}`,
        `comparison:${benchmarkId}:${fallbackLeftId}:${fallbackRightId}`,
        `performance:${benchmarkId}:${fallbackLeftId}`,
        `performance:${benchmarkId}:${fallbackRightId}`,
      ],
    },
  );

  return cachedComparison();
}

export function getAvailableComparisonIds(benchmarkId: BenchmarkId) {
  return [...presidentTerms]
    .filter((term) => new Date(term.startDate) >= new Date(getBenchmark(benchmarkId).inceptionDate))
    .sort((left, right) => right.startDate.localeCompare(left.startDate))
    .map((term) => term.id);
}

export function normalizeComparisonIds(benchmarkId: BenchmarkId, leftId: string, rightId: string) {
  const availableIds = getAvailableComparisonIds(benchmarkId);
  const fallbackIds = getDefaultComparisonIds(benchmarkId);
  const primaryFallbackId = availableIds[0] ?? fallbackIds.rightId;
  const normalizedLeftId = availableIds.includes(leftId) ? leftId : primaryFallbackId;
  const normalizedRightId = availableIds.includes(rightId) ? rightId : primaryFallbackId;

  return {
    leftId: normalizedLeftId,
    rightId: normalizedRightId,
  };
}

export function getDefaultComparisonIds(benchmarkId: BenchmarkId) {
  const available = getAvailableComparisonIds(benchmarkId).reverse().slice(-2);

  return {
    leftId: available[0] ?? presidentTerms.at(-2)?.id ?? presidentTerms[0].id,
    rightId: available[1] ?? presidentTerms.at(-1)?.id ?? presidentTerms[1].id,
  };
}

type FmpQuote = {
  symbol: string;
  price?: number;
  changesPercentage?: number;
  changePercent?: number;
  timestamp?: number;
};
