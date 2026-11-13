import type { Alert, DetectionResult, RuleFlag, Transaction } from '../types';

export const ALERT_TITLES: Record<RuleFlag, string> = {
  STRUCTURING: 'Structuring Pattern',
  VELOCITY: 'Velocity Burst',
  ROUND_AMOUNT: 'Round-Amount Transfers',
  CROSS_BORDER_ANOMALY: 'Cross-Border Anomaly',
  NEW_DEVICE_HIGH_VALUE: 'New Device High-Value',
  CIRCULAR_FLOW: 'Circular Flow',
  DORMANT_BURST: 'Dormant Account Burst',
  MULE_BEHAVIOR: 'Mule Account Behavior',
  SHELL_BEHAVIOR: 'Shell Account Dispersion',
};

export function buildAlertsFromResults(
  transactions: Transaction[],
  resultsByTxnId: Record<string, DetectionResult>,
): Alert[] {
  const alerts: Alert[] = [];
  const seenKeys = new Set<string>();
  const highRiskTxns = transactions
    .filter((t) => resultsByTxnId[t.txnId].riskScore.score >= 50)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  for (const txn of highRiskTxns) {
    const res = resultsByTxnId[txn.txnId];
    const primaryFlag: RuleFlag = res.flags[0] ?? 'NEW_DEVICE_HIGH_VALUE';
    const dayBucket = txn.timestamp.slice(0, 10);
    const dedupKey = `${txn.senderId}:${primaryFlag}:${dayBucket}`;

    if (seenKeys.has(dedupKey)) {
      const existing = alerts.find(
        (al) =>
          al.accountIds.includes(txn.senderId) &&
          al.primaryFlag === primaryFlag &&
          al.createdAt.slice(0, 10) === dayBucket,
      );
      if (existing && existing.affectedTxnIds.length < 6) {
        existing.affectedTxnIds.push(txn.txnId);
      }
      continue;
    }

    seenKeys.add(dedupKey);
    alerts.push({
      alertId: `ALT-${String(alerts.length + 1).padStart(4, '0')}`,
      createdAt: txn.timestamp,
      severity: res.riskScore.level,
      alertType: ALERT_TITLES[primaryFlag] ?? 'Behavioral Anomaly',
      primaryFlag,
      description: res.reasons[0]?.humanText ?? 'Suspicious transaction detected.',
      affectedTxnIds: [txn.txnId],
      accountIds: [txn.senderId, txn.receiverId],
      riskScore: res.riskScore.score,
      reasons: res.reasons,
      status: 'open',
    });
  }

  return alerts;
}
