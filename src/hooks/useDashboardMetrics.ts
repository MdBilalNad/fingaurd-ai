import { useMemo } from 'react';
import { useFinGuard } from '../context/FinGuardContext';
import { CHANNELS } from '../lib/geoProfiles';
import type { Channel, RiskLevel, RuleFlag } from '../types';

const RULE_LABELS: Record<RuleFlag, string> = {
  STRUCTURING: 'Structuring',
  VELOCITY: 'Velocity Burst',
  ROUND_AMOUNT: 'Round Amount',
  CROSS_BORDER_ANOMALY: 'Cross-Border',
  NEW_DEVICE_HIGH_VALUE: 'New Device',
  CIRCULAR_FLOW: 'Circular Flow',
  DORMANT_BURST: 'Dormant Burst',
  MULE_BEHAVIOR: 'Mule Fan-Out',
  SHELL_BEHAVIOR: 'Shell Dispersion',
};

export function useDashboardMetrics() {
  const { state } = useFinGuard();
  const { transactions, resultsByTxnId, accountMetrics, accounts, patterns } = state;

  return useMemo(() => {
    let totalAmount = 0;
    let fraudPreventedAmount = 0;
    let highAlertsCount = 0;
    let criticalAlertsCount = 0;
    let mediumPlusCount = 0;

    const riskCounts: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const dailyMap = new Map<
      string,
      { date: string; legitimate: number; suspicious: number }
    >();
    const patternCounts = new Map<RuleFlag, number>();
    const channelRiskMap = new Map<
      Channel,
      { channel: string; low: number; medium: number; high: number; critical: number }
    >();

    for (const ch of CHANNELS) {
      channelRiskMap.set(ch, {
        channel: ch === 'bank_transfer' ? 'Bank' : ch === 'crypto_onramp' ? 'Crypto' : ch.toUpperCase(),
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      });
    }

    for (const txn of transactions) {
      const res = resultsByTxnId[txn.txnId];
      if (!res) continue;
      totalAmount += txn.amount;
      const lvl = res.riskScore.level;
      riskCounts[lvl] += 1;

      if (res.riskScore.score >= 25) mediumPlusCount += 1;
      if (lvl === 'high') highAlertsCount += 1;
      if (lvl === 'critical') {
        criticalAlertsCount += 1;
        fraudPreventedAmount += txn.amount;
      }

      const dayKey = txn.timestamp.slice(0, 10);
      const dayEntry = dailyMap.get(dayKey) ?? {
        date: dayKey,
        legitimate: 0,
        suspicious: 0,
      };
      if (res.riskScore.score >= 50) dayEntry.suspicious += 1;
      else dayEntry.legitimate += 1;
      dailyMap.set(dayKey, dayEntry);

      for (const flag of res.flags) {
        patternCounts.set(flag, (patternCounts.get(flag) ?? 0) + 1);
      }

      const chEntry = channelRiskMap.get(txn.channel);
      if (chEntry) chEntry[lvl] += 1;
    }

    const dailySeries = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const sparkline = dailySeries.slice(-14).map((d) => d.legitimate + d.suspicious);

    const riskDistribution = [
      { name: 'Low', key: 'low' as const, value: riskCounts.low, color: '#10B981' },
      { name: 'Medium', key: 'medium' as const, value: riskCounts.medium, color: '#F59E0B' },
      { name: 'High', key: 'high' as const, value: riskCounts.high, color: '#F97316' },
      { name: 'Critical', key: 'critical' as const, value: riskCounts.critical, color: '#E11D48' },
    ];

    const topRiskAccounts = [...accounts]
      .sort(
        (a, b) =>
          (accountMetrics[b.accountId]?.aggregateRiskScore ?? 0) -
          (accountMetrics[a.accountId]?.aggregateRiskScore ?? 0),
      )
      .slice(0, 10)
      .map((acc) => ({
        account: acc,
        metrics: accountMetrics[acc.accountId],
      }));

    const patternBreakdown = Array.from(patternCounts.entries())
      .map(([flag, count]) => ({
        flag,
        name: RULE_LABELS[flag] ?? flag,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const circularPatterns = patterns.filter((p) => p.kind === 'circular_flow');
    const circularAccountCount = new Set(
      circularPatterns.flatMap((p) => p.accountIds),
    ).size;

    return {
      totalTransactions: transactions.length,
      totalAccounts: accounts.length,
      totalAmount,
      fraudPreventedAmount,
      alertsCount: highAlertsCount + criticalAlertsCount,
      highAlertsCount,
      criticalAlertsCount,
      mediumPlusCount,
      dailySeries,
      sparkline,
      riskDistribution,
      topRiskAccounts,
      patternBreakdown,
      channelRiskSeries: Array.from(channelRiskMap.values()),
      circularRingsCount: circularPatterns.length,
      circularAccountCount,
    };
  }, [transactions, resultsByTxnId, accountMetrics, accounts, patterns]);
}
