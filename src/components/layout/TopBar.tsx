import { Menu, Radio } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import type { ViewId } from '../../types';

const VIEW_TITLES: Record<ViewId, string> = {
  overview: 'Security Command Center',
  transactions: 'Transaction Explorer',
  alerts: 'Investigation Queue',
  network: 'AML Entity Network',
  reports: 'Analytical Reports',
};

export function TopBar() {
  const { state, dispatch } = useFinGuard();
  const simOn = state.simulationEnabled;

  return (
    <header className="h-16 shrink-0 border-b border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 print:hidden">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => dispatch({ type: 'SET_MOBILE_NAV', open: true })}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-100 truncate">
          {VIEW_TITLES[state.activeView]}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={simOn}
          onClick={() => dispatch({ type: 'TOGGLE_SIMULATION' })}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            simOn
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Radio
            className={`w-3.5 h-3.5 shrink-0 ${simOn ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}
            aria-hidden="true"
          />
          <span>{simOn ? 'Live Simulation ON' : 'Live Simulation OFF'}</span>
        </button>
      </div>
    </header>
  );
}
