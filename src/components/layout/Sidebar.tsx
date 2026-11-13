import {
  ArrowLeftRight,
  BellRing,
  FileText,
  LayoutDashboard,
  Network,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import type { ViewId } from '../../types';

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'alerts', label: 'Alerts', icon: BellRing },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function Sidebar() {
  const { state, dispatch } = useFinGuard();
  const openAlertCount = state.alerts.filter((a) => a.status === 'open').length;

  const navContent = (
    <div className="flex flex-col h-full bg-[#0E1420] border-r border-slate-800 w-64">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            FinGuard AI
          </span>
        </div>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => dispatch({ type: 'SET_MOBILE_NAV', open: false })}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = state.activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_VIEW', view: item.id })}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-slate-800/90 text-slate-50 border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </span>
              {item.id === 'alerts' && openAlertCount > 0 && (
                <span className="text-xs font-mono tabular-nums text-rose-400">
                  {openAlertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-medium text-slate-200">
              Detection engine: Online
            </span>
          </div>
          <p className="text-xs text-slate-400 pl-4">Data: Synthetic (seeded)</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen print:hidden">{navContent}</aside>
      {state.mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => dispatch({ type: 'SET_MOBILE_NAV', open: false })}
          />
          <div className="relative z-50 h-full">{navContent}</div>
        </div>
      )}
    </>
  );
}
