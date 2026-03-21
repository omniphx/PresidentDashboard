import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { PresidentTable } from "@/components/president-table";
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
      totalReturnPct: 40,
      annualizedReturnPct: 4.3,
      maxDrawdownPct: -18,
      volatilityPct: 14,
      coverageStart: "1981-01-20",
      coverageEnd: "1989-01-20",
      series: [],
    },
  },
];

describe("PresidentTable", () => {
  it("renders the scoreboard row with key metrics", () => {
    render(React.createElement(PresidentTable, { scoreboard }));

    expect(screen.getByText("Ronald Reagan")).toBeInTheDocument();
    expect(screen.getByText("Republican")).toBeInTheDocument();
    expect(screen.getByText("+40.0%")).toBeInTheDocument();
  });
});
