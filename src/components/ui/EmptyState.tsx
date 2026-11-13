interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center rounded-xl border border-slate-800 bg-slate-900/40">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="mb-4 text-slate-600"
      >
        <rect
          x="10"
          y="14"
          width="44"
          height="36"
          rx="6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M18 26H46M18 34H36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="46" cy="44" r="10" fill="#0B0F17" stroke="#334155" strokeWidth="1.5" />
        <path
          d="M43 44L49 44"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
