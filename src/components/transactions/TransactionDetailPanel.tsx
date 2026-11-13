import { X } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import {
  formatAbsoluteTime,
  formatChannelLabel,
  formatCurrency,
  formatRelativeTime,
} from '../../lib/formatters';
import type { Account, AccountGraphMetrics } from '../../types';
import { RiskLevelPill } from '../ui/RiskBadge';
import { CycleMiniGraph } from './CycleMiniGraph';
import { RiskGaugeSvg } from './RiskGaugeSvg';
import { ShapBarList } from './ShapBarList';

function AccountMiniCard({
  role,
  account,
  metrics,
}: {
  role: 'Sender' | 'Receiver';
  account?: Account;
  metrics?: AccountGraphMetrics;
}) {
  if (!account) return null;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">{role}</span>
        <span className="font-mono font-semibold text-slate-100">
          {account.accountId}
        </span>
      </div>
      <div className="flex items-center justify-between text-slate-400">
        <span className="capitalize">{account.accountType}</span>
        <span>
          {account.homeCity}, {account.homeCountry}
        </span>
      </div>
      <div className="flex items-center justify-between text-slate-400 tabular-nums">
        <span>Age: {account.accountAgeDays}d</span>
        <span>
          Fan-out: {metrics?.fanOutRatio.toFixed(1) ?? '0.0'}× · Pass-thru:{' '}
          {Math.round((metrics?.passThroughRatio ?? 0) * 100)}%
        </span>
      </div>
    </div>
  );
}

export function TransactionDetailPanel({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { state } = useFinGuard();
  const txnId = state.selectedTxnId;
  const result = txnId ? state.resultsByTxnId[txnId] : undefined;

  if (!result) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-xs text-slate-400">
        Select a transaction row to inspect Explainable AI feature attributions and entity graph metrics.
      </div>
    );
  }

  const txn = result.transaction;
  const sender = state.accounts.find((a) => a.accountId === txn.senderId);
  const receiver = state.accounts.find((a) => a.accountId === txn.receiverId);

  const panelBody = (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="font-mono text-xs text-slate-400">{txn.txnId}</p>
          <p className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-50">
            {formatCurrency(txn.amount)}
          </p>
          <p
            className="mt-1 text-xs text-slate-400"
            title={formatAbsoluteTime(txn.timestamp)}
          >
            {formatChannelLabel(txn.channel)} ·{' '}
            {formatRelativeTime(txn.timestamp, state.anchorNowMs)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close transaction detail drawer"
          onClick={onCloseMobile}
          className="xl:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 rounded-xl border border-slate-800 p-4">
        <RiskGaugeSvg score={result.riskScore.score} level={result.riskScore.level} />
        <div className="space-y-2 text-right ml-auto">
          <RiskLevelPill level={result.riskScore.level} />
          <p className="text-xs text-slate-400 tabular-nums">
            Confidence:{' '}
            <span className="font-mono font-semibold text-slate-200">
              {result.riskScore.confidence}%
            </span>
          </p>
          <p className="text-[11px] text-slate-400 tabular-nums">
            ML: {Math.round(result.riskScore.behavioralAnomalyScore * 100)} · Rules:{' '}
            {Math.round(result.riskScore.normalizedRuleSeverity * 100)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-200 mb-3">
          Why was this flagged? (SHAP Attribution)
        </h3>
        <ShapBarList reasons={result.reasons} />
      </div>

      {result.cyclePath && <CycleMiniGraph cyclePath={result.cyclePath} />}

      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-200">Counterparty Profiles</h3>
        <AccountMiniCard
          role="Sender"
          account={sender}
          metrics={state.accountMetrics[txn.senderId]}
        />
        <AccountMiniCard
          role="Receiver"
          account={receiver}
          metrics={state.accountMetrics[txn.receiverId]}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden xl:block sticky top-20">{panelBody}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden bg-[#0B0F17]/95 overflow-y-auto p-4">
          {panelBody}
        </div>
      )}
    </>
  );
}
