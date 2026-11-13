import {
  formatCompactCurrency,
  formatCurrency,
  formatInteger,
} from '../../lib/formatters';
import { KpiCard } from '../ui/KpiCard';

interface KpiCardsProps {
  totalTransactions: number;
  alertsCount: number;
  highAlertsCount: number;
  criticalAlertsCount: number;
  totalAmount: number;
  fraudPreventedAmount: number;
  sparkline: number[];
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
  const alertTrend = sparkline.map((v, idx) => Math.max(1, Math.round(v * (0.08 + (idx % 3) * 0.02))));
  const volumeTrend = sparkline.map((v) => Math.round(v * 1.15));
  const preventedTrend = sparkline.map((v, idx) => Math.max(1, Math.round(v * (idx % 2 === 0 ? 0.06 : 0.09))));

  return (
    <section aria-label="Key metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard
        label="Transactions (90d)"
        value={formatInteger(totalTransactions)}
        subtitle="1,200 monitored accounts"
        accent="emerald"
        sparkline={sparkline}
        sparkColor="#10B981"
      />
      <KpiCard
        label="Active Alerts"
        value={formatInteger(alertsCount)}
        accent="amber"
        sparkline={alertTrend}
        sparkColor="#FBBF24"
        subtitle={
          <span>
            <span className="text-amber-400">{highAlertsCount} HIGH</span>
            <span className="text-slate-600"> / </span>
            <span className="text-rose-400">{criticalAlertsCount} CRIT</span>
          </span>
        }
      />
      <KpiCard
        label="Volume Monitored"
        value={formatCompactCurrency(totalAmount)}
        title={formatCurrency(totalAmount)}
        subtitle="6 payment channels"
        accent="neutral"
        sparkline={volumeTrend}
        sparkColor="#94A3B8"
      />
      <KpiCard
        label="Fraud Prevented (Est.)"
        value={formatCompactCurrency(fraudPreventedAmount)}
        title={formatCurrency(fraudPreventedAmount)}
        subtitle="Critical tier exposure"
        accent="rose"
        sparkline={preventedTrend}
        sparkColor="#F43F5E"
        valueColorClass="text-rose-400"
      />
    </section>
  );
}
