import type { Benchmark } from "@/lib/types";

export const benchmarks: Benchmark[] = [
  {
    id: "dow",
    label: "Dow Jones",
    ticker: "^DJI",
    inceptionDate: "1896-05-26",
    description: "Blue-chip barometer tracking 30 heavyweight U.S. companies.",
    historyFile: "DJIA.csv",
    historyColumn: "DJIA",
  },
  {
    id: "nasdaq",
    label: "Nasdaq Composite",
    ticker: "^IXIC",
    inceptionDate: "1971-02-05",
    description: "Tech-heavy benchmark with broad Nasdaq listed exposure.",
    historyFile: "NASDAQCOM.csv",
    historyColumn: "NASDAQCOM",
  },
  {
    id: "sp500",
    label: "S&P 500",
    ticker: "^GSPC",
    inceptionDate: "1957-03-04",
    description: "Large-cap benchmark often used as the U.S. equity baseline.",
    historyFile: "SP500.csv",
    historyColumn: "SP500",
  },
];

export function getBenchmark(id: string | undefined) {
  return benchmarks.find((benchmark) => benchmark.id === id) ?? benchmarks[0];
}
