import { useFinGuard } from '../../context/FinGuardContext';
import { mapScoreToRiskLevel } from '../../lib/networkBuilder';
import { formatAbsoluteTime, formatRelativeTime } from '../../lib/formatters';
import type { Account, AccountGraphMetrics } from '../../types';
import { Card } from '../ui/Card';
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
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <Card padding="none" className="xl:col-span-2 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[#1e2530] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Top Risk Accounts
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ranked by composite behavioral, rule &amp; graph score
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2530] bg-[#090b10]/60 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2 px-3">Account</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Score</th>
                <th className="py-2 px-3">Primary Attribution</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2530] text-xs">
              {topRiskAccounts.map(({ account, metrics }) => {
                const lvl = mapScoreToRiskLevel(metrics.aggregateRiskScore);
                return (
                  <tr key={account.accountId} className="hover:bg-[#090b10]/60 transition-colors">
                    <td className="py-1.5 px-3 font-mono font-medium text-slate-100 whitespace-nowrap">
                      {account.accountId}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-[11px] text-slate-400 uppercase whitespace-nowrap">
                      {account.accountType}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <RiskScoreBadge score={metrics.aggregateRiskScore} level={lvl} />
                    </td>
                    <td className="py-1.5 px-3 text-slate-300 max-w-xs truncate" title={metrics.primaryReason}>
                      {metrics.primaryReason}
                    </td>
                    <td className="py-1.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({
                            type: 'SET_FILTERS',
                            patch: { searchAccount: account.accountId, page: 1 },
                          });
                          dispatch({ type: 'SET_VIEW', view: 'transactions' });
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-[#090b10] border border-[#1e2530] hover:border-emerald-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="none" className="flex flex-col">
        <div className="px-3 py-2.5 border-b border-[#1e2530]">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
            Recent Alerts Feed
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Latest 8 high &amp; critical triggers</p>
        </div>
        <div className="divide-y divide-[#1e2530] flex-1">
          {recentAlerts.map((alert) => (
            <div key={alert.alertId} className="px-3 py-2.5 hover:bg-[#090b10]/50 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <RiskLevelPill level={alert.severity} />
                <span
                  className="text-[11px] text-slate-400 font-mono tabular-nums"
                  title={formatAbsoluteTime(alert.createdAt)}
                >
                  {formatRelativeTime(alert.createdAt, state.anchorNowMs)}
                </span>
              </div>
              <p className="mt-1.5 text-xs font-medium text-slate-100">{alert.alertType}</p>
              <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2 leading-snug">
                {alert.description}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
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
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  INVESTIGATE →
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
