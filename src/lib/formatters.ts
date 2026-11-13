const usdFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const intFormat = new Intl.NumberFormat('en-US');

export function formatCurrency(amount: number): string {
  return usdFull.format(amount);
}

export function formatCompactCurrency(amount: number): string {
  return usdCompact.format(amount);
}

export function formatInteger(value: number): string {
  return intFormat.format(value);
}

export function formatRelativeTime(isoTimestamp: string, nowMs: number): string {
  const diffSec = Math.max(0, Math.floor((nowMs - Date.parse(isoTimestamp)) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export function formatAbsoluteTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
}

export function formatChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    UPI: 'UPI',
    card: 'Card',
    wallet: 'Wallet',
    bank_transfer: 'Bank Transfer',
    ATM: 'ATM',
    crypto_onramp: 'Crypto On-Ramp',
  };
  return labels[channel] ?? channel;
}
