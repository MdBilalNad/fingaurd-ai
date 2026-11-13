import type { RiskLevel } from '../../types';

const ARC_COLOR: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#FBBF24',
  high: '#F97316',
  critical: '#F43F5E',
};

const TICKS = Array.from({ length: 21 }, (_, idx) => idx * 5);

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
  const cx = 88;
  const cy = 84;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const strokeColor = ARC_COLOR[level];

  return (
    <svg
      width="176"
      height="108"
      viewBox="0 0 176 108"
      role="img"
      aria-label={`Risk score ${score} out of 100`}
      className="shrink-0"
    >
      <defs>
        <filter id="gauge-needle-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={strokeColor} floodOpacity="0.85" />
        </filter>
      </defs>

      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="#1e2530"
        strokeWidth="8"
      />
      <path
        d={`M ${cx - (radius - 13)} ${cy} A ${radius - 13} ${radius - 13} 0 0 1 ${cx + (radius - 13)} ${cy}`}
        fill="none"
        stroke="#1e2530"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />

      {TICKS.map((val) => {
        const rad = ((-180 + (val / 100) * 180) * Math.PI) / 180;
        const isMajor = val % 25 === 0;
        const rInner = radius - (isMajor ? 10 : 7);
        const rOuter = radius + 4;
        return (
          <line
            key={val}
            x1={cx + Math.cos(rad) * rInner}
            y1={cy + Math.sin(rad) * rInner}
            x2={cx + Math.cos(rad) * rOuter}
            y2={cy + Math.sin(rad) * rOuter}
            stroke={isMajor ? '#64748b' : '#334155'}
            strokeWidth={isMajor ? 1.3 : 0.8}
          />
        );
      })}

      <text x={cx - radius - 9} y={cy + 3} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace">
        0
      </text>
      <text x={cx} y={cy - radius - 8} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace">
        50
      </text>
      <text x={cx + radius + 9} y={cy + 3} textAnchor="start" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace">
        100
      </text>

      <g transform={`translate(${cx}, ${cy}) rotate(${angleDeg})`} filter="url(#gauge-needle-glow)">
        <polygon
          points={`-2.2,0 0,-${radius - 6} 2.2,0`}
          fill="#f8fafc"
        />
        <circle cx="0" cy="0" r="4.5" fill="#090b10" stroke={strokeColor} strokeWidth="2" />
      </g>

      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fill="#f8fafc"
        fontSize="14"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        {score}/100
      </text>
    </svg>
  );
}
