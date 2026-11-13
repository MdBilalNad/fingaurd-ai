import { useState } from 'react';
import type { NetworkEdge, NetworkNode, RiskLevel } from '../../types';

const NODE_FILL: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#E11D48',
};

function edgeStrokeColor(score: number): string {
  if (score >= 75) return '#E11D48';
  if (score >= 50) return '#F97316';
  if (score >= 25) return '#F59E0B';
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

  return (
    <div className="relative rounded-xl border border-slate-800 bg-[#080C13] overflow-hidden">
      <svg
        data-testid="aml-network-svg"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[460px] lg:h-[560px]"
        role="img"
        aria-label="Force-directed AML transaction network of top 80 high-risk accounts"
      >
        <defs>
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="14"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
          </marker>
          <marker
            id="arrow-amber"
            viewBox="0 0 10 10"
            refX="14"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
          </marker>
        </defs>

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
              stroke={edge.isCircular ? '#F59E0B' : edgeStrokeColor(edge.maxRiskScore)}
              strokeWidth={edge.isCircular || isMatch ? 2.4 : 1.0}
              strokeOpacity={dimmed ? 0.1 : edge.isCircular || isMatch ? 0.95 : 0.28}
              markerEnd={edge.isCircular ? 'url(#arrow-amber)' : 'url(#arrow-default)'}
              className={edge.isCircular ? 'animate-flow-pulse' : undefined}
            />
          );
        })}

        {nodes.map((node) => {
          const r = Math.max(5.5, Math.min(16, 4.5 + Math.log10(node.volume) * 1.9));
          const isHighlighted = highlightedAccounts.has(node.accountId);
          const isHovered = hoveredId === node.accountId;
          const dimmed = hasHighlight && !isHighlighted;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredId(node.accountId)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectAccount(node.accountId)}
              className="cursor-pointer"
              opacity={dimmed ? 0.25 : 1}
            >
              {isHighlighted && (
                <circle
                  r={r + 5}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
              <circle
                r={r}
                fill={NODE_FILL[node.riskLevel]}
                stroke="#0B0F17"
                strokeWidth="1.5"
              />
              {(isHovered || isHighlighted || node.roleFlag !== 'none') && (
                <text
                  y={-(r + 7)}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.accountId}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Circular Flow Edge
          </span>
        </div>
        <span>Click any node to inspect account transactions</span>
      </div>
    </div>
  );
}
