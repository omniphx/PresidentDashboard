import type { Benchmark } from "@/lib/types";

export function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export function formatRate(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return `${value.toFixed(2)}%`;
}

export function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatDate(date: string | null) {
  if (!date) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCompactDate(date: string | null) {
  if (!date) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatMetricValue(benchmark: Benchmark, value: number | null) {
  if (benchmark.valueFormat === "currency") {
    return formatCurrency(value);
  }

  if (benchmark.valueFormat === "rate") {
    return formatRate(value);
  }

  return formatNumber(value);
}

export function formatMetricChange(benchmark: Benchmark, value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  if (benchmark.changeDisplay === "points") {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)} pts`;
  }

  return formatPercent(value);
}
