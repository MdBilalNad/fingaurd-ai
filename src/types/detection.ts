import type { RiskLevel, RuleFlag, Transaction } from './entities';

export interface ShapReason {
  feature: string;
  contribution: number;
  humanText: string;
}

export interface RuleOutcome {
  ruleId: RuleFlag;
  label: string;
  triggered: boolean;
  severity: RiskLevel;
  reasons: string[];
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  confidence: number;
  behavioralAnomalyScore: number;
  normalizedRuleSeverity: number;
  senderGraphRisk: number;
  receiverGraphRisk: number;
}

export interface AccountGraphMetrics {
  accountId: string;
  inDegree: number;
  outDegree: number;
  uniqueCounterparties: number;
  totalInAmount: number;
  totalOutAmount: number;
  fanOutRatio: number;
  passThroughRatio: number;
  avgHoldingHours: number;
  roleFlag: 'none' | 'potential_mule' | 'potential_shell';
  graphRiskScore: number;
  graphRiskReasons: string[];
  aggregateRiskScore: number;
  primaryReason: string;
}

export interface DetectionResult {
  txnId: string;
  transaction: Transaction;
  riskScore: RiskScore;
  triggeredRules: RuleOutcome[];
  flags: RuleFlag[];
  reasons: ShapReason[];
  cyclePath?: string[];
}

export type AlertStatus = 'open' | 'acknowledged' | 'dismissed';

export interface Alert {
  alertId: string;
  createdAt: string;
  severity: RiskLevel;
  alertType: string;
  primaryFlag: RuleFlag;
  description: string;
  affectedTxnIds: string[];
  accountIds: string[];
  riskScore: number;
  reasons: ShapReason[];
  status: AlertStatus;
}

export interface DetectedPattern {
  patternId: string;
  kind: 'circular_flow' | 'mule_cluster' | 'shell_chain';
  title: string;
  description: string;
  accountIds: string[];
  totalAmount: number;
  windowHours: number;
  severity: RiskLevel;
}
