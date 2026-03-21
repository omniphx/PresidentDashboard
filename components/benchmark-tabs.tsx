import Link from "next/link";

import { benchmarks } from "@/lib/benchmarks";
import type { BenchmarkId, ComparisonChartMode } from "@/lib/types";

type BenchmarkTabsProps = {
  activeBenchmarkId: BenchmarkId;
  leftId: string;
  rightId: string;
  chartMode: ComparisonChartMode;
};

export function BenchmarkTabs({ activeBenchmarkId, leftId, rightId, chartMode }: BenchmarkTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {benchmarks.map((benchmark) => {
        const isActive = benchmark.id === activeBenchmarkId;

        return (
          <Link
            key={benchmark.id}
            href={`/?benchmark=${benchmark.id}&left=${leftId}&right=${rightId}&mode=${chartMode}`}
            className={`inline-flex min-w-[11.5rem] items-center justify-center rounded-full border px-4 py-2 text-center text-sm uppercase tracking-[0.22em] transition ${
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
  );
}
