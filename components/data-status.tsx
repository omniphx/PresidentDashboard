type DataStatusProps = {
  historyError?: string;
  quoteError?: string;
};

export function DataStatus({ historyError, quoteError }: DataStatusProps) {
  if (!historyError && !quoteError) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-amber-700/25 bg-amber-100/70 p-5 text-sm text-amber-950">
      <p className="text-xs uppercase tracking-[0.26em] text-amber-800">Market Data Warning</p>
      {historyError ? <p className="mt-3 leading-6">Historical data is unavailable: {historyError}</p> : null}
      {quoteError ? <p className="mt-3 leading-6">Live quote data is unavailable: {quoteError}</p> : null}
      <p className="mt-3 leading-6 text-amber-900">
        Add `FMP_API_KEY` in `.env.local` to enable the Financial Modeling Prep provider.
      </p>
    </section>
  );
}
