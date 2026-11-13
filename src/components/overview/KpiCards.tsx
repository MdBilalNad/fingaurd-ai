import {
  formatCompactCurrency,
  formatCurrency,
  formatInteger,
} from '../../lib/formatters';

interface KpiCardsProps {
  totalTransactions: number;
  alertsCount: number;
  highAlertsCount: number;
  criticalAlertsCount: number;
  totalAmount: number;
  fraudPreventedAmount: number;
  sparkline: number[];
}

function MiniSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 76;
      const y = 24 - ((v - min) / span) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width="76" height="28" viewBox="0 0 76 28" aria-hidden="true" className="shrink-0">
      <polyline
        fill="none"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

export function KpiCards({
  totalTransactions,
  alertsCount,
  highAlertsCount,
  criticalAlertsCount,
  totalAmount,
  fraudPreventedAmount,
  sparkline,
}: KpiCardsProps) {
  return (
    <section aria-label="Key metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">Transactions (90d)</p>
          <p className="mt-2 text-2xl font-bold text-slate-50 font-mono tabular-nums">
            {formatInteger(totalTransactions)}
          </p>
          <p className="mt-1 text-xs text-slate-400 whitespace-nowrap">
            1,200 monitored accounts
          </p>
        </div>
        <MiniSparkline values={sparkline} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs font-medium text-slate-400">Alerts</p>
        <p className="mt-2 text-2xl font-bold text-slate-50 font-mono tabular-nums">
          {formatInteger(alertsCount)}
        </p>
        <p className="mt-1 text-xs text-slate-400 tabular-nums">
          <span className="text-orange-400 font-medium">{highAlertsCount} high</span>
          <span aria-hidden="true"> · </span>
          <span className="text-rose-400 font-medium">{criticalAlertsCount} critical</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs font-medium text-slate-400">Total Amount Monitored</p>
        <p
          className="mt-2 text-2xl font-bold text-slate-50 font-mono tabular-nums"
          title={formatCurrency(totalAmount)}
        >
          {formatCompactCurrency(totalAmount)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Across 6 payment channels</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs font-medium text-slate-400">Fraud Prevented (est.)</p>
        <p
          className="mt-2 text-2xl font-bold text-rose-400 font-mono tabular-nums"
          title={formatCurrency(fraudPreventedAmount)}
        >
          {formatCompactCurrency(fraudPreventedAmount)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Demo estimate · critical tier</p>
      </div>
    </section>
  );
}
