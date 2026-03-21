import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { PresidentTable } from "@/components/president-table";
import { getBenchmark } from "@/lib/benchmarks";
import type { ScoreboardEntry } from "@/lib/types";

const scoreboard: ScoreboardEntry[] = [
  {
    id: "reagan",
    president: "Ronald Reagan",
    displayName: "Ronald Reagan",
    orderLabel: "40th",
    party: "Republican",
    startDate: "1981-01-20",
    endDate: "1989-01-20",
    inauguratedOn: "1981-01-20",
    performance: {
      presidentId: "reagan",
      benchmarkId: "dow",
      startValue: 100,
      endValue: 140,
      totalChange: 40,
      annualizedChange: 4.3,
      coverageStart: "1981-01-20",
      coverageEnd: "1989-01-20",
      series: [],
    },
  },
];

describe("PresidentTable", () => {
  it("renders the scoreboard row with generic change metrics", () => {
    render(React.createElement(PresidentTable, { benchmark: getBenchmark("dow"), scoreboard }));

    expect(screen.getByText("Ronald Reagan")).toBeInTheDocument();
    expect(screen.getByText("Republican")).toBeInTheDocument();
    expect(screen.getByText("+40.0%")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("140")).toBeInTheDocument();
  });
});
