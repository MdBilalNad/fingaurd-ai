export type AccountType = 'individual' | 'business';
export type RiskTier = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type Channel =
  | 'UPI'
  | 'card'
  | 'wallet'
  | 'bank_transfer'
  | 'ATM'
  | 'crypto_onramp';

export type GroundTruth = 'legitimate' | 'suspicious' | 'fraud';

export type RuleFlag =
  | 'STRUCTURING'
  | 'VELOCITY'
  | 'ROUND_AMOUNT'
  | 'CROSS_BORDER_ANOMALY'
  | 'NEW_DEVICE_HIGH_VALUE'
  | 'CIRCULAR_FLOW'
  | 'DORMANT_BURST'
  | 'MULE_BEHAVIOR'
  | 'SHELL_BEHAVIOR';

export interface Account {
  accountId: string;
  accountType: AccountType;
  homeCountry: string;
  homeCity: string;
  avgTransactionAmount: number;
  stdDevAmount: number;
  typicalHours: number[];
  knownDevices: string[];
  accountAgeDays: number;
  riskTier: RiskTier;
  archetype?: 'normal' | 'mule' | 'shell';
}

export interface Transaction {
  txnId: string;
  timestamp: string;
  amount: number;
  currency: 'USD';
  senderId: string;
  receiverId: string;
  channel: Channel;
  deviceId: string;
  ipCountry: string;
  ipCity: string;
  merchantCategory: string;
  isCrossBorder: boolean;
  isNewReceiver: boolean;
  groundTruth: GroundTruth;
  injectedPattern?: RuleFlag;
}
