import { useState } from 'react';
import { useFinGuard } from '../../context/FinGuardContext';
import { useFilteredTransactions } from '../../hooks/useFilteredTransactions';
import { TransactionDetailPanel } from './TransactionDetailPanel';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';

export function TransactionsView() {
  const { dispatch } = useFinGuard();
  const { pageRows, totalCount, currentPage, totalPages } = useFilteredTransactions();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSelectTxn = (txnId: string) => {
    dispatch({ type: 'SELECT_TXN', txnId });
    setMobileDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <TransactionFilters />
      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-5 items-start">
        <div className="min-w-0">
          <TransactionTable
            rows={pageRows}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onSelectTxn={handleSelectTxn}
          />
        </div>
        <div className="min-w-0">
          <TransactionDetailPanel
            mobileOpen={mobileDrawerOpen}
            onCloseMobile={() => setMobileDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
