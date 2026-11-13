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
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm"
    >
      {toasts.map((toast) => {
        const isCritical = toast.severity === 'critical';
        const isHigh = toast.severity === 'high';
        const borderCls = isCritical
          ? 'border-rose-500/50'
          : isHigh
            ? 'border-orange-500/50'
            : toast.severity === 'low'
              ? 'border-emerald-500/40'
              : 'border-slate-700';

        const Icon = isCritical || isHigh ? AlertOctagon : toast.severity === 'low' ? CheckCircle2 : Info;
        const iconCls = isCritical
          ? 'text-rose-400'
          : isHigh
            ? 'text-orange-400'
            : toast.severity === 'low'
              ? 'text-emerald-400'
              : 'text-slate-300';

        return (
          <div
            key={toast.id}
            role="status"
            className={`rounded-xl border ${borderCls} bg-slate-900/95 backdrop-blur-md p-3.5 shadow-xl flex items-start gap-3`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconCls}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {toast.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
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
                  className="mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  View transaction
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dispatch({ type: 'DISMISS_TOAST', id: toast.id })}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
