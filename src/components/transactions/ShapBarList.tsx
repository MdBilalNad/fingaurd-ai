import type { ShapReason } from '../../types';

const FEATURE_CODE_MAP: Record<string, string> = {
  'Transaction Amount': 'AMOUNT',
  'Device Fingerprint': 'DEVICE',
  'Time-of-Day Window': 'TIME',
  'Cross-Border IP': 'GEO',
  'Counterparty Novelty': 'COUNTERPARTY',
  '24h Velocity': 'VELOCITY',
  'Sender Graph Topology': 'SENDER_GRAPH',
  'Receiver Graph Topology': 'RECV_GRAPH',
};

function toTerminalTag(feature: string): string {
  return FEATURE_CODE_MAP[feature] ?? feature.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

export function ShapBarList({ reasons }: { reasons: ShapReason[] }) {
  return (
    <div className="rounded border border-[#1e2530] bg-[#090b10] p-2.5 font-mono text-[11px] space-y-1.5">
      {reasons.map((reason, idx) => {
        const isPositive = reason.contribution >= 0;
        const signStr = `${isPositive ? '+' : ''}${reason.contribution.toFixed(2)}`;
        const tag = toTerminalTag(reason.feature);
        const valColor =
          reason.contribution >= 0.25
            ? 'text-rose-400'
            : isPositive
              ? 'text-amber-400'
              : 'text-emerald-400';

        return (
          <div
            key={`${reason.feature}-${idx}`}
            className="leading-relaxed border-b border-[#1e2530]/60 last:border-b-0 pb-1.5 last:pb-0"
          >
            <span className={`font-semibold tabular-nums ${valColor}`}>[{signStr}]</span>{' '}
            <span className="text-slate-500">❯</span>{' '}
            <span className="font-semibold text-slate-200">{tag}:</span>{' '}
            <span className="text-slate-400">{reason.humanText}</span>
          </div>
        );
      })}
    </div>
  );
}
