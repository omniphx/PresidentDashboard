type ComparisonOption = {
  id: string;
  displayName: string;
};

type ComparisonControlsProps = {
  benchmarkId: string;
  leftId: string;
  rightId: string;
  options: ComparisonOption[];
};

export function ComparisonControls({
  benchmarkId,
  leftId,
  rightId,
  options,
}: ComparisonControlsProps) {
  return (
    <form className="grid gap-3 md:grid-cols-2" action="/">
      <input type="hidden" name="benchmark" value={benchmarkId} />
      <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        Compare Left
        <select
          name="left"
          defaultValue={leftId}
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--text)] outline-none"
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
          name="right"
          defaultValue={rightId}
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--text)] outline-none"
        >
          {options.map((president) => (
            <option key={president.id} value={president.id}>
              {president.displayName}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-xl border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-xs uppercase tracking-[0.22em] text-[#fff7f1] transition hover:opacity-90 md:col-span-2"
      >
        Update Matchup
      </button>
    </form>
  );
}
