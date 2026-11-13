import { Download, FileJson, Printer } from 'lucide-react';
import { useFinGuard } from '../../context/FinGuardContext';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { formatCompactCurrency, formatInteger } from '../../lib/formatters';
import {
  buildReportCsv,
  buildReportJson,
  downloadBlobFile,
  type ReportExportPayload,
} from '../../lib/reportExport';
import { Card } from '../ui/Card';
import { ReportsCharts } from './ReportsCharts';

export function ReportsView() {
  const { state, dispatch } = useFinGuard();
  const m = useDashboardMetrics();
  const flaggedPct = ((m.mediumPlusCount / Math.max(1, m.totalTransactions)) * 100).toFixed(1);
  const top1 = m.patternBreakdown[0];
  const top2 = m.patternBreakdown[1];

  const buildPayload = (): ReportExportPayload => {
    const generatedAt = new Date(state.anchorNowMs).toISOString();
    const signalPart =
      top1 && top2
        ? ` The most frequent detection signal was ${top1.name.toLowerCase()} (${formatInteger(top1.count)} instances), followed by ${top2.name.toLowerCase()} (${formatInteger(top2.count)} instances).`
        : '';
    const cyclePart =
      m.circularRingsCount > 0
        ? ` ${m.circularRingsCount} potential circular-flow layering rings were detected involving ${m.circularAccountCount} accounts.`
        : '';

    return {
      generatedAt,
      totalTransactions: m.totalTransactions,
      totalAccounts: m.totalAccounts,
      totalAmount: m.totalAmount,
      fraudPreventedAmount: m.fraudPreventedAmount,
      mediumPlusCount: m.mediumPlusCount,
      highAlertsCount: m.highAlertsCount,
      criticalAlertsCount: m.criticalAlertsCount,
      circularRingsCount: m.circularRingsCount,
      circularAccountCount: m.circularAccountCount,
      patternBreakdown: m.patternBreakdown.map((p) => ({ name: p.name, count: p.count })),
      channelRiskSeries: m.channelRiskSeries,
      narrative: `In the last 90 days, FinGuard AI analysed ${formatInteger(m.totalTransactions)} transactions totaling ${formatCompactCurrency(m.totalAmount)} across ${formatInteger(m.totalAccounts)} accounts. ${formatInteger(m.mediumPlusCount)} transactions (${flaggedPct}%) were flagged at medium or higher risk, including ${formatInteger(m.criticalAlertsCount)} critical-tier incidents representing ${formatCompactCurrency(m.fraudPreventedAmount)} in estimated prevented loss.${signalPart}${cyclePart}`,
    };
  };

  const handleExport = (format: 'csv' | 'json') => {
    const payload = buildPayload();
    const dateStamp = payload.generatedAt.slice(0, 10);
    if (format === 'csv') {
      downloadBlobFile(buildReportCsv(payload), `finguard-summary-${dateStamp}.csv`, 'text/csv;charset=utf-8');
    } else {
      downloadBlobFile(buildReportJson(payload), `finguard-summary-${dateStamp}.json`, 'application/json;charset=utf-8');
    }
    dispatch({
      type: 'ADD_TOAST',
      toast: {
        id: `export-${format}-${Date.now()}`,
        title: `Report exported (${format.toUpperCase()})`,
        description: `Saved finguard-summary-${dateStamp}.${format} for record-keeping.`,
        severity: 'low',
      },
    });
  };

  return (
    <div className="space-y-3">
      <Card accent="emerald" padding="md" className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#1e2530]">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
            Executive Intelligence Briefing
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 print:hidden">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-[#090b10] text-slate-200 border border-[#1e2530] hover:border-emerald-500/50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              EXPORT CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-[#090b10] text-slate-200 border border-[#1e2530] hover:border-amber-400/50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              EXPORT JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              PRINT
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
          In the last 90 days, FinGuard AI analysed{' '}
          <span className="font-mono font-semibold text-slate-100">{formatInteger(m.totalTransactions)}</span>{' '}
          transactions totaling{' '}
          <span className="font-mono font-semibold text-slate-100">{formatCompactCurrency(m.totalAmount)}</span>{' '}
          across{' '}
          <span className="font-mono font-semibold text-slate-100">{formatInteger(m.totalAccounts)}</span>{' '}
          accounts.{' '}
          <span className="font-mono font-semibold text-amber-400">{formatInteger(m.mediumPlusCount)}</span>{' '}
          transactions ({flaggedPct}%) were flagged at medium or higher risk, including{' '}
          <span className="font-mono font-semibold text-rose-400">{formatInteger(m.criticalAlertsCount)}</span>{' '}
          critical-tier incidents representing{' '}
          <span className="font-mono font-semibold text-rose-400">{formatCompactCurrency(m.fraudPreventedAmount)}</span>{' '}
          in estimated prevented loss.
          {top1 && top2 && (
            <>
              {' '}
              The most frequent detection signal was{' '}
              <span className="font-semibold text-slate-100">{top1.name.toLowerCase()}</span> (
              <span className="font-mono">{formatInteger(top1.count)}</span> instances), followed by{' '}
              <span className="font-semibold text-slate-100">{top2.name.toLowerCase()}</span> (
              <span className="font-mono">{formatInteger(top2.count)}</span> instances).
            </>
          )}{' '}
          {m.circularRingsCount > 0 && (
            <>
              <span className="font-mono font-semibold text-amber-400">{m.circularRingsCount}</span>{' '}
              potential circular-flow layering rings were detected involving{' '}
              <span className="font-mono font-semibold text-amber-400">{m.circularAccountCount}</span>{' '}
              accounts.
            </>
          )}
        </p>
      </Card>

      <ReportsCharts
        patternBreakdown={m.patternBreakdown}
        channelRiskSeries={m.channelRiskSeries}
      />

      <Card padding="md" className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
          Detection Pipeline Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 leading-relaxed">
          <div className="rounded border border-[#1e2530] border-t-2 border-t-emerald-500 bg-[#090b10] p-3 space-y-1">
            <h3 className="font-mono text-[11px] font-semibold text-emerald-400">01 // BEHAVIORAL ML (40%)</h3>
            <p className="text-slate-400">
              Computes per-transaction amount z-scores against each account’s historical baseline,
              active-hour deviation, device novelty, cross-border IP mismatch, and 24h velocity.
            </p>
          </div>
          <div className="rounded border border-[#1e2530] border-t-2 border-t-amber-400 bg-[#090b10] p-3 space-y-1">
            <h3 className="font-mono text-[11px] font-semibold text-amber-400">02 // AML RULES (35%)</h3>
            <p className="text-slate-400">
              Sliding-window scanners detect structuring below $10,000 over 48h, 2h velocity bursts,
              round-thousand transfers, dormant reactivation spikes, and 72h circular flow rings.
            </p>
          </div>
          <div className="rounded border border-[#1e2530] border-t-2 border-t-rose-500 bg-[#090b10] p-3 space-y-1">
            <h3 className="font-mono text-[11px] font-semibold text-rose-400">03 // GRAPH &amp; XAI (25%)</h3>
            <p className="text-slate-400">
              Directed counterparty graph measures fan-out ratio, 24h pass-through velocity, and holding
              duration to isolate mule/shell nodes with SHAP attribution readouts.
            </p>
          </div>
        </div>
        <p className="text-[11px] font-mono text-slate-500 border-t border-[#1e2530] pt-2.5 leading-relaxed">
          NOTE: Client-side prototype operating on seeded synthetic data and deterministic heuristics.
        </p>
      </Card>
    </div>
  );
}
