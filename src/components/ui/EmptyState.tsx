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
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded border border-[#1e2530] bg-[#11151c]">
      <svg
        width="48"
        height="48"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="mb-3 text-slate-600"
      >
        <rect
          x="10"
          y="14"
          width="44"
          height="36"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M18 26H46M18 34H36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <circle cx="46" cy="44" r="10" fill="#090b10" stroke="#1e2530" strokeWidth="1.5" />
        <path
          d="M43 44L49 44"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
      <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 px-3 py-1.5 text-xs font-mono rounded bg-[#090b10] text-slate-200 border border-[#1e2530] hover:border-emerald-500/50 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
