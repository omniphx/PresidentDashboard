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
            className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-[13px] font-medium tracking-[0.06em] text-[var(--text)]"
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
      <div className="hidden flex-wrap gap-2 md:flex">
        {benchmarks.map((benchmark) => {
          const isActive = benchmark.id === activeBenchmarkId;

          return (
            <Link
              key={benchmark.id}
              href={buildHref(benchmark.id)}
              className={`inline-flex min-w-[9.25rem] items-center justify-center rounded-full border px-3 py-1.5 text-center text-[13px] uppercase tracking-[0.16em] transition ${
                isActive
                  ? "border-[rgba(122,47,0,0.22)] bg-[rgba(187,77,0,0.06)] text-[var(--accent-strong)]"
                  : "pill border-[var(--line)] bg-white/55 text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
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
