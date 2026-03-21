import {
  formatDate,
  formatMetricChange,
  formatMetricValue,
  formatNumber,
} from "@/lib/format";
import type { Benchmark, MetricSnapshot } from "@/lib/types";

type LiveQuoteCardProps = {
  benchmark: Benchmark;
  quote: MetricSnapshot;
};

export function LiveQuoteCard({ benchmark, quote }: LiveQuoteCardProps) {
  const directionClass =
    (quote.delta ?? 0) >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]";

  return (
    <section className="panel-strong rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">
            {benchmark.supportsLiveQuote ? "Live Tape" : "Latest Reading"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text)]">
            {benchmark.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{benchmark.description}</p>
          {quote.secondaryLabel ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              {quote.secondaryLabel}:{" "}
              <span className="text-[var(--text)]">
                {quote.secondaryValueFormat === "rate"
                  ? formatMetricValue({ ...benchmark, valueFormat: "rate" }, quote.secondaryValue ?? null)
                  : quote.secondaryValueFormat === "currency"
                    ? formatMetricValue({ ...benchmark, valueFormat: "currency" }, quote.secondaryValue ?? null)
                    : formatNumber(quote.secondaryValue ?? null)}
              </span>
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{benchmark.latestLabel}</p>
          <p className="mt-2 text-4xl font-semibold text-[var(--text)]">
            {formatMetricValue(benchmark, quote.value)}
          </p>
          <p className={`mt-2 text-lg ${directionClass}`}>
            {quote.delta === null ? "N/A" : formatMetricChange(benchmark, quote.delta)}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {quote.isDelayed ? "Delayed" : "Live"} • {formatDate(quote.asOf)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">{quote.source}</p>
        </div>
      </div>
    </section>
  );
}
