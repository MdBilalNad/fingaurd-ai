import type {
  Account,
  AccountGraphMetrics,
  Alert,
  DetectedPattern,
  DetectionResult,
  NetworkEdge,
  NetworkNode,
  RuleFlag,
  Transaction,
} from '../types';
import { buildAlertsFromResults } from './alertBuilder';
import { computeBehavioralFeatures } from './behavioralDetector';
import { detectCircularFlows } from './circularFlowDetector';
import { generateShapReasons } from './explainability';
import { computeAccountGraphMetrics } from './graphScorer';
import { buildNetworkGraphData, mapScoreToRiskLevel } from './networkBuilder';
import { HOUR_MS } from './prng';
import { evaluateBatchRules, maxRuleSeverity } from './ruleEngine';

export { mapScoreToRiskLevel };

export interface DetectionPipelineOutput {
  resultsByTxnId: Record<string, DetectionResult>;
  accountMetrics: Record<string, AccountGraphMetrics>;
  alerts: Alert[];
  patterns: DetectedPattern[];
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
}

export function runDetectionEngine(
  accounts: Account[],
  transactions: Transaction[],
): DetectionPipelineOutput {
  const accountMap = new Map(accounts.map((a) => [a.accountId, a]));
  const { txnCycleMap, cyclePatterns } = detectCircularFlows(transactions, 72);
  const { accountMetrics, graphPatterns } = computeAccountGraphMetrics(accounts, transactions);
  const { velocity24hByTxnId, ruleOutcomesByTxnId } = evaluateBatchRules(
    transactions,
    accountMap,
    txnCycleMap,
  );

  const resultsByTxnId: Record<string, DetectionResult> = {};
  const accRiskSum = new Map<string, { max: number; reason: string }>();

  for (const txn of transactions) {
    const sender = accountMap.get(txn.senderId)!;
    const sMetrics = accountMetrics[txn.senderId];
    const rMetrics = accountMetrics[txn.receiverId];
    const features = computeBehavioralFeatures(
      txn,
      sender,
      velocity24hByTxnId.get(txn.txnId) ?? 0,
    );
    const rules = ruleOutcomesByTxnId.get(txn.txnId) ?? [];
    const normRule = maxRuleSeverity(rules);
    const sGraph = sMetrics?.graphRiskScore ?? 0;
    const rGraph = rMetrics?.graphRiskScore ?? 0;

    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          100 *
            (0.4 * features.behavioralAnomalyScore +
              0.35 * normRule +
              0.15 * sGraph +
              0.1 * rGraph),
        ),
      ),
    );
    const level = mapScoreToRiskLevel(score);
    const flags: RuleFlag[] = rules.map((r) => r.ruleId);
    if (sMetrics?.roleFlag === 'potential_mule' && !flags.includes('MULE_BEHAVIOR')) {
      flags.push('MULE_BEHAVIOR');
    }
    if (rMetrics?.roleFlag === 'potential_shell' && !flags.includes('SHELL_BEHAVIOR')) {
      flags.push('SHELL_BEHAVIOR');
    }

    const reasons = generateShapReasons(txn, sender, features, rules, sMetrics, rMetrics);
    resultsByTxnId[txn.txnId] = {
      txnId: txn.txnId,
      transaction: txn,
      riskScore: {
        score,
        level,
        confidence: Math.min(99, Math.max(58, Math.round(62 + Math.abs(score - 35) * 0.55))),
        behavioralAnomalyScore: features.behavioralAnomalyScore,
        normalizedRuleSeverity: normRule,
        senderGraphRisk: sGraph,
        receiverGraphRisk: rGraph,
      },
      triggeredRules: rules,
      flags,
      reasons,
      cyclePath: txnCycleMap.get(txn.txnId),
    };

    const prev = accRiskSum.get(txn.senderId);
    if (!prev || score > prev.max) {
      accRiskSum.set(txn.senderId, {
        max: score,
        reason: reasons[0]?.humanText ?? 'Elevated behavioral score',
      });
    }
  }

  for (const acc of accounts) {
    const m = accountMetrics[acc.accountId];
    const stats = accRiskSum.get(acc.accountId);
    m.aggregateRiskScore = Math.min(
      100,
      Math.max(stats?.max ?? 0, Math.round(m.graphRiskScore * 100)),
    );
    if (m.graphRiskReasons.length > 0) m.primaryReason = m.graphRiskReasons[0];
    else if (stats) m.primaryReason = stats.reason;
  }

  const alerts = buildAlertsFromResults(transactions, resultsByTxnId);
  const { networkNodes, networkEdges } = buildNetworkGraphData(
    accounts,
    transactions,
    accountMetrics,
    resultsByTxnId,
  );

  return {
    resultsByTxnId,
    accountMetrics,
    alerts,
    patterns: [...cyclePatterns, ...graphPatterns],
    networkNodes,
    networkEdges,
  };
}

export function scoreSingleTransaction(
  txn: Transaction,
  accounts: Account[],
  recentTransactions: Transaction[],
  accountMetrics: Record<string, AccountGraphMetrics>,
): DetectionResult {
  const accountMap = new Map(accounts.map((a) => [a.accountId, a]));
  const sender = accountMap.get(txn.senderId)!;
  const txnMs = Date.parse(txn.timestamp);
  const recentSender = recentTransactions.filter(
    (t) => t.senderId === txn.senderId && txnMs - Date.parse(t.timestamp) <= 24 * HOUR_MS,
  );
  const features = computeBehavioralFeatures(txn, sender, recentSender.length);
  const { ruleOutcomesByTxnId } = evaluateBatchRules([txn, ...recentSender], accountMap, new Map());
  const rules = ruleOutcomesByTxnId.get(txn.txnId) ?? [];
  const normRule = maxRuleSeverity(rules);
  const sMetrics = accountMetrics[txn.senderId];
  const rMetrics = accountMetrics[txn.receiverId];
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 *
          (0.4 * features.behavioralAnomalyScore +
            0.35 * normRule +
            0.15 * (sMetrics?.graphRiskScore ?? 0) +
            0.1 * (rMetrics?.graphRiskScore ?? 0)),
      ),
    ),
  );
  return {
    txnId: txn.txnId,
    transaction: txn,
    riskScore: {
      score,
      level: mapScoreToRiskLevel(score),
      confidence: Math.min(99, Math.max(58, Math.round(62 + Math.abs(score - 35) * 0.55))),
      behavioralAnomalyScore: features.behavioralAnomalyScore,
      normalizedRuleSeverity: normRule,
      senderGraphRisk: sMetrics?.graphRiskScore ?? 0,
      receiverGraphRisk: rMetrics?.graphRiskScore ?? 0,
    },
    triggeredRules: rules,
    flags: rules.map((r) => r.ruleId),
    reasons: generateShapReasons(txn, sender, features, rules, sMetrics, rMetrics),
  };
}
