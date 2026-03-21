import { describe, expect, it } from "vitest";

import { buildRelativeSeries, calculateTermPerformance } from "@/lib/market";
import type { PricePoint, ScoreboardEntry } from "@/lib/types";

const series: PricePoint[] = [
  { date: "2020-01-02", close: 100 },
  { date: "2020-01-03", close: 105 },
  { date: "2020-01-06", close: 103 },
  { date: "2020-01-07", close: 115 },
  { date: "2020-01-08", close: 110 },
];

describe("calculateTermPerformance", () => {
  it("calculates return metrics for a covered window", () => {
    const performance = calculateTermPerformance(
      "dow",
      series,
      "2020-01-01",
      "2020-01-08",
      "test-president",
    );

    expect(performance.startValue).toBe(100);
    expect(performance.endValue).toBe(110);
    expect(performance.totalReturnPct).toBeCloseTo(10, 2);
    expect(performance.maxDrawdownPct).toBeCloseTo(-4.35, 2);
    expect(performance.volatilityPct).toBeGreaterThan(0);
  });

  it("returns null metrics when the benchmark has no coverage", () => {
    const performance = calculateTermPerformance(
      "nasdaq",
      series,
      "2019-01-01",
      "2019-12-31",
      "missing-president",
    );

    expect(performance.totalReturnPct).toBeNull();
    expect(performance.series).toEqual([]);
  });
});

describe("buildRelativeSeries", () => {
  it("normalizes a price series to relative percent gain", () => {
    const entry: ScoreboardEntry = {
      id: "test-president",
      president: "Test President",
      displayName: "Test President",
      orderLabel: "0th",
      party: "Independent",
      startDate: "2020-01-01",
      endDate: "2020-01-11",
      inauguratedOn: "2020-01-01",
      performance: {
        presidentId: "test-president",
        benchmarkId: "dow",
        startValue: 100,
        endValue: 110,
        totalReturnPct: 10,
        annualizedReturnPct: null,
        maxDrawdownPct: null,
        volatilityPct: null,
        coverageStart: "2020-01-02",
        coverageEnd: "2020-01-08",
        series,
      },
    };

    expect(buildRelativeSeries(entry)).toEqual([
      { date: "2020-01-02", close: 0, elapsedDays: 1, progressRatio: 0.1 },
      { date: "2020-01-03", close: 5, elapsedDays: 2, progressRatio: 0.2 },
      { date: "2020-01-06", close: 3, elapsedDays: 5, progressRatio: 0.5 },
      { date: "2020-01-07", close: 15, elapsedDays: 6, progressRatio: 0.6 },
      { date: "2020-01-08", close: 10, elapsedDays: 7, progressRatio: 0.7 },
    ]);
  });

  it("uses a scheduled four-year window for active presidents", () => {
    const entry: ScoreboardEntry = {
      id: "trump-47",
      president: "Donald J. Trump",
      displayName: "Donald Trump II",
      orderLabel: "47th",
      party: "Republican",
      startDate: "2025-01-20",
      endDate: null,
      inauguratedOn: "2025-01-20",
      performance: {
        presidentId: "trump-47",
        benchmarkId: "dow",
        startValue: 100,
        endValue: 105,
        totalReturnPct: 5,
        annualizedReturnPct: null,
        maxDrawdownPct: null,
        volatilityPct: null,
        coverageStart: "2025-01-21",
        coverageEnd: "2025-03-21",
        series: [
          { date: "2025-01-21", close: 100 },
          { date: "2025-03-21", close: 105 },
        ],
      },
    };

    const relativeSeries = buildRelativeSeries(entry);

    expect(relativeSeries[0]).toMatchObject({ close: 0 });
    expect(relativeSeries[1]?.close).toBe(5);
    expect(relativeSeries[1]?.progressRatio).toBeLessThan(0.2);
  });

  it("keeps completed two-term presidents at their full observed term length", () => {
    const entry: ScoreboardEntry = {
      id: "obama",
      president: "Barack Obama",
      displayName: "Barack Obama",
      orderLabel: "44th",
      party: "Democratic",
      startDate: "2009-01-20",
      endDate: "2017-01-20",
      inauguratedOn: "2009-01-20",
      performance: {
        presidentId: "obama",
        benchmarkId: "dow",
        startValue: 100,
        endValue: 160,
        totalReturnPct: 60,
        annualizedReturnPct: null,
        maxDrawdownPct: null,
        volatilityPct: null,
        coverageStart: "2009-01-21",
        coverageEnd: "2017-01-19",
        series: [
          { date: "2009-01-21", close: 100 },
          { date: "2010-01-20", close: 110 },
          { date: "2011-01-20", close: 120 },
          { date: "2012-01-20", close: 130 },
          { date: "2013-01-18", close: 140 },
          { date: "2014-01-21", close: 150 },
          { date: "2017-01-19", close: 160 },
        ],
      },
    };

    const relativeSeries = buildRelativeSeries(entry);

    expect(relativeSeries).toHaveLength(7);
    expect(relativeSeries.at(-1)).toMatchObject({
      date: "2017-01-19",
      close: 60,
    });
    expect(relativeSeries.at(-1)?.elapsedDays).toBeGreaterThan(365 * 7);
    expect(relativeSeries.at(-1)?.progressRatio).toBeCloseTo(1, 3);
  });
});
