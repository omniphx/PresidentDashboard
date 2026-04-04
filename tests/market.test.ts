import { describe, expect, it } from "vitest";

import {
  ACTIVE_PRESIDENT_REVALIDATE_SECONDS,
  buildAbsoluteSeries,
  buildRelativeSeries,
  calculateTermPerformance,
  PRESIDENT_REVALIDATE_SECONDS,
  getPresidentCacheTtlSeconds,
  getPresidentsCacheTtlSeconds,
  normalizeComparisonIds,
} from "@/lib/market";
import type { PricePoint, ScoreboardEntry } from "@/lib/types";

const series: PricePoint[] = [
  { date: "2020-01-02", close: 100 },
  { date: "2020-01-03", close: 105 },
  { date: "2020-01-06", close: 103 },
  { date: "2020-01-07", close: 115 },
  { date: "2020-01-08", close: 110 },
];

describe("calculateTermPerformance", () => {
  it("calculates percent-change metrics for market series", () => {
    const performance = calculateTermPerformance(
      "dow",
      series,
      "2020-01-01",
      "2020-01-08",
      "test-president",
    );

    expect(performance.startValue).toBe(100);
    expect(performance.endValue).toBe(110);
    expect(performance.totalChange).toBeCloseTo(10, 2);
    expect(performance.annualizedChange).toBeGreaterThan(0);
  });

  it("calculates point-change metrics for rate series", () => {
    const performance = calculateTermPerformance(
      "jobs",
      [
        { date: "2020-01-01", close: 5 },
        { date: "2021-01-01", close: 6.25 },
      ],
      "2020-01-01",
      "2021-01-01",
      "test-president",
    );

    expect(performance.totalChange).toBeCloseTo(1.25, 2);
    expect(performance.annualizedChange).toBeCloseTo(1.25, 1);
  });

  it("returns null metrics when the benchmark has no coverage", () => {
    const performance = calculateTermPerformance(
      "nasdaq",
      series,
      "2019-01-01",
      "2019-12-31",
      "missing-president",
    );

    expect(performance.totalChange).toBeNull();
    expect(performance.series).toEqual([]);
  });
});

describe("buildRelativeSeries", () => {
  it("normalizes a price series to relative percent gain for market series", () => {
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
        totalChange: 10,
        annualizedChange: null,
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

  it("uses absolute point moves for macro rate series", () => {
    const entry: ScoreboardEntry = {
      id: "biden",
      president: "Joseph R. Biden Jr.",
      displayName: "Joe Biden",
      orderLabel: "46th",
      party: "Democratic",
      startDate: "2021-01-20",
      endDate: "2025-01-20",
      inauguratedOn: "2021-01-20",
      performance: {
        presidentId: "biden",
        benchmarkId: "jobs",
        startValue: 6.2,
        endValue: 3.7,
        totalChange: -2.5,
        annualizedChange: null,
        coverageStart: "2021-02-01",
        coverageEnd: "2025-01-01",
        series: [
          { date: "2021-02-01", close: 6.2 },
          { date: "2022-02-01", close: 4.0 },
          { date: "2025-01-01", close: 3.7 },
        ],
      },
    };

    expect(buildRelativeSeries(entry)).toEqual([
      { date: "2021-02-01", close: 0, elapsedDays: 12, progressRatio: expect.any(Number) },
      { date: "2022-02-01", close: -2.2, elapsedDays: 377, progressRatio: expect.any(Number) },
      { date: "2025-01-01", close: -2.5, elapsedDays: 1442, progressRatio: expect.any(Number) },
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
        totalChange: 5,
        annualizedChange: null,
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
});

describe("buildAbsoluteSeries", () => {
  it("keeps raw values while preserving elapsed-term alignment", () => {
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
        totalChange: 10,
        annualizedChange: null,
        coverageStart: "2020-01-02",
        coverageEnd: "2020-01-08",
        series,
      },
    };

    expect(buildAbsoluteSeries(entry)).toEqual([
      { date: "2020-01-02", close: 100, elapsedDays: 1, progressRatio: 0.1 },
      { date: "2020-01-03", close: 105, elapsedDays: 2, progressRatio: 0.2 },
      { date: "2020-01-06", close: 103, elapsedDays: 5, progressRatio: 0.5 },
      { date: "2020-01-07", close: 115, elapsedDays: 6, progressRatio: 0.6 },
      { date: "2020-01-08", close: 110, elapsedDays: 7, progressRatio: 0.7 },
    ]);
  });
});

describe("normalizeComparisonIds", () => {
  it("falls back to the most recent covered term when a selection predates the benchmark", () => {
    expect(normalizeComparisonIds("nasdaq", "lbj", "obama")).toEqual({
      leftId: "trump-47",
      rightId: "obama",
    });
  });
});

describe("cache TTL helpers", () => {
  it("uses a 30 day TTL for completed presidencies", () => {
    expect(getPresidentCacheTtlSeconds("obama")).toBe(PRESIDENT_REVALIDATE_SECONDS);
  });

  it("uses an hourly TTL for the active presidency", () => {
    expect(getPresidentCacheTtlSeconds("trump-47")).toBe(ACTIVE_PRESIDENT_REVALIDATE_SECONDS);
  });

  it("uses the shorter TTL when any requested president is active", () => {
    expect(getPresidentsCacheTtlSeconds(["obama", "trump-47"])).toBe(
      ACTIVE_PRESIDENT_REVALIDATE_SECONDS,
    );
  });
});
