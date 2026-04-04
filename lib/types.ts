export type BenchmarkId = "dow" | "nasdaq" | "sp500" | "oil" | "jobs" | "rates";
export type ComparisonChartMode = "relative" | "absolute";

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

export type HistoricalSource =
  | {
      kind: "csv";
      historyFile: string;
      historyColumn: string;
    }
  | {
      kind: "fred";
      seriesId: string;
    }
  | {
      kind: "real-oil";
      oilSeriesId: string;
      cpiSeriesId: string;
    };

export type Benchmark = {
  id: BenchmarkId;
  label: string;
  ticker?: string;
  inceptionDate: string;
  description: string;
  historySource: HistoricalSource;
  changeDisplay: "percent" | "points";
  valueFormat: "number" | "currency" | "rate";
  supportsLiveQuote: boolean;
  latestLabel: string;
  sourceLabel: string;
  secondarySnapshot?: {
    label: string;
    seriesId: string;
    valueFormat: "number" | "currency" | "rate";
  };
};

export type PricePoint = {
  date: string;
  close: number;
};

export type ComparisonPricePoint = {
  date: string;
  close: number;
  elapsedDays: number;
  progressRatio: number;
};

export type MetricSnapshot = {
  benchmarkId: BenchmarkId;
  value: number;
  delta: number | null;
  asOf: string;
  isDelayed: boolean;
  source: string;
  secondaryValue?: number | null;
  secondaryLabel?: string;
  secondaryValueFormat?: "number" | "currency" | "rate";
};

export type TermMarketPerformance = {
  presidentId: string;
  benchmarkId: BenchmarkId;
  startValue: number | null;
  endValue: number | null;
  totalChange: number | null;
  annualizedChange: number | null;
  coverageStart: string | null;
  coverageEnd: string | null;
  series: PricePoint[];
};

export type ScoreboardEntry = PresidentTerm & {
  performance: TermMarketPerformance;
};

export type PresidentChartPayload = {
  benchmark: Benchmark;
  chartMode: ComparisonChartMode;
  entry: ScoreboardEntry;
  series: ComparisonPricePoint[];
  comparisonValue: number | null;
};
