import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { RiskLevel } from '../../types';

const LEVEL_STYLES: Record<
  RiskLevel,
  { bg: string; text: string; border: string; label: string }
> = {
  low: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    label: 'Low',
  },
  medium: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/25',
    label: 'Medium',
  },
  high: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/25',
    label: 'High',
  },
  critical: {
    bg: 'bg-rose-600/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    label: 'Critical',
  },
};

export function RiskLevelPill({ level }: { level: RiskLevel }) {
  const s = LEVEL_STYLES[level];
  const Icon =
    level === 'critical'
      ? AlertOctagon
      : level === 'high'
        ? ShieldAlert
        : level === 'medium'
          ? AlertTriangle
          : CheckCircle2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{s.label}</span>
    </span>
  );
}

export function RiskScoreBadge({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const s = LEVEL_STYLES[level];
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums border ${s.bg} ${s.text} ${s.border}`}
    >
      {score}
    </span>
  );
}
