import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatInteger } from '../../lib/formatters';

interface DailyPoint {
  date: string;
  legitimate: number;
  suspicious: number;
}

interface RiskSlice {
  name: string;
  key: 'low' | 'medium' | 'high' | 'critical';
  value: number;
  color: string;
}

export function OverviewCharts({
  dailySeries,
  riskDistribution,
  totalTransactions,
}: {
  dailySeries: DailyPoint[];
  riskDistribution: RiskSlice[];
  totalTransactions: number;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Daily Transaction Volume (90d)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Stacked counts of legitimate vs. suspicious activity (score ≥ 50)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Legitimate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
              Suspicious
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="legitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="suspGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
                minTickGap={24}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11 }}
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
              <Area
                type="monotone"
                dataKey="legitimate"
                name="Legitimate"
                stackId="1"
                stroke="#10B981"
                strokeWidth={1.8}
                fill="url(#legitGrad)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="suspicious"
                name="Suspicious"
                stackId="1"
                stroke="#E11D48"
                strokeWidth={1.8}
                fill="url(#suspGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col">
        <h2 className="text-sm font-semibold text-slate-100">Risk Distribution</h2>
        <p className="text-xs text-slate-400 mt-0.5">All scored transactions</p>

        <div className="relative h-52 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={78}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {riskDistribution.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
              {formatInteger(totalTransactions)}
            </span>
            <span className="text-[11px] text-slate-400">Total</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-800">
          {riskDistribution.map((item) => (
            <div key={item.key} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="font-mono tabular-nums text-slate-200">
                {formatInteger(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
