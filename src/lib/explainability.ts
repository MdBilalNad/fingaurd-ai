import type {
  Account,
  AccountGraphMetrics,
  RuleOutcome,
  ShapReason,
  Transaction,
} from '../types';
import type { BehavioralFeatures } from './behavioralDetector';
import { formatCurrency } from './formatters';

export function generateShapReasons(
  txn: Transaction,
  sender: Account,
  features: BehavioralFeatures,
  rules: RuleOutcome[],
  senderMetrics?: AccountGraphMetrics,
  receiverMetrics?: AccountGraphMetrics,
): ShapReason[] {
  const candidates: ShapReason[] = [];
  const ratio = txn.amount / Math.max(1, sender.avgTransactionAmount);

  if (features.zAmount >= 1.8) {
    const contrib = Math.min(0.42, 0.14 + features.zAmount * 0.06);
    candidates.push({
      feature: 'Transaction Amount',
      contribution: Number(contrib.toFixed(3)),
      humanText: `Amount (${formatCurrency(txn.amount)}) is ${ratio.toFixed(1)}× this account's average — strong anomaly signal.`,
    });
  } else {
    candidates.push({
      feature: 'Transaction Amount',
      contribution: -0.09,
      humanText: `Amount (${formatCurrency(txn.amount)}) aligns within ${ratio.toFixed(1)}× of account baseline.`,
    });
  }

  if (features.newDevice === 1) {
    candidates.push({
      feature: 'Device Fingerprint',
      contribution: 0.24,
      humanText: `Device fingerprint (${txn.deviceId}) is unrecognised for account ${sender.accountId}.`,
    });
  } else {
    candidates.push({
      feature: 'Device Fingerprint',
      contribution: -0.08,
      humanText: `Initiated from a verified, previously enrolled device (${txn.deviceId}).`,
    });
  }

  if (features.hourDeviation === 1) {
    const hh = String(features.txnHour).padStart(2, '0');
    const mm = String(new Date(txn.timestamp).getUTCMinutes()).padStart(2, '0');
    candidates.push({
      feature: 'Time-of-Day Window',
      contribution: 0.16,
      humanText: `Transaction occurred at ${hh}:${mm} UTC, outside this account's normal active hours.`,
    });
  } else {
    candidates.push({
      feature: 'Time-of-Day Window',
      contribution: -0.05,
      humanText: 'Timestamp falls inside the account’s established daily activity window.',
    });
  }

  if (features.crossBorder === 1) {
    candidates.push({
      feature: 'Cross-Border IP',
      contribution: 0.21,
      humanText: `Routed from ${txn.ipCity}, ${txn.ipCountry} — mismatch with account home country (${sender.homeCountry}).`,
    });
  }

  if (features.newReceiver === 1) {
    candidates.push({
      feature: 'Counterparty Novelty',
      contribution: 0.12,
      humanText: `Receiver ${txn.receiverId} is a new, previously unseen counterparty for ${sender.accountId}.`,
    });
  } else {
    candidates.push({
      feature: 'Counterparty Novelty',
      contribution: -0.07,
      humanText: `Receiver ${txn.receiverId} is an established historical counterparty.`,
    });
  }

  if (features.velocity24h >= 3) {
    candidates.push({
      feature: '24h Velocity',
      contribution: Number(Math.min(0.28, 0.08 + features.velocity24h * 0.03).toFixed(3)),
      humanText: `Account executed ${features.velocity24h} prior transfers within the preceding 24-hour window.`,
    });
  }

  for (const rule of rules) {
    if (!rule.triggered) continue;
    candidates.push({
      feature: rule.label,
      contribution: rule.severity === 'critical' ? 0.36 : 0.26,
      humanText: rule.reasons[0],
    });
  }

  if (senderMetrics && senderMetrics.roleFlag !== 'none') {
    candidates.push({
      feature: 'Sender Graph Topology',
      contribution: 0.27,
      humanText: senderMetrics.graphRiskReasons[0],
    });
  }
  if (receiverMetrics && receiverMetrics.roleFlag !== 'none') {
    candidates.push({
      feature: 'Receiver Graph Topology',
      contribution: 0.22,
      humanText: `Counterparty ${receiverMetrics.accountId}: ${receiverMetrics.graphRiskReasons[0]}`,
    });
  }

  const sorted = candidates.sort(
    (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution),
  );
  return sorted.slice(0, 6);
}
