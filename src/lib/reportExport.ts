export interface ReportExportPayload {
  generatedAt: string;
  totalTransactions: number;
  totalAccounts: number;
  totalAmount: number;
  fraudPreventedAmount: number;
  mediumPlusCount: number;
  highAlertsCount: number;
  criticalAlertsCount: number;
  circularRingsCount: number;
  circularAccountCount: number;
  patternBreakdown: { name: string; count: number }[];
  channelRiskSeries: {
    channel: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }[];
  narrative: string;
}

function escapeCsv(val: string | number): string {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildReportJson(payload: ReportExportPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function buildReportCsv(payload: ReportExportPayload): string {
  const lines: string[] = [
    'Section,Metric_or_Category,Value_or_Total,Low,Medium,High,Critical',
    `Summary,Generated At,${escapeCsv(payload.generatedAt)},,,,`,
    `Summary,Transactions (90d),${payload.totalTransactions},,,,`,
    `Summary,Monitored Accounts,${payload.totalAccounts},,,,`,
    `Summary,Total Amount Monitored (USD),${payload.totalAmount.toFixed(2)},,,,`,
    `Summary,Fraud Prevented Est (USD),${payload.fraudPreventedAmount.toFixed(2)},,,,`,
    `Summary,Flagged Medium+ Count,${payload.mediumPlusCount},,,,`,
    `Summary,High Alerts,${payload.highAlertsCount},,,,`,
    `Summary,Critical Alerts,${payload.criticalAlertsCount},,,,`,
    `Summary,Circular Flow Rings,${payload.circularRingsCount},,,,`,
  ];

  for (const p of payload.patternBreakdown) {
    lines.push(`Pattern Breakdown,${escapeCsv(p.name)},${p.count},,,,`);
  }

  for (const c of payload.channelRiskSeries) {
    const total = c.low + c.medium + c.high + c.critical;
    lines.push(
      `Channel Risk,${escapeCsv(c.channel)},${total},${c.low},${c.medium},${c.high},${c.critical}`,
    );
  }

  lines.push(`Narrative,Executive Summary,${escapeCsv(payload.narrative)},,,,`);
  return lines.join('\n');
}

export function downloadBlobFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
