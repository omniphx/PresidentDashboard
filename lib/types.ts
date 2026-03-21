export type BenchmarkId = "dow" | "nasdaq" | "sp500";

export type PresidentTerm = {
  id: string;
  president: string;
  displayName: string;
  orderLabel: string;
  party: string;
  startDate: string;
  endDate: string | null;
  inauguratedOn: string;
};

export type Benchmark = {
  id: BenchmarkId;
  label: string;
  ticker: string;
  inceptionDate: string;
  description: string;
  historyFile: string;
  historyColumn: string;
};

export type PricePoint = {
  date: string;
  close: number;
};

export type RelativePricePoint = {
  date: string;
  close: number;
  elapsedDays: number;
  progressRatio: number;
};

export type LiveQuote = {
  benchmarkId: BenchmarkId;
  price: number;
  changePct: number;
  asOf: string;
  isDelayed: boolean;
  source: string;
};

export type TermMarketPerformance = {
  presidentId: string;
  benchmarkId: BenchmarkId;
  startValue: number | null;
  endValue: number | null;
  totalReturnPct: number | null;
  annualizedReturnPct: number | null;
  maxDrawdownPct: number | null;
  volatilityPct: number | null;
  coverageStart: string | null;
  coverageEnd: string | null;
  series: PricePoint[];
};

export type ScoreboardEntry = PresidentTerm & {
  performance: TermMarketPerformance;
};
