import { useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';

export function ToastContainer() {
  const { state, dispatch } = useFinGuard();
  const { toasts } = state;

  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const latest = toasts[0];
    const timer = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', id: latest.id });
    }, 5500);
    return () => window.clearTimeout(timer);
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-3 right-3 z-50 flex flex-col gap-2 w-[calc(100vw-1.5rem)] max-w-sm"
    >
      {toasts.map((toast) => {
        const isCritical = toast.severity === 'critical';
        const isHigh = toast.severity === 'high';
        const borderCls = isCritical
          ? 'border-l-2 border-l-rose-500 border-[#1e2530]'
          : isHigh
            ? 'border-l-2 border-l-amber-400 border-[#1e2530]'
            : toast.severity === 'low'
              ? 'border-l-2 border-l-emerald-500 border-[#1e2530]'
              : 'border-l-2 border-l-slate-500 border-[#1e2530]';

        const Icon = isCritical || isHigh ? AlertOctagon : toast.severity === 'low' ? CheckCircle2 : Info;
        const iconCls = isCritical
          ? 'text-rose-500'
          : isHigh
            ? 'text-amber-400'
            : toast.severity === 'low'
              ? 'text-emerald-500'
              : 'text-slate-400';

        return (
          <div
            key={toast.id}
            role="status"
            className={`rounded border ${borderCls} bg-[#090b10] p-3 flex items-start gap-2.5`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconCls}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-semibold text-slate-100 truncate">
                {toast.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {toast.description}
              </p>
              {toast.txnId && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: 'SELECT_TXN',
                      txnId: toast.txnId!,
                      navigateToTransactions: true,
                    });
                    dispatch({ type: 'DISMISS_TOAST', id: toast.id });
                  }}
                  className="mt-1.5 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  Inspect {toast.txnId}
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dispatch({ type: 'DISMISS_TOAST', id: toast.id })}
              className="p-0.5 text-slate-500 hover:text-slate-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
