import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { formatAbsoluteTime, formatRelativeTime } from '../../lib/formatters';
import type { Alert } from '../../types';
import { ShapBarList } from '../transactions/ShapBarList';
import { Card } from '../ui/Card';
import { RiskLevelPill, RiskScoreBadge } from '../ui/RiskBadge';

export function AlertCard({ alert }: { alert: Alert }) {
  const { state, dispatch } = useFinGuard();
  const [expanded, setExpanded] = useState(false);

  const accent =
    alert.severity === 'critical'
      ? 'rose'
      : alert.severity === 'high'
        ? 'orange'
        : alert.severity === 'medium'
          ? 'amber'
          : 'emerald';

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
    <Card accent={accent} padding="sm" className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <RiskLevelPill level={alert.severity} />
          <RiskScoreBadge score={alert.riskScore} level={alert.severity} />
          <h3 className="text-xs font-semibold text-slate-100">{alert.alertType}</h3>
        </div>
        <span
          className="text-[11px] font-mono tabular-nums text-slate-400"
          title={formatAbsoluteTime(alert.createdAt)}
        >
          {alert.alertId} · {formatRelativeTime(alert.createdAt, state.anchorNowMs)}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-snug">{alert.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-500">TXNS:</span>
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
            className="px-1.5 py-0.5 rounded-sm text-[11px] font-mono bg-[#090b10] border border-[#1e2530] text-emerald-400 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {txnId}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e2530]">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono bg-[#090b10] border border-[#1e2530] text-slate-300 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>{expanded ? 'HIDE SHAP' : 'EXPLAIN'}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>

        {alert.status === 'open' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAction('acknowledged')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Check className="w-3 h-3" aria-hidden="true" />
              ACK
            </button>
            <button
              type="button"
              onClick={() => handleAction('dismissed')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono bg-[#090b10] text-slate-300 border border-[#1e2530] hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <XCircle className="w-3 h-3" aria-hidden="true" />
              DISMISS
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="pt-2 border-t border-[#1e2530]">
          <ShapBarList reasons={alert.reasons} />
        </div>
      )}
    </Card>
  );
}
