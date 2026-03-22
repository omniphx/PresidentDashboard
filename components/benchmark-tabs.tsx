"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { benchmarks } from "@/lib/benchmarks";
import type { BenchmarkId, ComparisonChartMode } from "@/lib/types";

type BenchmarkTabsProps = {
  activeBenchmarkId: BenchmarkId;
  leftId: string;
  rightId: string;
  chartMode: ComparisonChartMode;
};

export function BenchmarkTabs({
  activeBenchmarkId,
  leftId,
  rightId,
  chartMode,
}: BenchmarkTabsProps) {
  const router = useRouter();
  const buildHref = (benchmarkId: BenchmarkId) =>
    `/?benchmark=${benchmarkId}&left=${leftId}&right=${rightId}&mode=${chartMode}`;

  return (
    <>
      <div className="md:hidden">
        <label className="grid gap-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Select Series
          <select
            value={activeBenchmarkId}
            onChange={(event) =>
              router.push(buildHref(event.target.value as BenchmarkId))
            }
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 !text-sm font-medium tracking-[0.08em] text-[var(--text)]"
            aria-label="Select series"
          >
            {benchmarks.map((benchmark) => (
              <option key={benchmark.id} value={benchmark.id}>
                {benchmark.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="hidden flex-wrap gap-2 md:flex md:gap-3">
        {benchmarks.map((benchmark) => {
          const isActive = benchmark.id === activeBenchmarkId;

          return (
            <Link
              key={benchmark.id}
              href={buildHref(benchmark.id)}
              className={`inline-flex min-w-[11.5rem] items-center justify-center rounded-full border px-4 py-2 text-center !text-sm uppercase tracking-[0.22em] transition ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_8px_24px_rgba(187,77,0,0.14)]"
                  : "pill border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
              }`}
            >
              {benchmark.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
