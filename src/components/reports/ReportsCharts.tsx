import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../ui/Card';

interface PatternRow {
  name: string;
  count: number;
}

interface ChannelRiskRow {
  channel: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

const TOOLTIP_STYLE = {
  backgroundColor: '#090b10',
  borderColor: '#1e2530',
  borderWidth: '1px',
  borderRadius: '4px',
  fontSize: '11px',
  fontFamily: 'JetBrains Mono, monospace',
  color: '#f1f5f9',
};

export function ReportsCharts({
  patternBreakdown,
  channelRiskSeries,
}: {
  patternBreakdown: PatternRow[];
  channelRiskSeries: ChannelRiskRow[];
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card padding="sm">
        <div className="pb-2 mb-3 border-b border-[#1e2530]">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
            Pattern Signal Breakdown
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Detections grouped by AML rule &amp; topology signal
          </p>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={patternBreakdown}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#1e2530' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: '#cbd5e1', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="count"
                name="Flagged Txns"
                fill="#FBBF24"
                radius={[0, 2, 2, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card padding="sm">
        <div className="pb-2 mb-3 border-b border-[#1e2530]">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
            Risk Exposure by Rail
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Transaction risk tier volume across payment channels
          </p>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelRiskSeries} margin={{ top: 4, right: 8, left: -14, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" vertical={false} />
              <XAxis
                dataKey="channel"
                tick={{ fill: '#cbd5e1', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#1e2530' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="low" name="Low" stackId="a" fill="#10B981" isAnimationActive={false} />
              <Bar dataKey="medium" name="Medium" stackId="a" fill="#FBBF24" isAnimationActive={false} />
              <Bar dataKey="high" name="High" stackId="a" fill="#F97316" isAnimationActive={false} />
              <Bar dataKey="critical" name="Critical" stackId="a" fill="#F43F5E" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
