"use client";

import { startTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";

import { useChartLoading } from "@/components/chart-loading-context";
import type { BenchmarkId, ComparisonChartMode } from "@/lib/types";

type ComparisonOption = {
  id: string;
  displayName: string;
};

type ComparisonControlsProps = {
  benchmarkId: BenchmarkId;
  leftId: string;
  rightId: string;
  chartMode: ComparisonChartMode;
  options: ComparisonOption[];
};

export function ComparisonControls({
  benchmarkId,
  leftId,
  rightId,
  chartMode,
  options,
}: ComparisonControlsProps) {
  const router = useRouter();
  const { beginChartNavigation, isChartLoading } = useChartLoading();
  const [optimisticSelection, setOptimisticSelection] = useOptimistic(
    { leftId, rightId, chartMode },
    (
      _currentSelection,
      nextSelection: {
        leftId: string;
        rightId: string;
        chartMode: ComparisonChartMode;
      },
    ) => nextSelection,
  );

  const navigate = (
    nextLeftId: string,
    nextRightId: string,
    nextMode: ComparisonChartMode,
  ) => {
    const params = new URLSearchParams({
      benchmark: benchmarkId,
      left: nextLeftId,
      right: nextRightId,
      mode: nextMode,
    });

    startTransition(() => {
      beginChartNavigation({
        benchmarkId,
        leftId: nextLeftId,
        rightId: nextRightId,
        chartMode: nextMode,
      });
      setOptimisticSelection({
        leftId: nextLeftId,
        rightId: nextRightId,
        chartMode: nextMode,
      });
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      <fieldset className="md:col-span-2">
        <legend className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Chart Mode</legend>
        <div className="mt-2 grid grid-cols-2 gap-0.5 rounded-xl border border-[var(--line)] bg-white/75 p-0.5">
          {[
            { value: "relative", label: "Relative" },
            { value: "absolute", label: "Absolute" },
          ].map((option) => {
            const checked = optimisticSelection.chartMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  navigate(
                    optimisticSelection.leftId,
                    optimisticSelection.rightId,
                    option.value as ComparisonChartMode,
                  )
                }
                className={`flex min-h-9 cursor-pointer items-center justify-center rounded-lg px-2.5 py-1.5 text-[13px] font-medium tracking-[0.05em] transition ${
                  checked
                    ? "bg-[rgba(187,77,0,0.08)] text-[var(--accent-strong)] ring-1 ring-inset ring-[rgba(122,47,0,0.12)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                aria-pressed={checked}
                aria-busy={isChartLoading && checked}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        Compare Left
        <select
          value={optimisticSelection.leftId}
          onChange={(event) =>
            navigate(
              event.target.value,
              optimisticSelection.rightId,
              optimisticSelection.chartMode,
            )
          }
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-[13px] text-[var(--text)] outline-none"
          aria-busy={isChartLoading}
        >
          {options.map((president) => (
            <option key={president.id} value={president.id}>
              {president.displayName}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        Compare Right
        <select
          value={optimisticSelection.rightId}
          onChange={(event) =>
            navigate(
              optimisticSelection.leftId,
              event.target.value,
              optimisticSelection.chartMode,
            )
          }
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-[13px] text-[var(--text)] outline-none"
          aria-busy={isChartLoading}
        >
          {options.map((president) => (
            <option key={president.id} value={president.id}>
              {president.displayName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
