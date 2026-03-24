import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { PresidentTable } from "@/components/president-table";
import { getBenchmark } from "@/lib/benchmarks";
import type { ScoreboardEntry } from "@/lib/types";

const scoreboard: ScoreboardEntry[] = [
  {
    id: "bush-41",
    president: "George H. W. Bush",
    displayName: "George H. W. Bush",
    orderLabel: "41st",
    party: "Republican",
    startDate: "1989-01-20",
    endDate: "1993-01-20",
    inauguratedOn: "1989-01-20",
    performance: {
      presidentId: "bush-41",
      benchmarkId: "dow",
      startValue: 140,
      endValue: 130,
      totalChange: -7.1,
      annualizedChange: -1.8,
      coverageStart: "1989-01-20",
      coverageEnd: "1993-01-20",
      series: [],
    },
  },
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
  {
    id: "clinton",
    president: "Bill Clinton",
    displayName: "Bill Clinton",
    orderLabel: "42nd",
    party: "Democratic",
    startDate: "1993-01-20",
    endDate: "2001-01-20",
    inauguratedOn: "1993-01-20",
    performance: {
      presidentId: "clinton",
      benchmarkId: "dow",
      startValue: 130,
      endValue: 220,
      totalChange: 69.2,
      annualizedChange: 6.8,
      coverageStart: "1993-01-20",
      coverageEnd: "2001-01-20",
      series: [],
    },
  },
];

function getPresidentOrder() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.querySelector("td")?.textContent?.replace(/\s+/g, " ").trim());
}

describe("PresidentTable", () => {
  it("renders the scoreboard rows sorted by change descending by default", () => {
    render(React.createElement(PresidentTable, { benchmark: getBenchmark("dow"), scoreboard }));

    expect(screen.getByText("Ronald Reagan")).toBeInTheDocument();
    expect(screen.getAllByText("Republican")).toHaveLength(2);
    expect(screen.getByText("+40.0%")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getAllByText("140")).toHaveLength(2);

    expect(getPresidentOrder()).toEqual([
      "Bill Clinton42nd President",
      "Ronald Reagan40th President",
      "George H. W. Bush41st President",
    ]);
  });

  it("sorts by president name and toggles direction", () => {
    render(React.createElement(PresidentTable, { benchmark: getBenchmark("dow"), scoreboard }));

    fireEvent.click(screen.getByRole("button", { name: /president/i }));

    expect(getPresidentOrder()).toEqual([
      "Bill Clinton42nd President",
      "George H. W. Bush41st President",
      "Ronald Reagan40th President",
    ]);

    fireEvent.click(screen.getByRole("button", { name: /president/i }));

    expect(getPresidentOrder()).toEqual([
      "Ronald Reagan40th President",
      "George H. W. Bush41st President",
      "Bill Clinton42nd President",
    ]);
  });

  it("sorts by start value descending when requested", () => {
    render(React.createElement(PresidentTable, { benchmark: getBenchmark("dow"), scoreboard }));

    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    expect(getPresidentOrder()).toEqual([
      "George H. W. Bush41st President",
      "Bill Clinton42nd President",
      "Ronald Reagan40th President",
    ]);
  });
});
