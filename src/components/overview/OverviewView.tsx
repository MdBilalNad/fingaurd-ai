import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { KpiCards } from './KpiCards';
import { OverviewCharts } from './OverviewCharts';
import { OverviewTables } from './OverviewTables';

export function OverviewView() {
  const metrics = useDashboardMetrics();

  return (
    <div className="space-y-3">
      <KpiCards
        totalTransactions={metrics.totalTransactions}
        alertsCount={metrics.alertsCount}
        highAlertsCount={metrics.highAlertsCount}
        criticalAlertsCount={metrics.criticalAlertsCount}
        totalAmount={metrics.totalAmount}
        fraudPreventedAmount={metrics.fraudPreventedAmount}
        sparkline={metrics.sparkline}
      />
      <OverviewCharts
        dailySeries={metrics.dailySeries}
        riskDistribution={metrics.riskDistribution}
        totalTransactions={metrics.totalTransactions}
      />
      <OverviewTables topRiskAccounts={metrics.topRiskAccounts} />
    </div>
  );
}
