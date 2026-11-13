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

  const desktopRail = (
    <div className="flex flex-col items-center h-full w-14 bg-[#090b10] border-r border-[#1e2530]">
      <div className="h-12 w-full flex items-center justify-center border-b border-[#1e2530] shrink-0">
        <div
          title="FinGuard AI"
          className="w-8 h-8 rounded bg-[#11151c] border border-emerald-500/40 flex items-center justify-center"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
        </div>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 w-full py-2.5 px-1.5 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = state.activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => dispatch({ type: 'SET_VIEW', view: item.id })}
              className={`group relative w-full h-9 rounded flex items-center justify-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-[#11151c] text-emerald-400 border-[#1e2530] border-l-2 border-l-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-[#11151c]/70'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {item.id === 'alerts' && openAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
              <span
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 rounded bg-[#090b10] border border-[#1e2530] text-[11px] font-mono text-slate-100 whitespace-nowrap z-50"
              >
                {item.label}
                {item.id === 'alerts' && openAlertCount > 0 ? ` [${openAlertCount}]` : ''}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="w-full py-3 border-t border-[#1e2530] flex items-center justify-center">
        <div className="group relative flex items-center justify-center p-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            role="tooltip"
            className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 px-2 py-1 rounded bg-[#090b10] border border-[#1e2530] text-[10px] font-mono text-emerald-400 whitespace-nowrap z-50"
          >
            ENGINE: ONLINE // SYNTHETIC
          </span>
        </div>
      </div>
    </div>
  );

  const mobileDrawer = (
    <div className="flex flex-col h-full bg-[#090b10] border-r border-[#1e2530] w-56">
      <div className="flex items-center justify-between px-3 h-12 border-b border-[#1e2530] shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-100">
            FinGuard AI
          </span>
        </div>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => dispatch({ type: 'SET_MOBILE_NAV', open: false })}
          className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#11151c]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <nav aria-label="Mobile navigation" className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = state.activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_VIEW', view: item.id })}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-mono transition-colors ${
                active
                  ? 'bg-[#11151c] text-emerald-400 border border-[#1e2530]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#11151c]/60 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </span>
              {item.id === 'alerts' && openAlertCount > 0 && (
                <span className="text-[11px] text-rose-400 tabular-nums">{openAlertCount}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen print:hidden z-40">
        {desktopRail}
      </aside>
      {state.mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => dispatch({ type: 'SET_MOBILE_NAV', open: false })}
          />
          <div className="relative z-50 h-full">{mobileDrawer}</div>
        </div>
      )}
    </>
  );
}
