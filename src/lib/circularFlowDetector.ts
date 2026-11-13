import type { DetectedPattern, Transaction } from '../types';
import { HOUR_MS } from './prng';

export interface CircularFlowResult {
  txnCycleMap: Map<string, string[]>;
  cyclePatterns: DetectedPattern[];
}

interface DirectedEdgeRecord {
  txnId: string;
  senderId: string;
  receiverId: string;
  tsMs: number;
  amount: number;
}

export function detectCircularFlows(
  transactions: Transaction[],
  windowHours = 72,
): CircularFlowResult {
  const windowMs = windowHours * HOUR_MS;
  const txnCycleMap = new Map<string, string[]>();
  const cyclePatterns: DetectedPattern[] = [];

  // Sort ascending by timestamp for chronological cycle discovery
  const sorted: DirectedEdgeRecord[] = transactions
    .map((t) => ({
      txnId: t.txnId,
      senderId: t.senderId,
      receiverId: t.receiverId,
      tsMs: Date.parse(t.timestamp),
      amount: t.amount,
    }))
    .sort((a, b) => a.tsMs - b.tsMs);

  // Build adjacency list of directed edges
  const outEdges = new Map<string, DirectedEdgeRecord[]>();
  for (const edge of sorted) {
    const list = outEdges.get(edge.senderId) ?? [];
    list.push(edge);
    outEdges.set(edge.senderId, list);
  }

  const seenCycleKeys = new Set<string>();

  for (const startEdge of sorted) {
    if (txnCycleMap.has(startEdge.txnId)) continue;
    const startNode = startEdge.senderId;

    // DFS up to depth 5 looking for return to startNode within 72h
    const dfs = (
      currNode: string,
      lastTs: number,
      pathNodes: string[],
      pathEdges: DirectedEdgeRecord[],
    ): boolean => {
      const nextEdges = outEdges.get(currNode);
      if (!nextEdges) return false;

      for (const e of nextEdges) {
        if (e.tsMs < lastTs || e.tsMs - startEdge.tsMs > windowMs) continue;
        if (e.receiverId === startNode && pathNodes.length >= 3) {
          const fullEdges = [...pathEdges, e];
          const cycleAccounts = [...pathNodes, startNode];
          const canonical = [...pathNodes].sort().join('|');
          if (!seenCycleKeys.has(canonical)) {
            seenCycleKeys.add(canonical);
            const totalAmount = fullEdges.reduce((s, item) => s + item.amount, 0);
            const spanHrs = Math.max(
              1,
              Math.round((e.tsMs - startEdge.tsMs) / HOUR_MS),
            );
            cyclePatterns.push({
              patternId: `CYCLE-${cyclePatterns.length + 1}`,
              kind: 'circular_flow',
              title: `Circular Flow (${pathNodes.length}-Hop Ring)`,
              description: `Circular flow detected: ${cycleAccounts.join(' → ')} within ${spanHrs}h. Total moved: $${Math.round(totalAmount).toLocaleString('en-US')}. Pattern is consistent with layering.`,
              accountIds: pathNodes,
              totalAmount,
              windowHours: spanHrs,
              severity: 'critical',
            });
          }
          for (const ce of fullEdges) {
            txnCycleMap.set(ce.txnId, cycleAccounts);
          }
          return true;
        }
        if (
          pathNodes.length < 5 &&
          !pathNodes.includes(e.receiverId) &&
          e.receiverId !== startNode
        ) {
          if (
            dfs(
              e.receiverId,
              e.tsMs,
              [...pathNodes, e.receiverId],
              [...pathEdges, e],
            )
          ) {
            return true;
          }
        }
      }
      return false;
    };

    dfs(startEdge.receiverId, startEdge.tsMs, [startNode, startEdge.receiverId], [
      startEdge,
    ]);
  }

  return { txnCycleMap, cyclePatterns };
}
