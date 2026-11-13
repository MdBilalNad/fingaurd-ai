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
import { Card } from '../ui/Card';

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

const TOOLTIP_STYLE = {
  backgroundColor: '#090b10',
  borderColor: '#1e2530',
  borderWidth: '1px',
  borderRadius: '4px',
  fontSize: '11px',
  fontFamily: 'JetBrains Mono, monospace',
  color: '#f1f5f9',
};

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
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card padding="sm" className="lg:col-span-2">
        <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-[#1e2530]">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Daily Transaction Telemetry (90d)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Legitimate vs. suspicious activity (score ≥ 50)
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-emerald-500" />
              LEGIT
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-rose-500" />
              SUSP
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries} margin={{ top: 6, right: 18, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="legitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="suspGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                tickFormatter={(v: string) => v.slice(5)}
                minTickGap={26}
                axisLine={{ stroke: '#1e2530' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="legitimate"
                name="Legitimate"
                stackId="1"
                stroke="#10B981"
                strokeWidth={1.5}
                fill="url(#legitGrad)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="suspicious"
                name="Suspicious"
                stackId="1"
                stroke="#F43F5E"
                strokeWidth={1.5}
                fill="url(#suspGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card padding="sm" className="flex flex-col">
        <div className="pb-2 border-b border-[#1e2530]">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
            Risk Tier Distribution
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Scored dataset breakdown</p>
        </div>

        <div className="relative h-44 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={2}
                stroke="#090b10"
                strokeWidth={1}
                isAnimationActive={false}
              >
                {riskDistribution.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold font-mono tabular-nums text-slate-100">
              {formatInteger(totalTransactions)}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              TOTAL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-[#1e2530]">
          {riskDistribution.map((item) => (
            <div key={item.key} className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-2 h-2 rounded-xs shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="tabular-nums text-slate-200">{formatInteger(item.value)}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
