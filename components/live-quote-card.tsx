import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import type { Benchmark, LiveQuote } from "@/lib/types";

type LiveQuoteCardProps = {
  benchmark: Benchmark;
  quote: LiveQuote;
};

export function LiveQuoteCard({ benchmark, quote }: LiveQuoteCardProps) {
  const directionClass = quote.changePct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]";

  return (
    <section className="panel-strong rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Live Tape</p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text)]">{benchmark.label}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{benchmark.description}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold text-[var(--text)]">{formatNumber(quote.price)}</p>
          <p className={`mt-2 text-lg ${directionClass}`}>{formatPercent(quote.changePct)}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {quote.isDelayed ? "Delayed quote" : "Live quote"} • {formatDate(quote.asOf)}
          </p>
        </div>
      </div>
    </section>
  );
}
