import type { Account, Channel, RiskLevel, Transaction } from './entities';
import type {
  AccountGraphMetrics,
  Alert,
  AlertStatus,
  DetectedPattern,
  DetectionResult,
} from './detection';
import type { NetworkEdge, NetworkNode } from './network';

export type ViewId = 'overview' | 'transactions' | 'alerts' | 'network' | 'reports';
export type DateRangeDays = 7 | 30 | 90;
export type SortField = 'timestamp' | 'amount' | 'riskScore';
export type SortDirection = 'asc' | 'desc';

export interface TransactionFilters {
  searchAccount: string;
  riskLevels: RiskLevel[];
  channels: Channel[];
  dateRangeDays: DateRangeDays;
  sortField: SortField;
  sortDirection: SortDirection;
  page: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel | 'info';
  txnId?: string;
}

export interface FinGuardState {
  activeView: ViewId;
  selectedTxnId: string | null;
  selectedPatternId: string | null;
  alertStatusTab: AlertStatus;
  filters: TransactionFilters;
  simulationEnabled: boolean;
  mobileNavOpen: boolean;
  accounts: Account[];
  transactions: Transaction[];
  resultsByTxnId: Record<string, DetectionResult>;
  accountMetrics: Record<string, AccountGraphMetrics>;
  alerts: Alert[];
  patterns: DetectedPattern[];
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  toasts: ToastMessage[];
  anchorNowMs: number;
}

export type FinGuardAction =
  | { type: 'SET_VIEW'; view: ViewId }
  | { type: 'SELECT_TXN'; txnId: string | null; navigateToTransactions?: boolean }
  | { type: 'SET_ALERT_TAB'; tab: AlertStatus }
  | { type: 'UPDATE_ALERT_STATUS'; alertId: string; status: AlertStatus }
  | { type: 'SET_FILTERS'; patch: Partial<TransactionFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_SIMULATION' }
  | { type: 'SET_MOBILE_NAV'; open: boolean }
  | { type: 'SELECT_PATTERN'; patternId: string | null }
  | { type: 'ADD_TOAST'; toast: ToastMessage }
  | { type: 'DISMISS_TOAST'; id: string }
  | {
      type: 'INJECT_TRANSACTION';
      transaction: Transaction;
      result: DetectionResult;
      newAlert?: Alert;
    };
