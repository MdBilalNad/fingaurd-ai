import { useFinGuard } from '../../context/FinGuardContext';
import { mapScoreToRiskLevel } from '../../lib/networkBuilder';
import { formatAbsoluteTime, formatRelativeTime } from '../../lib/formatters';
import type { Account, AccountGraphMetrics } from '../../types';
import { RiskLevelPill, RiskScoreBadge } from '../ui/RiskBadge';

interface TopAccountRow {
  account: Account;
  metrics: AccountGraphMetrics;
}

export function OverviewTables({
  topRiskAccounts,
}: {
  topRiskAccounts: TopAccountRow[];
}) {
  const { state, dispatch } = useFinGuard();
  const recentAlerts = state.alerts.slice(0, 8);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Top Risk Accounts</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accounts ranked by aggregate behavioral, rule, and graph risk
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Primary Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {topRiskAccounts.map(({ account, metrics }) => {
                const lvl = mapScoreToRiskLevel(metrics.aggregateRiskScore);
                return (
                  <tr key={account.accountId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-100 whitespace-nowrap">
                      {account.accountId}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 capitalize whitespace-nowrap">
                      {account.accountType}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <RiskScoreBadge score={metrics.aggregateRiskScore} level={lvl} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 max-w-xs truncate" title={metrics.primaryReason}>
                      {metrics.primaryReason}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({
                            type: 'SET_FILTERS',
                            patch: { searchAccount: account.accountId, page: 1 },
                          });
                          dispatch({ type: 'SET_VIEW', view: 'transactions' });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Recent Alerts</h2>
          <p className="text-xs text-slate-400 mt-0.5">Latest 8 high & critical triggers</p>
        </div>
        <div className="divide-y divide-slate-800/70 flex-1">
          {recentAlerts.map((alert) => (
            <div key={alert.alertId} className="p-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <RiskLevelPill level={alert.severity} />
                <span
                  className="text-xs text-slate-400 font-mono tabular-nums"
                  title={formatAbsoluteTime(alert.createdAt)}
                >
                  {formatRelativeTime(alert.createdAt, state.anchorNowMs)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-100">{alert.alertType}</p>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {alert.description}
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {alert.affectedTxnIds[0]}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SELECT_TXN',
                      txnId: alert.affectedTxnIds[0],
                      navigateToTransactions: true,
                    })
                  }
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
