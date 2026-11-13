import type { FinGuardAction, FinGuardState, TransactionFilters } from '../types';

export const DEFAULT_FILTERS: TransactionFilters = {
  searchAccount: '',
  riskLevels: [],
  channels: [],
  dateRangeDays: 90,
  sortField: 'timestamp',
  sortDirection: 'desc',
  page: 1,
};

export function finGuardReducer(
  state: FinGuardState,
  action: FinGuardAction,
): FinGuardState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.view, mobileNavOpen: false };

    case 'SELECT_TXN':
      return {
        ...state,
        selectedTxnId: action.txnId,
        activeView: action.navigateToTransactions ? 'transactions' : state.activeView,
        mobileNavOpen: false,
      };

    case 'SET_ALERT_TAB':
      return { ...state, alertStatusTab: action.tab };

    case 'UPDATE_ALERT_STATUS': {
      const updated = state.alerts.map((al) =>
        al.alertId === action.alertId ? { ...al, status: action.status } : al,
      );
      return { ...state, alerts: updated };
    }

    case 'SET_FILTERS': {
      const nextFilters = {
        ...state.filters,
        ...action.patch,
        page: action.patch.page ?? 1,
      };
      return { ...state, filters: nextFilters };
    }

    case 'RESET_FILTERS':
      return { ...state, filters: DEFAULT_FILTERS };

    case 'TOGGLE_SIMULATION':
      return { ...state, simulationEnabled: !state.simulationEnabled };

    case 'SET_MOBILE_NAV':
      return { ...state, mobileNavOpen: action.open };

    case 'SELECT_PATTERN':
      return { ...state, selectedPatternId: action.patternId };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, 4),
      };

    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };

    case 'INJECT_TRANSACTION': {
      const nextTxns = [action.transaction, ...state.transactions];
      const nextResults = {
        ...state.resultsByTxnId,
        [action.transaction.txnId]: action.result,
      };
      const nextAlerts = action.newAlert
        ? [action.newAlert, ...state.alerts]
        : state.alerts;
      return {
        ...state,
        transactions: nextTxns,
        resultsByTxnId: nextResults,
        alerts: nextAlerts,
        anchorNowMs: Math.max(
          state.anchorNowMs,
          Date.parse(action.transaction.timestamp),
        ),
      };
    }

    default:
      return state;
  }
}
