import { unstable_cache } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getBenchmark } from "@/lib/benchmarks";
import { getPresident, presidentTerms } from "@/lib/presidents";
import type {
  BenchmarkId,
  LiveQuote,
  PricePoint,
  RelativePricePoint,
  ScoreboardEntry,
  TermMarketPerformance,
} from "@/lib/types";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const HISTORY_CACHE_VERSION = "stooq-v2";
const HISTORY_REVALIDATE_SECONDS = 60 * 60 * 24;

function getMarketApiKey() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FMP_API_KEY. Add it to .env.local to enable live market data.");
  }

  return apiKey;
}

async function fetchFmpJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`FMP request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getLiveQuoteFallback(benchmarkId: BenchmarkId): LiveQuote {
  return {
    benchmarkId,
    price: 0,
    changePct: 0,
    asOf: new Date().toISOString(),
    isDelayed: true,
    source: "Data unavailable",
  };
}

function parseHistoricalCsv(csv: string, columnName: string): PricePoint[] {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine?.split(",") ?? [];
  const dateIndex = headers.indexOf("observation_date") !== -1 ? headers.indexOf("observation_date") : headers.indexOf("Date");
  const closeIndex = headers.indexOf(columnName) !== -1 ? headers.indexOf(columnName) : headers.indexOf("Close");

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

async function loadHistoricalSeries(benchmarkId: BenchmarkId) {
  const benchmark = getBenchmark(benchmarkId);
  const csvPath = path.join(process.cwd(), "data", benchmark.historyFile);
  const csv = await readFile(csvPath, "utf8");

  return parseHistoricalCsv(csv, benchmark.historyColumn);
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

export async function getLiveQuote(benchmarkId: BenchmarkId): Promise<LiveQuote> {
  const benchmark = getBenchmark(benchmarkId);
  const apiKey = getMarketApiKey();
  const params = new URLSearchParams({
    symbol: benchmark.ticker,
    apikey: apiKey,
  });
  const url = `${FMP_BASE_URL}/quote?${params.toString()}`;
  const payload = await fetchFmpJson<FmpQuote[]>(url, 60 * 5);
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
    price: marketPrice,
    changePct,
    asOf: new Date(marketTime * 1000).toISOString(),
    isDelayed: true,
    source: "Financial Modeling Prep",
  };
}

function getPerformanceRevalidateWindow(presidentId: string) {
  const president = getPresident(presidentId);

  return president.endDate ? HISTORY_REVALIDATE_SECONDS : 60 * 15;
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

function calculateAnnualizedReturn(totalReturnPct: number, totalDays: number) {
  if (totalDays <= 0) {
    return null;
  }

  const grossReturn = 1 + totalReturnPct / 100;
  const annualized = Math.pow(grossReturn, 365 / totalDays) - 1;
  return annualized * 100;
}

function calculateMaxDrawdown(series: PricePoint[]) {
  let peak = Number.NEGATIVE_INFINITY;
  let maxDrawdown = 0;

  for (const point of series) {
    peak = Math.max(peak, point.close);
    const drawdown = ((point.close - peak) / peak) * 100;
    maxDrawdown = Math.min(maxDrawdown, drawdown);
  }

  return maxDrawdown;
}

function calculateVolatility(series: PricePoint[]) {
  if (series.length < 3) {
    return null;
  }

  const dailyReturns = [];
  for (let index = 1; index < series.length; index += 1) {
    dailyReturns.push(Math.log(series[index].close / series[index - 1].close));
  }

  const mean = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length;
  const variance =
    dailyReturns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / dailyReturns.length;

  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

export function calculateTermPerformance(
  benchmarkId: BenchmarkId,
  series: PricePoint[],
  startDate: string,
  endDate: string,
  presidentId: string,
): TermMarketPerformance {
  const coverage = pickCoverageSeries(series, startDate, endDate);

  if (coverage.length < 2) {
    return {
      presidentId,
      benchmarkId,
      startValue: null,
      endValue: null,
      totalReturnPct: null,
      annualizedReturnPct: null,
      maxDrawdownPct: null,
      volatilityPct: null,
      coverageStart: null,
      coverageEnd: null,
      series: [],
    };
  }

  const startValue = coverage[0].close;
  const endValue = coverage.at(-1)?.close ?? null;
  const totalReturnPct = endValue ? ((endValue - startValue) / startValue) * 100 : null;
  const totalDays =
    (new Date(coverage.at(-1)?.date ?? endDate).getTime() - new Date(coverage[0].date).getTime()) /
    (1000 * 60 * 60 * 24);

  return {
    presidentId,
    benchmarkId,
    startValue,
    endValue,
    totalReturnPct,
    annualizedReturnPct: totalReturnPct === null ? null : calculateAnnualizedReturn(totalReturnPct, totalDays),
    maxDrawdownPct: calculateMaxDrawdown(coverage),
    volatilityPct: calculateVolatility(coverage),
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
    [`president-performance:${benchmarkId}:${presidentId}:${HISTORY_CACHE_VERSION}`],
    {
      revalidate: getPerformanceRevalidateWindow(presidentId),
      tags: [`performance:${benchmarkId}`, `performance:${benchmarkId}:${presidentId}`],
    },
  );

  return cachedPerformance();
}

export async function getScoreboard(benchmarkId: BenchmarkId): Promise<ScoreboardEntry[]> {
  const entries = await Promise.all(
    presidentTerms.map((president) => getPresidentPerformance(benchmarkId, president.id)),
  );

  return entries.sort((left, right) => {
    const leftValue = left.performance.totalReturnPct ?? Number.NEGATIVE_INFINITY;
    const rightValue = right.performance.totalReturnPct ?? Number.NEGATIVE_INFINITY;
    return rightValue - leftValue;
  });
}

function getRelativeTermEndDate(entry: ScoreboardEntry) {
  if (entry.endDate) {
    return entry.endDate;
  }

  const scheduledEndDate = new Date(entry.startDate);
  scheduledEndDate.setFullYear(scheduledEndDate.getFullYear() + 4);
  return scheduledEndDate.toISOString().slice(0, 10);
}

export function buildRelativeSeries(entry: ScoreboardEntry): RelativePricePoint[] {
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
    close: Number((((point.close / first) - 1) * 100).toFixed(2)),
    elapsedDays: Math.max((new Date(point.date).getTime() - startTime) / (1000 * 60 * 60 * 24), 0),
    progressRatio: Math.min(
      Math.max((new Date(point.date).getTime() - startTime) / (1000 * 60 * 60 * 24) / totalTermDays, 0),
      1,
    ),
  }));
}

export async function getComparison(benchmarkId: BenchmarkId, leftId: string, rightId: string) {
  const fallbackLeftId = getPresident(leftId).id;
  const fallbackRightId = getPresident(rightId).id;
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
}

export function getDefaultComparisonIds(benchmarkId: BenchmarkId) {
  const available = presidentTerms
    .filter((term) => new Date(term.startDate) >= new Date(getBenchmark(benchmarkId).inceptionDate))
    .slice(-2);

  return {
    leftId: available[0]?.id ?? presidentTerms.at(-2)?.id ?? presidentTerms[0].id,
    rightId: available[1]?.id ?? presidentTerms.at(-1)?.id ?? presidentTerms[1].id,
  };
}

type FmpQuote = {
  symbol: string;
  price?: number;
  changesPercentage?: number;
  changePercent?: number;
  timestamp?: number;
};
