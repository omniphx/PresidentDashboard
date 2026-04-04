"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

import type { BenchmarkId, ComparisonChartMode } from "@/lib/types";

type ChartSelection = {
  benchmarkId: BenchmarkId;
  leftId: string;
  rightId: string;
  chartMode: ComparisonChartMode;
};

type ChartLoadingContextValue = {
  isChartLoading: boolean;
  beginChartNavigation: (selection: ChartSelection) => void;
};

const ChartLoadingContext = createContext<ChartLoadingContextValue | null>(null);

function buildSelectionKey(selection: ChartSelection) {
  return new URLSearchParams({
    benchmark: selection.benchmarkId,
    left: selection.leftId,
    right: selection.rightId,
    mode: selection.chartMode,
  }).toString();
}

export function ChartLoadingProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const currentKey = searchParams.toString();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const beginChartNavigation = useCallback((selection: ChartSelection) => {
    setPendingKey(buildSelectionKey(selection));
  }, []);

  const value = useMemo(
    () => ({
      isChartLoading: pendingKey !== null && pendingKey !== currentKey,
      beginChartNavigation,
    }),
    [beginChartNavigation, currentKey, pendingKey],
  );

  return (
    <ChartLoadingContext.Provider value={value}>
      {children}
    </ChartLoadingContext.Provider>
  );
}

export function useChartLoading() {
  const context = useContext(ChartLoadingContext);

  if (!context) {
    throw new Error("useChartLoading must be used within ChartLoadingProvider.");
  }

  return context;
}
