export function CycleMiniGraph({ cyclePath }: { cyclePath: string[] }) {
  const uniqueNodes = cyclePath.slice(0, -1);
  if (uniqueNodes.length < 3) return null;

  const cx = 130;
  const cy = 70;
  const r = 46;

  const coords = uniqueNodes.map((id, i) => {
    const angle = -Math.PI / 2 + (i / uniqueNodes.length) * Math.PI * 2;
    return {
      id,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  });

  return (
    <div className="rounded border border-amber-400/35 bg-[#090b10] p-2.5">
      <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-amber-400 mb-1.5">
        CIRCULAR LAYERING RING DETECTED
      </p>
      <svg
        viewBox="0 0 260 140"
        className="w-full h-28"
        role="img"
        aria-label={`Circular flow graph: ${cyclePath.join(' to ')}`}
      >
        <defs>
          <marker
            id="cycle-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#FBBF24" />
          </marker>
        </defs>
        {coords.map((from, i) => {
          const to = coords[(i + 1) % coords.length];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          const x2 = to.x - (dx / len) * 14;
          const y2 = to.y - (dy / len) * 14;
          return (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y}
              x2={x2}
              y2={y2}
              stroke="#FBBF24"
              strokeWidth="1.5"
              markerEnd="url(#cycle-arrow)"
              className="animate-flow-pulse"
            />
          );
        })}
        {coords.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="12" fill="none" stroke="#FBBF24" strokeOpacity="0.35" strokeWidth="0.8" />
            <circle cx={node.x} cy={node.y} r="6.5" fill="#090b10" stroke="#FBBF24" strokeWidth="1.5" />
            <text
              x={node.x}
              y={node.y + 21}
              textAnchor="middle"
              fill="#FDE68A"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
