import { useMemo } from 'react';
import { useFinGuard } from '../../context/FinGuardContext';
import type { AlertStatus } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { AlertCard } from './AlertCard';

const STATUS_TABS: { id: AlertStatus; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'acknowledged', label: 'Acknowledged' },
  { id: 'dismissed', label: 'Dismissed' },
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Alert status filter"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800"
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  active
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label} ({counts[tab.id]})
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-400">
          Showing {visibleAlerts.length} {alertStatusTab} investigation items
        </p>
      </div>

      {visibleAlerts.length === 0 ? (
        <EmptyState
          title={`No ${alertStatusTab} alerts in queue`}
          description="Alerts acknowledged or dismissed by analysts are tracked across status tabs."
          actionLabel={alertStatusTab !== 'open' ? 'View Open Alerts' : undefined}
          onAction={
            alertStatusTab !== 'open'
              ? () => dispatch({ type: 'SET_ALERT_TAB', tab: 'open' })
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleAlerts.slice(0, 40).map((alert) => (
            <AlertCard key={alert.alertId} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
