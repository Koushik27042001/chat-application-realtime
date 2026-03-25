export default function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/95 p-5 shadow-lg shadow-violet-950/20 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
        {value ?? "—"}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
