import type {
  Account,
  AccountGraphMetrics,
  DetectedPattern,
  Transaction,
} from '../types';
import { HOUR_MS } from './prng';

export function computeAccountGraphMetrics(
  accounts: Account[],
  transactions: Transaction[],
): {
  accountMetrics: Record<string, AccountGraphMetrics>;
  graphPatterns: DetectedPattern[];
} {
  const inTxns = new Map<string, { tsMs: number; amount: number; peer: string }[]>();
  const outTxns = new Map<string, { tsMs: number; amount: number; peer: string }[]>();

  for (const t of transactions) {
    const tsMs = Date.parse(t.timestamp);
    const inList = inTxns.get(t.receiverId) ?? [];
    inList.push({ tsMs, amount: t.amount, peer: t.senderId });
    inTxns.set(t.receiverId, inList);

    const outList = outTxns.get(t.senderId) ?? [];
    outList.push({ tsMs, amount: t.amount, peer: t.receiverId });
    outTxns.set(t.senderId, outList);
  }

  const accountMetrics: Record<string, AccountGraphMetrics> = {};
  const graphPatterns: DetectedPattern[] = [];

  for (const acc of accounts) {
    const incoming = (inTxns.get(acc.accountId) ?? []).sort((a, b) => a.tsMs - b.tsMs);
    const outgoing = (outTxns.get(acc.accountId) ?? []).sort((a, b) => a.tsMs - b.tsMs);

    const inDegree = incoming.length;
    const outDegree = outgoing.length;
    const counterparties = new Set<string>([
      ...incoming.map((x) => x.peer),
      ...outgoing.map((x) => x.peer),
    ]);

    const totalInAmount = incoming.reduce((s, x) => s + x.amount, 0);
    const totalOutAmount = outgoing.reduce((s, x) => s + x.amount, 0);
    const fanOutRatio = outDegree / Math.max(inDegree, 1);

    // Outgoing amount within 24h after any incoming transfer & holding times
    let rapidOutAmount = 0;
    const holdingHours: number[] = [];
    for (const outItem of outgoing) {
      const matchIn = incoming.find(
        (inItem) =>
          outItem.tsMs >= inItem.tsMs && outItem.tsMs - inItem.tsMs <= 24 * HOUR_MS,
      );
      if (matchIn) {
        rapidOutAmount += outItem.amount;
        holdingHours.push((outItem.tsMs - matchIn.tsMs) / HOUR_MS);
      }
    }

    const passThroughRatio =
      totalInAmount > 0 ? Math.min(1.5, rapidOutAmount / totalInAmount) : 0;
    const avgHoldingHours =
      holdingHours.length > 0
        ? holdingHours.reduce((s, v) => s + v, 0) / holdingHours.length
        : 48;

    const isMule = fanOutRatio > 5 && passThroughRatio > 0.8;
    const isShell = inDegree > 20 && avgHoldingHours < 6;

    const roleFlag = isMule
      ? 'potential_mule'
      : isShell
        ? 'potential_shell'
        : 'none';

    const graphRiskReasons: string[] = [];
    if (isMule) {
      graphRiskReasons.push(
        `Fan-out ratio ${fanOutRatio.toFixed(1)}× with ${Math.round(passThroughRatio * 100)}% pass-through within 24h (potential mule).`,
      );
      graphPatterns.push({
        patternId: `MULE-${acc.accountId}`,
        kind: 'mule_cluster',
        title: `Mule Cluster · ${acc.accountId}`,
        description: `Account ${acc.accountId} dispersed ${outDegree} outbound transfers (${fanOutRatio.toFixed(1)}× fan-out) moving ${Math.round(passThroughRatio * 100)}% of inbound funds within 24h.`,
        accountIds: [acc.accountId, ...outgoing.slice(0, 7).map((o) => o.peer)],
        totalAmount: totalOutAmount,
        windowHours: 24,
        severity: 'high',
      });
    }
    if (isShell) {
      graphRiskReasons.push(
        `High inbound concentration (${inDegree} inflows) with ${avgHoldingHours.toFixed(1)}h average holding time (potential shell).`,
      );
      graphPatterns.push({
        patternId: `SHELL-${acc.accountId}`,
        kind: 'shell_chain',
        title: `Shell Dispersion · ${acc.accountId}`,
        description: `Shell account ${acc.accountId} aggregated ${inDegree} inbound transfers and rapidly dispersed funds in ${avgHoldingHours.toFixed(1)}h average holding window.`,
        accountIds: [acc.accountId, ...outgoing.slice(0, 3).map((o) => o.peer)],
        totalAmount: totalInAmount,
        windowHours: Math.max(1, Math.round(avgHoldingHours)),
        severity: 'critical',
      });
    }

    const graphRiskScore = isShell
      ? 0.92
      : isMule
        ? 0.85
        : Math.min(0.45, Math.max(0, (fanOutRatio - 2) * 0.08));

    accountMetrics[acc.accountId] = {
      accountId: acc.accountId,
      inDegree,
      outDegree,
      uniqueCounterparties: counterparties.size,
      totalInAmount,
      totalOutAmount,
      fanOutRatio: Math.round(fanOutRatio * 100) / 100,
      passThroughRatio: Math.round(passThroughRatio * 100) / 100,
      avgHoldingHours: Math.round(avgHoldingHours * 10) / 10,
      roleFlag,
      graphRiskScore,
      graphRiskReasons,
      aggregateRiskScore: 0,
      primaryReason: graphRiskReasons[0] ?? 'Normal transaction topology',
    };
  }

  return { accountMetrics, graphPatterns };
}
