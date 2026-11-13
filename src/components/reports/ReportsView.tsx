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
      const csv = buildReportCsv(payload);
      downloadBlobFile(csv, `finguard-summary-${dateStamp}.csv`, 'text/csv;charset=utf-8');
    } else {
      const json = buildReportJson(payload);
      downloadBlobFile(json, `finguard-summary-${dateStamp}.json`, 'application/json;charset=utf-8');
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
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-100">Executive Summary</h2>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              Print Report
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          In the last 90 days, FinGuard AI analysed{' '}
          <span className="font-mono font-semibold text-slate-100">
            {formatInteger(m.totalTransactions)}
          </span>{' '}
          transactions totaling{' '}
          <span className="font-mono font-semibold text-slate-100">
            {formatCompactCurrency(m.totalAmount)}
          </span>{' '}
          across{' '}
          <span className="font-mono font-semibold text-slate-100">
            {formatInteger(m.totalAccounts)}
          </span>{' '}
          accounts.{' '}
          <span className="font-mono font-semibold text-amber-300">
            {formatInteger(m.mediumPlusCount)}
          </span>{' '}
          transactions ({flaggedPct}%) were flagged at medium or higher risk, including{' '}
          <span className="font-mono font-semibold text-rose-400">
            {formatInteger(m.criticalAlertsCount)}
          </span>{' '}
          critical-tier incidents representing{' '}
          <span className="font-mono font-semibold text-rose-300">
            {formatCompactCurrency(m.fraudPreventedAmount)}
          </span>{' '}
          in estimated prevented loss.
          {top1 && top2 && (
            <>
              {' '}
              The most frequent detection signal was{' '}
              <span className="font-semibold text-slate-100">{top1.name.toLowerCase()}</span> (
              {formatInteger(top1.count)} instances), followed by{' '}
              <span className="font-semibold text-slate-100">{top2.name.toLowerCase()}</span> (
              {formatInteger(top2.count)} instances).
            </>
          )}{' '}
          {m.circularRingsCount > 0 && (
            <>
              <span className="font-mono font-semibold text-amber-300">
                {m.circularRingsCount}
              </span>{' '}
              potential circular-flow layering rings were detected involving{' '}
              <span className="font-mono font-semibold text-amber-300">
                {m.circularAccountCount}
              </span>{' '}
              accounts.
            </>
          )}
        </p>
      </section>

      <ReportsCharts
        patternBreakdown={m.patternBreakdown}
        channelRiskSeries={m.channelRiskSeries}
      />

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-100">
          Model Behavior & Detection Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <h3 className="font-semibold text-emerald-400">1. Behavioral Anomaly (40%)</h3>
            <p>
              Computes per-transaction amount z-scores against each account’s historical
              mean and standard deviation, combined with active-hour deviation, device
              novelty, cross-border IP mismatch, new receiver flags, and 24-hour velocity.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <h3 className="font-semibold text-amber-400">2. Deterministic AML Rules (35%)</h3>
            <p>
              Sliding-window scanners detect structuring below $10,000 over 48 hours,
              2-hour velocity bursts, repeated round-thousand transfers, dormant-account
              reactivation spikes, and 72-hour directed circular flow rings.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <h3 className="font-semibold text-rose-400">3. Graph Risk & SHAP XAI (25%)</h3>
            <p>
              Builds a directed counterparty graph to measure fan-out ratio, 24h
              pass-through velocity, and holding duration to surface mule and shell
              entities, attributing every score to human-readable SHAP feature bars.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 border-t border-slate-800 pt-3 leading-relaxed">
          <strong className="text-slate-300">Limitations:</strong> This is a client-side
          prototype using synthetic data and simplified heuristics. Production AML systems
          require calibrated models, human review workflows, and regulatory validation.
        </p>
      </section>
    </div>
  );
}
