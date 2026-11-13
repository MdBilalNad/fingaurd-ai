import { useMemo } from 'react';
import { useFinGuard } from '../../context/FinGuardContext';
import type { AlertStatus } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { AlertCard } from './AlertCard';

const STATUS_TABS: { id: AlertStatus; label: string }[] = [
  { id: 'open', label: 'OPEN' },
  { id: 'acknowledged', label: 'ACKNOWLEDGED' },
  { id: 'dismissed', label: 'DISMISSED' },
];

export function AlertsView() {
  const { state, dispatch } = useFinGuard();
  const { alerts, alertStatusTab } = state;

  const counts = useMemo(() => {
    const map: Record<AlertStatus, number> = {
      open: 0,
      acknowledged: 0,
      dismissed: 0,
    };
    for (const al of alerts) map[al.status] += 1;
    return map;
  }, [alerts]);

  const visibleAlerts = useMemo(
    () => alerts.filter((al) => al.status === alertStatusTab),
    [alerts, alertStatusTab],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div
          role="tablist"
          aria-label="Alert status filter"
          className="inline-flex items-center gap-0.5 p-0.5 rounded bg-[#090b10] border border-[#1e2530]"
        >
          {STATUS_TABS.map((tab) => {
            const active = alertStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => dispatch({ type: 'SET_ALERT_TAB', tab: tab.id })}
                className={`px-3 py-1 rounded-sm text-[11px] font-mono transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  active
                    ? 'bg-[#11151c] text-emerald-400 border border-[#1e2530]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label} [{counts[tab.id]}]
              </button>
            );
          })}
        </div>

        <p className="text-[11px] font-mono uppercase text-slate-400 tabular-nums">
          {visibleAlerts.length} {alertStatusTab} items
        </p>
      </div>

      {visibleAlerts.length === 0 ? (
        <EmptyState
          title={`No ${alertStatusTab} alerts in queue`}
          description="Alerts acknowledged or dismissed by analysts are tracked across status tabs."
          actionLabel={alertStatusTab !== 'open' ? 'VIEW OPEN ALERTS' : undefined}
          onAction={
            alertStatusTab !== 'open'
              ? () => dispatch({ type: 'SET_ALERT_TAB', tab: 'open' })
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visibleAlerts.slice(0, 40).map((alert) => (
            <AlertCard key={alert.alertId} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
