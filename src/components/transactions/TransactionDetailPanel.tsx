import { X } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import {
  formatAbsoluteTime,
  formatChannelLabel,
  formatCurrency,
  formatRelativeTime,
} from '../../lib/formatters';
import type { Account, AccountGraphMetrics } from '../../types';
import { Card } from '../ui/Card';
import { RiskLevelPill } from '../ui/RiskBadge';
import { CycleMiniGraph } from './CycleMiniGraph';
import { RiskGaugeSvg } from './RiskGaugeSvg';
import { ShapBarList } from './ShapBarList';

function AccountMiniCard({
  role,
  account,
  metrics,
}: {
  role: 'SENDER' | 'RECEIVER';
  account?: Account;
  metrics?: AccountGraphMetrics;
}) {
  if (!account) return null;
  return (
    <div className="rounded border border-[#1e2530] bg-[#090b10] p-2.5 space-y-1 text-[11px] font-mono">
      <div className="flex items-center justify-between">
        <span className="text-slate-500">{role}</span>
        <span className="font-semibold text-slate-100">{account.accountId}</span>
      </div>
      <div className="flex items-center justify-between text-slate-400">
        <span className="uppercase">{account.accountType}</span>
        <span>
          {account.homeCity}, {account.homeCountry}
        </span>
      </div>
      <div className="flex items-center justify-between text-slate-400 tabular-nums pt-0.5 border-t border-[#1e2530]/60">
        <span>AGE: {account.accountAgeDays}D</span>
        <span>
          FAN: {metrics?.fanOutRatio.toFixed(1) ?? '0.0'}× · PASS:{' '}
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
      <Card padding="md" className="text-xs font-mono text-slate-400">
        SELECT A TRANSACTION ROW TO INSPECT XAI TELEMETRY &amp; GRAPH ATTRIBUTION.
      </Card>
    );
  }

  const txn = result.transaction;
  const sender = state.accounts.find((a) => a.accountId === txn.senderId);
  const receiver = state.accounts.find((a) => a.accountId === txn.receiverId);

  const panelBody = (
    <Card padding="sm" className="space-y-3.5">
      <div className="flex items-start justify-between gap-2.5 border-b border-[#1e2530] pb-3">
        <div>
          <p className="font-mono text-[11px] text-slate-400">{txn.txnId}</p>
          <p className="mt-0.5 text-xl font-bold font-mono tabular-nums text-slate-50">
            {formatCurrency(txn.amount)}
          </p>
          <p
            className="mt-0.5 text-[11px] font-mono text-slate-400"
            title={formatAbsoluteTime(txn.timestamp)}
          >
            {formatChannelLabel(txn.channel).toUpperCase()} ·{' '}
            {formatRelativeTime(txn.timestamp, state.anchorNowMs)} · {txn.ipCity}, {txn.ipCountry}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close transaction detail drawer"
          onClick={onCloseMobile}
          className="xl:hidden p-1 rounded border border-[#1e2530] text-slate-400 hover:bg-[#090b10] hover:text-slate-100"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090b10] rounded border border-[#1e2530] p-3">
        <RiskGaugeSvg score={result.riskScore.score} level={result.riskScore.level} />
        <div className="space-y-1.5 text-right ml-auto font-mono">
          <RiskLevelPill level={result.riskScore.level} />
          <p className="text-[11px] text-slate-400 tabular-nums">
            CONF:{' '}
            <span className="font-semibold text-slate-100">
              {result.riskScore.confidence}%
            </span>
          </p>
          <p className="text-[10px] text-slate-400 tabular-nums">
            ML: {Math.round(result.riskScore.behavioralAnomalyScore * 100)} · RULE:{' '}
            {Math.round(result.riskScore.normalizedRuleSeverity * 100)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-300 mb-2">
          SHAP Attribution Readout
        </h3>
        <ShapBarList reasons={result.reasons} />
      </div>

      {result.cyclePath && <CycleMiniGraph cyclePath={result.cyclePath} />}

      <div className="space-y-2">
        <h3 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-300">
          Counterparty Entities
        </h3>
        <AccountMiniCard
          role="SENDER"
          account={sender}
          metrics={state.accountMetrics[txn.senderId]}
        />
        <AccountMiniCard
          role="RECEIVER"
          account={receiver}
          metrics={state.accountMetrics[txn.receiverId]}
        />
      </div>
    </Card>
  );

  return (
    <>
      <div className="hidden xl:block sticky top-16">{panelBody}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden bg-[#090b10]/95 overflow-y-auto p-3">
          {panelBody}
        </div>
      )}
    </>
  );
}
