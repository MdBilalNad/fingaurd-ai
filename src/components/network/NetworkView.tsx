import { useMemo } from 'react';
import { useFinGuard } from '../../context/FinGuardContext';
import { NetworkGraphSvg } from './NetworkGraphSvg';
import { PatternSidebar } from './PatternSidebar';
import { useForceLayout } from './useForceLayout';

export function NetworkView() {
  const { state, dispatch } = useFinGuard();
  const { nodes, width, height } = useForceLayout(
    state.networkNodes,
    state.networkEdges,
  );

  const highlightedAccounts = useMemo(() => {
    const selected = state.patterns.find(
      (p) => p.patternId === state.selectedPatternId,
    );
    return new Set(selected?.accountIds ?? []);
  }, [state.patterns, state.selectedPatternId]);

  const handleSelectAccount = (accountId: string) => {
    dispatch({
      type: 'SET_FILTERS',
      patch: { searchAccount: accountId, page: 1 },
    });
    dispatch({ type: 'SET_VIEW', view: 'transactions' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
      <div className="xl:col-span-8">
        <NetworkGraphSvg
          nodes={nodes}
          edges={state.networkEdges}
          width={width}
          height={height}
          highlightedAccounts={highlightedAccounts}
          onSelectAccount={handleSelectAccount}
        />
      </div>
      <div className="xl:col-span-4">
        <PatternSidebar />
      </div>
    </div>
  );
}
