import type { ReactNode } from 'react';

export type CardAccent = 'none' | 'emerald' | 'amber' | 'orange' | 'rose' | 'neutral';

interface CardProps {
  children: ReactNode;
  accent?: CardAccent;
  padding?: 'none' | 'sm' | 'md';
  className?: string;
}

const ACCENT_BORDER: Record<CardAccent, string> = {
  none: '',
  emerald: 'border-t-2 border-t-emerald-500',
  amber: 'border-t-2 border-t-amber-400',
  orange: 'border-t-2 border-t-orange-500',
  rose: 'border-t-2 border-t-rose-500',
  neutral: 'border-t-2 border-t-slate-500',
};

const PADDING_CLS: Record<'none' | 'sm' | 'md', string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
};

export function Card({
  children,
  accent = 'none',
  padding = 'md',
  className = '',
}: CardProps) {
  return (
    <div
      className={`rounded border border-[#1e2530] bg-[#11151c] ${ACCENT_BORDER[accent]} ${PADDING_CLS[padding]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
