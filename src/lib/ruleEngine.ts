import type { Account, RiskLevel, RuleOutcome, Transaction } from '../types';
import { DAY_MS, HOUR_MS } from './prng';

export interface IndexedSenderTxn {
  txn: Transaction;
  tsMs: number;
}

const SEVERITY_WEIGHT: Record<RiskLevel, number> = {
  low: 0.25,
  medium: 0.5,
  high: 0.78,
  critical: 1.0,
};

export function maxRuleSeverity(outcomes: RuleOutcome[]): number {
  let max = 0;
  for (const r of outcomes) {
    if (r.triggered) max = Math.max(max, SEVERITY_WEIGHT[r.severity]);
  }
  return max;
}

function scanSenderWindows(list: IndexedSenderTxn[]) {
  const structuringFlags = new Set<string>();
  const velocityFlags = new Set<string>();
  const roundFlags = new Set<string>();
  const dormantBurstFlags = new Set<string>();
  const velocity24h = new Map<string, number>();

  let left48 = 0;
  const structWin: IndexedSenderTxn[] = [];
  for (const cur of list) {
    if (cur.txn.amount >= 8000 && cur.txn.amount < 10000) structWin.push(cur);
    while (left48 < structWin.length && cur.tsMs - structWin[left48].tsMs > 48 * HOUR_MS) {
      left48 += 1;
    }
    const active = structWin.slice(left48);
    if (active.length >= 3 && new Set(active.map((x) => x.txn.receiverId)).size >= 2) {
      for (const item of active) structuringFlags.add(item.txn.txnId);
    }
  }

  let v2Left = 0;
  let v24Left = 0;
  for (let i = 0; i < list.length; i += 1) {
    const cur = list[i];
    while (cur.tsMs - list[v2Left].tsMs > 2 * HOUR_MS) v2Left += 1;
    while (cur.tsMs - list[v24Left].tsMs > 24 * HOUR_MS) v24Left += 1;
    velocity24h.set(cur.txn.txnId, i - v24Left);
    if (i - v2Left + 1 >= 5) {
      for (let k = v2Left; k <= i; k += 1) velocityFlags.add(list[k].txn.txnId);
    }
  }

  const rounds = list.filter((x) => x.txn.amount >= 1000 && Math.round(x.txn.amount) % 1000 === 0);
  let rLeft = 0;
  for (let i = 0; i < rounds.length; i += 1) {
    while (rounds[i].tsMs - rounds[rLeft].tsMs > 24 * HOUR_MS) rLeft += 1;
    if (i - rLeft + 1 >= 3) {
      for (let k = rLeft; k <= i; k += 1) roundFlags.add(rounds[k].txn.txnId);
    }
  }

  for (let i = 1; i < list.length; i += 1) {
    if (list[i].tsMs - list[i - 1].tsMs > 60 * DAY_MS) {
      let end = i;
      while (end + 1 < list.length && list[end + 1].tsMs - list[i].tsMs <= 24 * HOUR_MS) end += 1;
      if (end - i + 1 >= 4) {
        for (let k = i; k <= end; k += 1) dormantBurstFlags.add(list[k].txn.txnId);
      }
    }
  }

  return { structuringFlags, velocityFlags, roundFlags, dormantBurstFlags, velocity24h };
}

export function evaluateBatchRules(
  transactions: Transaction[],
  accountMap: Map<string, Account>,
  txnCycleMap: Map<string, string[]>,
) {
  const bySenderAsc = new Map<string, IndexedSenderTxn[]>();
  const velocity24hByTxnId = new Map<string, number>();
  const ruleOutcomesByTxnId = new Map<string, RuleOutcome[]>();

  for (const txn of transactions) {
    const list = bySenderAsc.get(txn.senderId) ?? [];
    list.push({ txn, tsMs: Date.parse(txn.timestamp) });
    bySenderAsc.set(txn.senderId, list);
  }

  for (const [, list] of bySenderAsc) {
    list.sort((a, b) => a.tsMs - b.tsMs);
    const win = scanSenderWindows(list);
    for (const [id, v] of win.velocity24h) velocity24hByTxnId.set(id, v);

    for (const { txn } of list) {
      const sender = accountMap.get(txn.senderId);
      const outcomes: RuleOutcome[] = [];
      if (win.structuringFlags.has(txn.txnId)) {
        outcomes.push({
          ruleId: 'STRUCTURING',
          label: 'Structuring Pattern',
          triggered: true,
          severity: 'high',
          reasons: ['Three or more transfers just below $10,000 within 48h to distinct receivers.'],
        });
      }
      if (win.velocityFlags.has(txn.txnId)) {
        outcomes.push({
          ruleId: 'VELOCITY',
          label: 'Velocity Burst',
          triggered: true,
          severity: 'high',
          reasons: ['Five or more outgoing transactions from this account within a 2-hour window.'],
        });
      }
      if (win.roundFlags.has(txn.txnId)) {
        outcomes.push({
          ruleId: 'ROUND_AMOUNT',
          label: 'Round-Amount Transfers',
          triggered: true,
          severity: 'high',
          reasons: ['Repeated exact round-thousand dollar transfers within 24 hours.'],
        });
      }
      if (sender && txn.isCrossBorder && txn.ipCountry !== sender.homeCountry && txn.amount >= Math.max(4000, sender.avgTransactionAmount * 2.5)) {
        outcomes.push({
          ruleId: 'CROSS_BORDER_ANOMALY',
          label: 'Cross-Border Anomaly',
          triggered: true,
          severity: txn.amount >= 10000 ? 'critical' : 'high',
          reasons: [`High-value cross-border transfer via ${txn.ipCountry}, diverging from home (${sender.homeCountry}).`],
        });
      }
      if (sender && !sender.knownDevices.includes(txn.deviceId) && txn.amount >= sender.avgTransactionAmount * 3) {
        outcomes.push({
          ruleId: 'NEW_DEVICE_HIGH_VALUE',
          label: 'New Device High-Value',
          triggered: true,
          severity: 'high',
          reasons: ['Transaction exceeds 3× account average from an unrecognised device fingerprint.'],
        });
      }
      if (win.dormantBurstFlags.has(txn.txnId)) {
        outcomes.push({
          ruleId: 'DORMANT_BURST',
          label: 'Dormant Account Burst',
          triggered: true,
          severity: 'critical',
          reasons: ['Account dormant over 60 days before initiating 4+ rapid transfers in 24h.'],
        });
      }
      const cycle = txnCycleMap.get(txn.txnId);
      if (cycle) {
        outcomes.push({
          ruleId: 'CIRCULAR_FLOW',
          label: 'Circular Flow Ring',
          triggered: true,
          severity: 'critical',
          reasons: [`Part of a 72-hour circular fund rotation (${cycle.join(' → ')}).`],
        });
      }
      ruleOutcomesByTxnId.set(txn.txnId, outcomes);
    }
  }

  return { bySenderAsc, velocity24hByTxnId, ruleOutcomesByTxnId };
}
