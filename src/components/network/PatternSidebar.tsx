import { Network, RefreshCw, Users } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { formatCompactCurrency } from '../../lib/formatters';
import { RiskLevelPill } from '../ui/RiskBadge';

export function PatternSidebar() {
  const { state, dispatch } = useFinGuard();
  const { patterns, selectedPatternId } = state;
  const activePattern = patterns.find((p) => p.patternId === selectedPatternId);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Detected Patterns</h2>
          <span className="text-xs font-mono text-slate-400">{patterns.length}</span>
        </div>

        <div className="divide-y divide-slate-800/70 max-h-80 overflow-y-auto">
          {patterns.map((pattern) => {
            const active = pattern.patternId === selectedPatternId;
            const Icon =
              pattern.kind === 'circular_flow'
                ? RefreshCw
                : pattern.kind === 'mule_cluster'
                  ? Users
                  : Network;
            return (
              <button
                key={pattern.patternId}
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SELECT_PATTERN',
                    patternId: active ? null : pattern.patternId,
                  })
                }
                className={`w-full text-left p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
                  active ? 'bg-slate-800/90' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-100">
                    <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    {pattern.title}
                  </span>
                  <RiskLevelPill level={pattern.severity} />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 tabular-nums">
                  {pattern.accountIds.length} accounts ·{' '}
                  {formatCompactCurrency(pattern.totalAmount)} · {pattern.windowHours}h window
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {activePattern && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-300">
            Pattern Explanation · {activePattern.title}
          </p>
          <p className="text-xs text-slate-200 leading-relaxed">
            {activePattern.description}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activePattern.accountIds.slice(0, 6).map((accId) => (
              <button
                key={accId}
                type="button"
                onClick={() => {
                  dispatch({ type: 'SET_FILTERS', patch: { searchAccount: accId, page: 1 } });
                  dispatch({ type: 'SET_VIEW', view: 'transactions' });
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-emerald-400 hover:border-emerald-500/50"
              >
                {accId}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
