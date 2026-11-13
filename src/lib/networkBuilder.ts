import type {
  Account,
  AccountGraphMetrics,
  DetectionResult,
  NetworkEdge,
  NetworkNode,
  RiskLevel,
  Transaction,
} from '../types';

export function mapScoreToRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function buildNetworkGraphData(
  accounts: Account[],
  transactions: Transaction[],
  accountMetrics: Record<string, AccountGraphMetrics>,
  resultsByTxnId: Record<string, DetectionResult>,
): { networkNodes: NetworkNode[]; networkEdges: NetworkEdge[] } {
  const topAccounts = [...accounts]
    .sort(
      (a, b) =>
        accountMetrics[b.accountId].aggregateRiskScore -
        accountMetrics[a.accountId].aggregateRiskScore,
    )
    .slice(0, 80);

  const topSet = new Set(topAccounts.map((a) => a.accountId));

  const networkNodes: NetworkNode[] = topAccounts.map((acc, idx) => {
    const m = accountMetrics[acc.accountId];
    const angle = (idx / topAccounts.length) * Math.PI * 2;
    const radius = 135 + (idx % 4) * 42;
    return {
      id: acc.accountId,
      accountId: acc.accountId,
      accountType: acc.accountType,
      riskScore: m.aggregateRiskScore,
      riskLevel: mapScoreToRiskLevel(m.aggregateRiskScore),
      volume: Math.max(1000, m.totalInAmount + m.totalOutAmount),
      roleFlag: m.roleFlag,
      fanOutRatio: m.fanOutRatio,
      inDegree: m.inDegree,
      outDegree: m.outDegree,
      x: 420 + Math.cos(angle) * radius,
      y: 280 + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    };
  });

  const edgeMap = new Map<string, NetworkEdge>();
  for (const txn of transactions) {
    if (!topSet.has(txn.senderId) || !topSet.has(txn.receiverId)) continue;
    const res = resultsByTxnId[txn.txnId];
    const key = `${txn.senderId}->${txn.receiverId}`;
    const existing = edgeMap.get(key);
    const isCircular = Boolean(res?.cyclePath);
    if (!existing) {
      edgeMap.set(key, {
        id: key,
        source: txn.senderId,
        target: txn.receiverId,
        txnCount: 1,
        totalAmount: txn.amount,
        maxRiskScore: res.riskScore.score,
        avgRiskScore: res.riskScore.score,
        isCircular,
      });
    } else {
      existing.txnCount += 1;
      existing.totalAmount += txn.amount;
      existing.maxRiskScore = Math.max(existing.maxRiskScore, res.riskScore.score);
      existing.avgRiskScore =
        (existing.avgRiskScore * (existing.txnCount - 1) + res.riskScore.score) /
        existing.txnCount;
      existing.isCircular = existing.isCircular || isCircular;
    }
  }

  return { networkNodes, networkEdges: Array.from(edgeMap.values()) };
}
