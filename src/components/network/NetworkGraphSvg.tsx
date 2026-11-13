import { useState } from 'react';
import type { NetworkEdge, NetworkNode, RiskLevel } from '../../types';
import { Card } from '../ui/Card';

const NODE_FILL: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#FBBF24',
  high: '#F97316',
  critical: '#F43F5E',
};

function edgeStrokeColor(score: number): string {
  if (score >= 75) return '#F43F5E';
  if (score >= 50) return '#F97316';
  if (score >= 25) return '#FBBF24';
  return '#10B981';
}

export function NetworkGraphSvg({
  nodes,
  edges,
  width,
  height,
  highlightedAccounts,
  onSelectAccount,
}: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width: number;
  height: number;
  highlightedAccounts: Set<string>;
  onSelectAccount: (accountId: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hasHighlight = highlightedAccounts.size > 0;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Card padding="none" className="relative overflow-hidden bg-[#090b10]">
      <svg
        data-testid="aml-network-svg"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[460px] lg:h-[560px]"
        role="img"
        aria-label="Force-directed AML transaction network of top 80 high-risk accounts"
      >
        <defs>
          <filter id="blip-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="14"
            refY="5"
            markerWidth="4.5"
            markerHeight="4.5"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
          </marker>
          <marker
            id="arrow-amber"
            viewBox="0 0 10 10"
            refX="14"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#FBBF24" />
          </marker>
        </defs>

        <g stroke="#1e2530" strokeWidth="0.8" fill="none" opacity="0.65">
          <circle cx={cx} cy={cy} r={Math.min(width, height) * 0.18} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={Math.min(width, height) * 0.34} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={Math.min(width, height) * 0.48} />
          <line x1={0} y1={cy} x2={width} y2={cy} strokeDasharray="2 4" />
          <line x1={cx} y1={0} x2={cx} y2={height} strokeDasharray="2 4" />
        </g>

        {edges.map((edge) => {
          const s = nodeMap.get(edge.source);
          const t = nodeMap.get(edge.target);
          if (!s || !t) return null;
          const isMatch =
            highlightedAccounts.has(edge.source) &&
            highlightedAccounts.has(edge.target);
          const dimmed = hasHighlight && !isMatch && !edge.isCircular;

          return (
            <line
              key={edge.id}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={edge.isCircular ? '#FBBF24' : edgeStrokeColor(edge.maxRiskScore)}
              strokeWidth={edge.isCircular || isMatch ? 1.8 : 0.75}
              strokeOpacity={dimmed ? 0.08 : edge.isCircular || isMatch ? 0.92 : 0.28}
              markerEnd={edge.isCircular ? 'url(#arrow-amber)' : 'url(#arrow-default)'}
              className={edge.isCircular ? 'animate-flow-pulse' : undefined}
            />
          );
        })}

        {nodes.map((node) => {
          const r = Math.max(4.5, Math.min(13, 4 + Math.log10(node.volume) * 1.6));
          const isHighlighted = highlightedAccounts.has(node.accountId);
          const isHovered = hoveredId === node.accountId;
          const dimmed = hasHighlight && !isHighlighted;
          const fill = NODE_FILL[node.riskLevel];
          const hot = node.riskLevel === 'critical' || node.riskLevel === 'high' || isHighlighted;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredId(node.accountId)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectAccount(node.accountId)}
              className="cursor-pointer"
              opacity={dimmed ? 0.22 : 1}
              filter={hot ? 'url(#blip-glow)' : undefined}
            >
              <circle
                r={r + 3.5}
                fill="none"
                stroke={isHighlighted ? '#FBBF24' : fill}
                strokeOpacity={isHighlighted ? 0.9 : 0.35}
                strokeWidth={isHighlighted ? 1.2 : 0.7}
                strokeDasharray={isHighlighted ? '2 2' : undefined}
              />
              <circle r={r} fill="#090b10" stroke={fill} strokeWidth="1.5" />
              <circle r={Math.max(2, r * 0.45)} fill={fill} />
              {(isHovered || isHighlighted || node.roleFlag !== 'none') && (
                <text
                  y={-(r + 7)}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.accountId}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="px-3 py-2 border-t border-[#1e2530] bg-[#11151c] flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> CRIT TARGET
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> HIGH TARGET
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> CYCLE VECTOR
          </span>
        </div>
        <span>CLICK BLIP TO QUERY ACCOUNT LEDGER</span>
      </div>
    </Card>
  );
}
