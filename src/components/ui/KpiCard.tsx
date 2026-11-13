import type { ReactNode } from 'react';
import { Card, type CardAccent } from './Card';

interface KpiCardProps {
  label: string;
  value: string;
  title?: string;
  subtitle: ReactNode;
  accent: CardAccent;
  sparkline?: number[];
  sparkColor?: string;
  valueColorClass?: string;
}

function MiniSparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 68;
      const y = 22 - ((v - min) / span) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width="68" height="24" viewBox="0 0 68 24" aria-hidden="true" className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        points={pts}
      />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  title,
  subtitle,
  accent,
  sparkline,
  sparkColor = '#10B981',
  valueColorClass = 'text-slate-100',
}: KpiCardProps) {
  return (
    <Card accent={accent} padding="sm" className="flex flex-col justify-between gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p
            title={title}
            className={`mt-1 text-2xl font-bold font-mono tabular-nums tracking-tight ${valueColorClass}`}
          >
            {value}
          </p>
        </div>
        {sparkline && sparkline.length >= 2 && (
          <div className="pt-1">
            <MiniSparkline values={sparkline} color={sparkColor} />
          </div>
        )}
      </div>
      <div className="pt-1.5 border-t border-[#1e2530] text-[11px] font-mono text-slate-400 tabular-nums truncate">
        {subtitle}
      </div>
    </Card>
  );
}
