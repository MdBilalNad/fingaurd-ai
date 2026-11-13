import { useMemo } from 'react';
import { useFinGuard } from '../context/FinGuardContext';
import { DAY_MS } from '../lib/prng';
import type { DetectionResult } from '../types';

export const PAGE_SIZE = 25;

export function useFilteredTransactions() {
  const { state } = useFinGuard();
  const { transactions, resultsByTxnId, filters, anchorNowMs } = state;

  return useMemo(() => {
    const query = filters.searchAccount.trim().toLowerCase();
    const minTsMs = anchorNowMs - filters.dateRangeDays * DAY_MS;

    const filtered: DetectionResult[] = [];
    for (const txn of transactions) {
      if (Date.parse(txn.timestamp) < minTsMs) continue;
      if (
        query &&
        !txn.senderId.toLowerCase().includes(query) &&
        !txn.receiverId.toLowerCase().includes(query) &&
        !txn.txnId.toLowerCase().includes(query)
      ) {
        continue;
      }
      const res = resultsByTxnId[txn.txnId];
      if (!res) continue;
      if (
        filters.riskLevels.length > 0 &&
        !filters.riskLevels.includes(res.riskScore.level)
      ) {
        continue;
      }
      if (
        filters.channels.length > 0 &&
        !filters.channels.includes(txn.channel)
      ) {
        continue;
      }
      filtered.push(res);
    }

    const dir = filters.sortDirection === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (filters.sortField === 'amount') {
        return (a.transaction.amount - b.transaction.amount) * dir;
      }
      if (filters.sortField === 'riskScore') {
        return (a.riskScore.score - b.riskScore.score) * dir;
      }
      return (
        (Date.parse(a.transaction.timestamp) -
          Date.parse(b.transaction.timestamp)) *
        dir
      );
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.min(filters.page, totalPages);
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    return {
      totalCount,
      totalPages,
      currentPage,
      pageRows,
    };
  }, [transactions, resultsByTxnId, filters, anchorNowMs]);
}
