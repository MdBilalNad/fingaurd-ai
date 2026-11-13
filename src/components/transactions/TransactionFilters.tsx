import { RotateCcw, Search } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { CHANNELS } from '../../lib/geoProfiles';
import { formatChannelLabel } from '../../lib/formatters';
import type { Channel, DateRangeDays, RiskLevel } from '../../types';

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[210px] max-w-sm">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search by account or transaction ID"
            value={filters.searchAccount}
            onChange={(e) =>
              dispatch({ type: 'SET_FILTERS', patch: { searchAccount: e.target.value } })
            }
            placeholder="Search account ID (e.g. C0014) or TXN..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
          {RANGE_OPTIONS.map((days) => {
            const active = filters.dateRangeDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() =>
                  dispatch({ type: 'SET_FILTERS', patch: { dateRangeDays: days } })
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  active
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days}d
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-medium text-slate-400 mr-1">Risk:</span>
        {RISK_OPTIONS.map((opt) => {
          const active = filters.riskLevels.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggleRisk(opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <span className="text-[11px] font-medium text-slate-400 ml-2 mr-1">Channel:</span>
        {CHANNELS.map((ch) => {
          const active = filters.channels.includes(ch);
          return (
            <button
              key={ch}
              type="button"
              aria-pressed={active}
              onClick={() => toggleChannel(ch)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-slate-700 text-slate-100 border-slate-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {formatChannelLabel(ch)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
