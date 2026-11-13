import type { ShapReason } from '../../types';

export function ShapBarList({ reasons }: { reasons: ShapReason[] }) {
  const maxAbs = Math.max(
    0.15,
    ...reasons.map((r) => Math.abs(r.contribution)),
  );

  return (
    <div className="space-y-3">
      {reasons.map((reason, idx) => {
        const isPositive = reason.contribution >= 0;
        const pct = Math.min(100, Math.round((Math.abs(reason.contribution) / maxAbs) * 100));
        const barColor =
          reason.contribution >= 0.25
            ? 'bg-rose-500'
            : isPositive
              ? 'bg-amber-500'
              : 'bg-emerald-500';
        const valColor =
          reason.contribution >= 0.25
            ? 'text-rose-400'
            : isPositive
              ? 'text-amber-400'
              : 'text-emerald-400';

        return (
          <div key={`${reason.feature}-${idx}`} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-slate-200">{reason.feature}</span>
              <span className={`font-mono tabular-nums font-semibold ${valColor}`}>
                {isPositive ? '+' : ''}
                {reason.contribution.toFixed(2)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {reason.humanText}
            </p>
          </div>
        );
      })}
    </div>
  );
}
