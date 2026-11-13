import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { formatAbsoluteTime, formatRelativeTime } from '../../lib/formatters';
import type { Alert } from '../../types';
import { ShapBarList } from '../transactions/ShapBarList';
import { RiskLevelPill, RiskScoreBadge } from '../ui/RiskBadge';

export function AlertCard({ alert }: { alert: Alert }) {
  const { state, dispatch } = useFinGuard();
  const [expanded, setExpanded] = useState(false);

  const handleAction = (status: 'acknowledged' | 'dismissed') => {
    dispatch({ type: 'UPDATE_ALERT_STATUS', alertId: alert.alertId, status });
    dispatch({
      type: 'ADD_TOAST',
      toast: {
        id: `alert-action-${alert.alertId}-${status}`,
        title:
          status === 'acknowledged'
            ? `Alert ${alert.alertId} acknowledged`
            : `Alert ${alert.alertId} dismissed`,
        description:
          status === 'acknowledged'
            ? 'Moved to Acknowledged queue for case escalation.'
            : 'Marked as false positive and moved to Dismissed.',
        severity: 'info',
      },
    });
  };

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <RiskLevelPill level={alert.severity} />
          <RiskScoreBadge score={alert.riskScore} level={alert.severity} />
          <h3 className="text-sm font-semibold text-slate-100">{alert.alertType}</h3>
        </div>
        <span
          className="text-xs font-mono tabular-nums text-slate-400"
          title={formatAbsoluteTime(alert.createdAt)}
        >
          {alert.alertId} · {formatRelativeTime(alert.createdAt, state.anchorNowMs)}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400">Affected transactions:</span>
        {alert.affectedTxnIds.map((txnId) => (
          <button
            key={txnId}
            type="button"
            onClick={() =>
              dispatch({
                type: 'SELECT_TXN',
                txnId,
                navigateToTransactions: true,
              })
            }
            className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-950 border border-slate-700 text-emerald-400 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {txnId}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>{expanded ? 'Hide explanation' : 'Explain'}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>

        {alert.status === 'open' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAction('acknowledged')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Acknowledge
            </button>
            <button
              type="button"
              onClick={() => handleAction('dismissed')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Dismiss (false positive)
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="pt-3 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-300 mb-3">
            SHAP Feature Attributions
          </p>
          <ShapBarList reasons={alert.reasons} />
        </div>
      )}
    </article>
  );
}
