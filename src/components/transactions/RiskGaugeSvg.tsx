import type { RiskLevel } from '../../types';

const ARC_COLOR: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#E11D48',
};

export function RiskGaugeSvg({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const angleDeg = -90 + (clamped / 100) * 180;
  const radius = 64;
  const cx = 84;
  const cy = 80;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const strokeColor = ARC_COLOR[level];

  return (
    <svg
      width="168"
      height="100"
      viewBox="0 0 168 100"
      role="img"
      aria-label={`Risk score ${score} out of 100`}
      className="shrink-0"
    >
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="#1E293B"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
      <g transform={`translate(${cx}, ${cy}) rotate(${angleDeg})`}>
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={-(radius - 10)}
          stroke="#F8FAFC"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="4.5" fill="#F8FAFC" />
      </g>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="16"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        {score}/100
      </text>
    </svg>
  );
}
