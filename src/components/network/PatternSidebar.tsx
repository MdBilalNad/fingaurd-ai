import { Network, RefreshCw, Users } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { formatCompactCurrency } from '../../lib/formatters';
import { Card } from '../ui/Card';
import { RiskLevelPill } from '../ui/RiskBadge';

export function PatternSidebar() {
  const { state, dispatch } = useFinGuard();
  const { patterns, selectedPatternId } = state;
  const activePattern = patterns.find((p) => p.patternId === selectedPatternId);

  return (
    <div className="space-y-3">
      <Card padding="none" className="overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[#1e2530] flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
            Detected Topologies
          </h2>
          <span className="text-[11px] font-mono text-slate-400">{patterns.length}</span>
        </div>

        <div className="divide-y divide-[#1e2530] max-h-80 overflow-y-auto">
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
                className={`w-full text-left p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
                  active ? 'bg-[#1a2230] border-l-2 border-l-amber-400' : 'hover:bg-[#090b10]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-100">
                    <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    {pattern.title}
                  </span>
                  <RiskLevelPill level={pattern.severity} />
                </div>
                <p className="mt-1 text-[11px] font-mono text-slate-400 tabular-nums">
                  {pattern.accountIds.length} ACCTS ·{' '}
                  {formatCompactCurrency(pattern.totalAmount)} · {pattern.windowHours}H
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {activePattern && (
        <Card accent="amber" padding="sm" className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-amber-400">
            TOPOLOGY TRACE // {activePattern.title}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
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
                className="px-2 py-0.5 rounded-sm bg-[#090b10] border border-[#1e2530] text-[11px] font-mono text-emerald-400 hover:border-emerald-500/50"
              >
                {accId}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
