import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { generateSyntheticDataset } from '../lib/dataGenerator';
import { runDetectionEngine } from '../lib/detectionEngine';
import { DEMO_ANCHOR_MS, DEMO_SEED } from '../lib/prng';
import type { FinGuardAction, FinGuardState } from '../types';
import { DEFAULT_FILTERS, finGuardReducer } from './finGuardReducer';

interface FinGuardContextValue {
  state: FinGuardState;
  dispatch: Dispatch<FinGuardAction>;
}

const FinGuardContext = createContext<FinGuardContextValue | null>(null);

function createInitialState(): FinGuardState {
  const { accounts, transactions } = generateSyntheticDataset(DEMO_SEED, DEMO_ANCHOR_MS);
  const detection = runDetectionEngine(accounts, transactions);
  const firstFlagged = transactions.find(
    (t) => detection.resultsByTxnId[t.txnId].riskScore.score >= 50,
  );

  return {
    activeView: 'overview',
    selectedTxnId: firstFlagged?.txnId ?? transactions[0]?.txnId ?? null,
    selectedPatternId: detection.patterns[0]?.patternId ?? null,
    alertStatusTab: 'open',
    filters: DEFAULT_FILTERS,
    simulationEnabled: false,
    mobileNavOpen: false,
    accounts,
    transactions,
    resultsByTxnId: detection.resultsByTxnId,
    accountMetrics: detection.accountMetrics,
    alerts: detection.alerts,
    patterns: detection.patterns,
    networkNodes: detection.networkNodes,
    networkEdges: detection.networkEdges,
    toasts: [],
    anchorNowMs: DEMO_ANCHOR_MS,
  };
}

export function FinGuardProvider({ children }: { children: ReactNode }) {
  const initialState = useMemo(() => createInitialState(), []);
  const [state, dispatch] = useReducer(finGuardReducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <FinGuardContext.Provider value={value}>{children}</FinGuardContext.Provider>
  );
}

export function useFinGuard() {
  const ctx = useContext(FinGuardContext);
  if (!ctx) {
    throw new Error('useFinGuard must be used within a FinGuardProvider');
  }
  return ctx;
}
