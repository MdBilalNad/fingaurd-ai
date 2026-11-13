import type { RiskLevel } from './entities';

export interface NetworkNode {
  id: string;
  accountId: string;
  accountType: 'individual' | 'business';
  riskScore: number;
  riskLevel: RiskLevel;
  volume: number;
  roleFlag: 'none' | 'potential_mule' | 'potential_shell';
  fanOutRatio: number;
  inDegree: number;
  outDegree: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  txnCount: number;
  totalAmount: number;
  maxRiskScore: number;
  avgRiskScore: number;
  isCircular: boolean;
}
