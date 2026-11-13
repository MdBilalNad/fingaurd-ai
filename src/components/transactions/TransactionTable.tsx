import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import {
  formatAbsoluteTime,
  formatChannelLabel,
  formatCurrency,
  formatInteger,
  formatRelativeTime,
} from '../../lib/formatters';
import type { DetectionResult, RiskLevel, SortField } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { RiskLevelPill, RiskScoreBadge } from '../ui/RiskBadge';
import { FlagIcon } from './FlagIcon';

interface TransactionTableProps {
  rows: DetectionResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onSelectTxn: (txnId: string) => void;
}

const ROW_TINT: Record<RiskLevel, string> = {
  low: 'hover:bg-slate-800/40',
  medium: 'bg-amber-950/10 hover:bg-amber-950/25',
  high: 'bg-orange-950/15 hover:bg-orange-950/30',
  critical: 'bg-rose-950/20 hover:bg-rose-950/35',
};

export function TransactionTable({
  rows,
  totalCount,
  currentPage,
  totalPages,
  onSelectTxn,
}: TransactionTableProps) {
  const { state, dispatch } = useFinGuard();
  const { sortField, sortDirection } = state.filters;

  const toggleSort = (field: SortField) => {
    const nextDir =
      sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    dispatch({
      type: 'SET_FILTERS',
      patch: { sortField: field, sortDirection: nextDir, page: 1 },
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-emerald-400" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-400" aria-hidden="true" />
    );
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No transactions match your filters."
        description="Try broadening the date range, clearing selected risk tiers, or searching a different account ID."
        actionLabel="Reset filters"
        onAction={() => dispatch({ type: 'RESET_FILTERS' })}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-medium text-slate-400 whitespace-nowrap">
              <th className="py-3 px-2.5">
                <button
                  type="button"
                  onClick={() => toggleSort('timestamp')}
                  className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  <span>Time</span>
                  {renderSortIcon('timestamp')}
                </button>
              </th>
              <th className="py-3 px-2.5">Sender → Receiver</th>
              <th className="py-3 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('amount')}
                  className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </button>
              </th>
              <th className="py-3 px-2.5">Channel</th>
              <th className="py-3 px-2.5">
                <button
                  type="button"
                  onClick={() => toggleSort('riskScore')}
                  className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                >
                  <span>Score</span>
                  {renderSortIcon('riskScore')}
                </button>
              </th>
              <th className="py-3 px-2.5">Risk Level</th>
              <th className="py-3 px-2.5">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {rows.map((res) => {
              const t = res.transaction;
              const selected = state.selectedTxnId === t.txnId;
              return (
                <tr
                  key={t.txnId}
                  onClick={() => onSelectTxn(t.txnId)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTxn(t.txnId);
                    }
                  }}
                  aria-selected={selected}
                  className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
                    selected ? 'bg-slate-800/90' : ROW_TINT[res.riskScore.level]
                  }`}
                >
                  <td
                    className="py-2.5 px-2.5 font-mono tabular-nums text-slate-300 whitespace-nowrap"
                    title={formatAbsoluteTime(t.timestamp)}
                  >
                    {formatRelativeTime(t.timestamp, state.anchorNowMs)}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-slate-200 whitespace-nowrap">
                    <span>{t.senderId}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span>{t.receiverId}</span>
                  </td>
                  <td className="py-2.5 px-2.5 font-mono tabular-nums text-right font-medium text-slate-100 whitespace-nowrap">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-300 whitespace-nowrap">
                    {formatChannelLabel(t.channel)}
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    <RiskScoreBadge score={res.riskScore.score} level={res.riskScore.level} />
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    <RiskLevelPill level={res.riskScore.level} />
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {res.flags.slice(0, 3).map((flag) => (
                        <FlagIcon key={flag} flag={flag} />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-400">
        <span className="tabular-nums">
          {formatInteger(totalCount)} matching transactions · Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            aria-label="Previous page"
            onClick={() => dispatch({ type: 'SET_FILTERS', patch: { page: currentPage - 1 } })}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            onClick={() => dispatch({ type: 'SET_FILTERS', patch: { page: currentPage + 1 } })}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
