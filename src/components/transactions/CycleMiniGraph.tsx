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
    <div className="rounded-lg border border-amber-500/30 bg-amber-950/15 p-3">
      <p className="text-xs font-semibold text-amber-300 mb-2">
        Circular Layering Ring Detected
      </p>
      <svg
        viewBox="0 0 260 140"
        className="w-full h-32"
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
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
              stroke="#F59E0B"
              strokeWidth="2"
              markerEnd="url(#cycle-arrow)"
              className="animate-flow-pulse"
            />
          );
        })}
        {coords.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="11"
              fill="#0F172A"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            <text
              x={node.x}
              y={node.y + 22}
              textAnchor="middle"
              fill="#FDE68A"
              fontSize="10"
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
