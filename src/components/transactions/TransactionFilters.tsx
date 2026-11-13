import { RotateCcw, Search } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { CHANNELS } from '../../lib/geoProfiles';
import { formatChannelLabel } from '../../lib/formatters';
import type { Channel, DateRangeDays, RiskLevel } from '../../types';
import { Card } from '../ui/Card';

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'low', label: 'LOW' },
  { value: 'medium', label: 'MED' },
  { value: 'high', label: 'HIGH' },
  { value: 'critical', label: 'CRIT' },
];

const RANGE_OPTIONS: DateRangeDays[] = [7, 30, 90];

export function TransactionFilters() {
  const { state, dispatch } = useFinGuard();
  const { filters } = state;

  const toggleRisk = (lvl: RiskLevel) => {
    const next = filters.riskLevels.includes(lvl)
      ? filters.riskLevels.filter((x) => x !== lvl)
      : [...filters.riskLevels, lvl];
    dispatch({ type: 'SET_FILTERS', patch: { riskLevels: next } });
  };

  const toggleChannel = (ch: Channel) => {
    const next = filters.channels.includes(ch)
      ? filters.channels.filter((x) => x !== ch)
      : [...filters.channels, ch];
    dispatch({ type: 'SET_FILTERS', patch: { channels: next } });
  };

  const hasActiveFilters =
    filters.searchAccount !== '' ||
    filters.riskLevels.length > 0 ||
    filters.channels.length > 0 ||
    filters.dateRangeDays !== 90;

  return (
    <Card padding="sm" className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[210px] max-w-sm">
          <Search
            className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search by account or transaction ID"
            value={filters.searchAccount}
            onChange={(e) =>
              dispatch({ type: 'SET_FILTERS', patch: { searchAccount: e.target.value } })
            }
            placeholder="QUERY: Account ID (e.g. C0014) or TXN..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono rounded bg-[#090b10] border border-[#1e2530] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-0.5 rounded bg-[#090b10] border border-[#1e2530]">
            {RANGE_OPTIONS.map((days) => {
              const active = filters.dateRangeDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() =>
                    dispatch({ type: 'SET_FILTERS', patch: { dateRangeDays: days } })
                  }
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    active
                      ? 'bg-[#11151c] text-emerald-400 border border-[#1e2530]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {days}D
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'RESET_FILTERS' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded border border-[#1e2530] bg-[#090b10] text-slate-300 hover:border-slate-600 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              RESET
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1">
          RISK:
        </span>
        {RISK_OPTIONS.map((opt) => {
          const active = filters.riskLevels.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggleRisk(opt.value)}
              className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50'
                  : 'bg-[#090b10] text-slate-400 border-[#1e2530] hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 ml-2 mr-1">
          RAIL:
        </span>
        {CHANNELS.map((ch) => {
          const active = filters.channels.includes(ch);
          return (
            <button
              key={ch}
              type="button"
              aria-pressed={active}
              onClick={() => toggleChannel(ch)}
              className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-[#1e2530] text-slate-100 border-slate-600'
                  : 'bg-[#090b10] text-slate-400 border-[#1e2530] hover:text-slate-200'
              }`}
            >
              {formatChannelLabel(ch)}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
