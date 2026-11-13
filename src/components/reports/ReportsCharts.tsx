import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

export function ReportsCharts({
  patternBreakdown,
  channelRiskSeries,
}: {
  patternBreakdown: PatternRow[];
  channelRiskSeries: ChannelRiskRow[];
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold text-slate-100">Pattern Breakdown</h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          Detections grouped by AML rule & topology signal
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={patternBreakdown}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 24, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                tick={{ fill: '#CBD5E1', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar
                dataKey="count"
                name="Flagged Txns"
                fill="#F59E0B"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-semibold text-slate-100">Risk by Channel</h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          Transaction risk tier volume across payment rails
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelRiskSeries} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="channel" tick={{ fill: '#CBD5E1', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="low" name="Low" stackId="a" fill="#10B981" isAnimationActive={false} />
              <Bar dataKey="medium" name="Medium" stackId="a" fill="#F59E0B" isAnimationActive={false} />
              <Bar dataKey="high" name="High" stackId="a" fill="#F97316" isAnimationActive={false} />
              <Bar dataKey="critical" name="Critical" stackId="a" fill="#E11D48" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
