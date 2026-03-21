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
