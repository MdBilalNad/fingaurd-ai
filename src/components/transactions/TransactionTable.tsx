import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import {
  formatAbsoluteTime,
  formatChannelLabel,
  formatCurrency,
  formatInteger,
  formatRelativeTime,
} from '../../lib/formatters';
import type { DetectionResult, RiskLevel, SortField } from '../../types';
import { Card } from '../ui/Card';
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
  low: 'hover:bg-[#090b10]/70',
  medium: 'bg-amber-400/[0.03] hover:bg-amber-400/[0.08]',
  high: 'bg-orange-500/[0.04] hover:bg-orange-500/[0.09]',
  critical: 'bg-rose-500/[0.05] hover:bg-rose-500/[0.11]',
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
    const nextDir = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
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
        title="No transactions match active query"
        description="Broaden the date window, clear risk filters, or query a different account ID."
        actionLabel="RESET FILTERS"
        onAction={() => dispatch({ type: 'RESET_FILTERS' })}
      />
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2530] bg-[#090b10]/70 text-[10px] font-mono uppercase tracking-wider text-slate-400 whitespace-nowrap">
              <th className="py-2 px-2.5">
                <button
                  type="button"
                  onClick={() => toggleSort('timestamp')}
                  className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  <span>Time</span>
                  {renderSortIcon('timestamp')}
                </button>
              </th>
              <th className="py-2 px-2.5">Sender → Receiver</th>
              <th className="py-2 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('amount')}
                  className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </button>
              </th>
              <th className="py-2 px-2.5">Rail</th>
              <th className="py-2 px-2.5">
                <button
                  type="button"
                  onClick={() => toggleSort('riskScore')}
                  className="inline-flex items-center gap-1 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  <span>Score</span>
                  {renderSortIcon('riskScore')}
                </button>
              </th>
              <th className="py-2 px-2.5">Tier</th>
              <th className="py-2 px-2.5">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2530] text-xs">
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
                    selected
                      ? 'bg-[#1a2230] border-l-2 border-l-emerald-500'
                      : ROW_TINT[res.riskScore.level]
                  }`}
                >
                  <td
                    className="py-1.5 px-2.5 font-mono text-[11px] tabular-nums text-slate-300 whitespace-nowrap"
                    title={formatAbsoluteTime(t.timestamp)}
                  >
                    {formatRelativeTime(t.timestamp, state.anchorNowMs)}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-[11px] text-slate-200 whitespace-nowrap">
                    <span>{t.senderId}</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span>{t.receiverId}</span>
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-[11px] tabular-nums text-right font-medium text-slate-100 whitespace-nowrap">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {formatChannelLabel(t.channel)}
                  </td>
                  <td className="py-1.5 px-2.5 whitespace-nowrap">
                    <RiskScoreBadge score={res.riskScore.score} level={res.riskScore.level} />
                  </td>
                  <td className="py-1.5 px-2.5 whitespace-nowrap">
                    <RiskLevelPill level={res.riskScore.level} />
                  </td>
                  <td className="py-1.5 px-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
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

      <div className="px-3 py-2 border-t border-[#1e2530] bg-[#090b10]/50 flex items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <span className="tabular-nums">
          {formatInteger(totalCount)} MATCHES // PG {currentPage}/{totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            aria-label="Previous page"
            onClick={() => dispatch({ type: 'SET_FILTERS', patch: { page: currentPage - 1 } })}
            className="p-1 rounded border border-[#1e2530] bg-[#11151c] text-slate-300 hover:border-slate-600 disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            onClick={() => dispatch({ type: 'SET_FILTERS', patch: { page: currentPage + 1 } })}
            className="p-1 rounded border border-[#1e2530] bg-[#11151c] text-slate-300 hover:border-slate-600 disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  );
}
