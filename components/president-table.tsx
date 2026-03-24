"use client";

import { useState } from "react";

import {
  formatCompactDate,
  formatMetricChange,
  formatMetricValue,
} from "@/lib/format";
import type { Benchmark, ScoreboardEntry } from "@/lib/types";

type SortKey =
  | "displayName"
  | "party"
  | "term"
  | "startValue"
  | "endValue"
  | "totalChange"
  | "annualizedChange";

type SortDirection = "asc" | "desc";

type SortConfig = {
  key: SortKey;
  direction: SortDirection;
};

type PresidentTableProps = {
  benchmark: Benchmark;
  scoreboard: ScoreboardEntry[];
  hiddenCount?: number;
};

const DEFAULT_SORT: SortConfig = {
  key: "totalChange",
  direction: "desc",
};

function compareNullableNumbers(left: number | null, right: number | null) {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
}

function compareNullableDates(left: string | null, right: string | null) {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left.localeCompare(right);
}

export function PresidentTable({ benchmark, scoreboard, hiddenCount = 0 }: PresidentTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT);

  const sortedScoreboard = [...scoreboard].sort((left, right) => {
    let comparison = 0;

    switch (sortConfig.key) {
      case "displayName":
        comparison = left.displayName.localeCompare(right.displayName);
        break;
      case "party":
        comparison = left.party.localeCompare(right.party);
        break;
      case "term":
        comparison =
          left.startDate.localeCompare(right.startDate) ||
          compareNullableDates(left.endDate, right.endDate);
        break;
      case "startValue":
        comparison = compareNullableNumbers(
          left.performance.startValue,
          right.performance.startValue,
        );
        break;
      case "endValue":
        comparison = compareNullableNumbers(
          left.performance.endValue,
          right.performance.endValue,
        );
        break;
      case "totalChange":
        comparison = compareNullableNumbers(
          left.performance.totalChange,
          right.performance.totalChange,
        );
        break;
      case "annualizedChange":
        comparison = compareNullableNumbers(
          left.performance.annualizedChange,
          right.performance.annualizedChange,
        );
        break;
      default:
        comparison = 0;
    }

    return sortConfig.direction === "asc" ? comparison : comparison * -1;
  });

  const toggleSort = (key: SortKey) => {
    setSortConfig((current) =>
      current.key === key
        ? {
            key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : {
            key,
            direction: key === "displayName" || key === "party" || key === "term" ? "asc" : "desc",
          },
    );
  };

  const getAriaSort = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return "none";
    }

    return sortConfig.direction === "asc" ? "ascending" : "descending";
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="h-3 w-3 opacity-45"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
        >
          <path d="M4 2.5 6 0.5l2 2" />
          <path d="M6 0.75v4.5" />
          <path d="M8 9.5 6 11.5l-2-2" />
          <path d="M6 11.25v-4.5" />
        </svg>
      );
    }

    return sortConfig.direction === "asc" ? (
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="h-3 w-3 text-[var(--accent)]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M4 2.5 6 0.5l2 2" />
        <path d="M6 0.75v10.5" />
      </svg>
    ) : (
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="h-3 w-3 text-[var(--accent)]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M8 9.5 6 11.5l-2-2" />
        <path d="M6 0.75v10.5" />
      </svg>
    );
  };

  return (
    <section className="panel rounded-3xl p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Leaderboard</p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text)]">
            Presidential Scoreboard
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-[var(--muted)]">
          {hiddenCount > 0
            ? `${hiddenCount} presidents without coverage in the selected series are hidden.`
            : "All presidents in the selected series have coverage."}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead className="text-left uppercase tracking-[0.18em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2" aria-sort={getAriaSort("displayName")}>
                <button
                  type="button"
                  onClick={() => toggleSort("displayName")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>President</span>
                  {getSortIndicator("displayName")}
                </button>
              </th>
              <th className="px-3 py-2" aria-sort={getAriaSort("party")}>
                <button
                  type="button"
                  onClick={() => toggleSort("party")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>Party</span>
                  {getSortIndicator("party")}
                </button>
              </th>
              <th className="px-3 py-2" aria-sort={getAriaSort("term")}>
                <button
                  type="button"
                  onClick={() => toggleSort("term")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>Term</span>
                  {getSortIndicator("term")}
                </button>
              </th>
              <th className="px-3 py-2" aria-sort={getAriaSort("startValue")}>
                <button
                  type="button"
                  onClick={() => toggleSort("startValue")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>Start</span>
                  {getSortIndicator("startValue")}
                </button>
              </th>
              <th className="px-3 py-2" aria-sort={getAriaSort("endValue")}>
                <button
                  type="button"
                  onClick={() => toggleSort("endValue")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>End</span>
                  {getSortIndicator("endValue")}
                </button>
              </th>
              <th className="px-3 py-2" aria-sort={getAriaSort("totalChange")}>
                <button
                  type="button"
                  onClick={() => toggleSort("totalChange")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>Change</span>
                  {getSortIndicator("totalChange")}
                </button>
              </th>
              <th className="px-3 py-2" aria-sort={getAriaSort("annualizedChange")}>
                <button
                  type="button"
                  onClick={() => toggleSort("annualizedChange")}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span>Annualized</span>
                  {getSortIndicator("annualizedChange")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedScoreboard.map((entry) => (
              <tr key={entry.id} className="panel">
                <td className="rounded-l-2xl px-3 py-4">
                  <p className="font-semibold text-[var(--text)]">{entry.displayName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {entry.orderLabel} President
                  </p>
                </td>
                <td className="px-3 py-4 text-[var(--muted)]">{entry.party}</td>
                <td className="px-3 py-4 text-[var(--muted)]">
                  <span className="whitespace-nowrap">
                    {formatCompactDate(entry.startDate)} - {formatCompactDate(entry.endDate)}
                  </span>
                </td>
                <td className="px-3 py-4 text-[var(--muted)]">
                  {formatMetricValue(benchmark, entry.performance.startValue)}
                </td>
                <td className="px-3 py-4 text-[var(--muted)]">
                  {formatMetricValue(benchmark, entry.performance.endValue)}
                </td>
                <td className="px-3 py-4 text-[var(--text)]">
                  {formatMetricChange(benchmark, entry.performance.totalChange)}
                </td>
                <td className="rounded-r-2xl px-3 py-4 text-[var(--muted)]">
                  {formatMetricChange(benchmark, entry.performance.annualizedChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
