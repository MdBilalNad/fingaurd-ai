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
    <header className="h-12 shrink-0 border-b border-[#1e2530] bg-[#090b10]/95 backdrop-blur-sm px-3 lg:px-4 flex items-center justify-between gap-3 sticky top-0 z-30 print:hidden">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => dispatch({ type: 'SET_MOBILE_NAV', open: true })}
          className="lg:hidden p-1.5 rounded border border-[#1e2530] bg-[#11151c] text-slate-300 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="hidden sm:inline text-[11px] font-mono text-emerald-500 tracking-wider uppercase shrink-0">
          FG-CMD //
        </span>
        <h1 className="text-sm font-semibold tracking-normal text-slate-100 truncate">
          {VIEW_TITLES[state.activeView]}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <span className="hidden md:inline-flex items-center px-2 py-1 rounded border border-[#1e2530] bg-[#11151c] text-[10px] font-mono text-slate-400 tabular-nums">
          1,200 ACCTS · 90D
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={simOn}
          onClick={() => dispatch({ type: 'TOGGLE_SIMULATION' })}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            simOn
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 animate-sim-glow'
              : 'bg-[#11151c] text-slate-300 border-[#1e2530] hover:border-slate-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              simOn ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`}
          />
          <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{simOn ? 'LIVE SIM: ON' : 'LIVE SIM: OFF'}</span>
        </button>
      </div>
    </header>
  );
}
