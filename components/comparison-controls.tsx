"use client";

import { useRouter } from "next/navigation";

import type { ComparisonChartMode } from "@/lib/types";

type ComparisonOption = {
  id: string;
  displayName: string;
};

type ComparisonControlsProps = {
  benchmarkId: string;
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

  const navigate = (nextLeftId: string, nextRightId: string, nextMode: ComparisonChartMode) => {
    const params = new URLSearchParams({
      benchmark: benchmarkId,
      left: nextLeftId,
      right: nextRightId,
      mode: nextMode,
    });

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <fieldset className="md:col-span-2">
        <legend className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Chart Mode</legend>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-[var(--line)] bg-white p-1">
          {[
            { value: "relative", label: "Relative" },
            { value: "absolute", label: "Absolute" },
          ].map((option) => {
            const checked = chartMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => navigate(leftId, rightId, option.value as ComparisonChartMode)}
                className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-3 py-2 !text-sm font-medium tracking-[0.08em] transition ${
                  checked
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                aria-pressed={checked}
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
          value={leftId}
          onChange={(event) => navigate(event.target.value, rightId, chartMode)}
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 !text-sm text-[var(--text)] outline-none"
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
          value={rightId}
          onChange={(event) => navigate(leftId, event.target.value, chartMode)}
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 !text-sm text-[var(--text)] outline-none"
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
