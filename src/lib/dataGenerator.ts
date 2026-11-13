import type { Account, GroundTruth, Transaction } from '../types';
import { generateAccounts } from './accountGenerator';
import {
  CHANNELS,
  HOME_GEOS,
  NORMAL_CATEGORIES,
  SUSPICIOUS_CATEGORIES,
} from './geoProfiles';
import { generateSuspiciousPatterns } from './patternInjector';
import { DAY_MS, DEMO_ANCHOR_MS, DEMO_SEED, HOUR_MS, SeededRng } from './prng';

export interface GeneratedDataset {
  accounts: Account[];
  transactions: Transaction[];
}

function buildTypicalTimestamp(
  rng: SeededRng,
  anchorNowMs: number,
  hoursPool: number[],
  deviateHour: boolean,
): number {
  const daysAgo = rng.float(0.02, 89.5);
  const baseDate = new Date(anchorNowMs - daysAgo * DAY_MS);
  const hour = deviateHour
    ? (hoursPool[0] + rng.int(11, 16)) % 24
    : rng.pick(hoursPool);
  baseDate.setUTCHours(hour, rng.int(0, 59), rng.int(0, 59), 0);
  return Math.min(anchorNowMs - 60_000, baseDate.getTime());
}

export function generateSyntheticDataset(
  seed: string = DEMO_SEED,
  anchorNowMs: number = DEMO_ANCHOR_MS,
): GeneratedDataset {
  const rng = new SeededRng(seed);
  const accounts = generateAccounts(rng, 1200);
  const normalAccounts = accounts.filter((a) => a.archetype === 'normal');

  const { txns: suspiciousTxns, dormantExcludedIds } =
    generateSuspiciousPatterns(rng, accounts, anchorNowMs, 1);

  const totalTarget = 8000;
  const remainingCount = totalTarget - suspiciousTxns.length;
  const elevatedTarget = Math.round(totalTarget * 0.15);
  const activePool = normalAccounts.filter(
    (a) => !dormantExcludedIds.has(a.accountId),
  );

  // Build recurring counterparty lists per account so isNewReceiver is realistic
  const frequentPartners = new Map<string, string[]>();
  for (const acc of activePool) {
    const p1 = rng.pick(activePool).accountId;
    const p2 = rng.pick(activePool).accountId;
    const p3 = rng.pick(activePool).accountId;
    frequentPartners.set(
      acc.accountId,
      [p1, p2, p3].filter((id) => id !== acc.accountId),
    );
  }

  const bulkTxns: Transaction[] = [];
  let txnNum = suspiciousTxns.length + 1;

  for (let i = 0; i < remainingCount; i += 1) {
    const isElevated = i < elevatedTarget;
    const sender = rng.pick(activePool);
    const partners = frequentPartners.get(sender.accountId) ?? [];
    const useKnownPartner = !isElevated && partners.length > 0 && rng.next() < 0.72;

    let receiverId = useKnownPartner
      ? rng.pick(partners)
      : rng.pick(activePool).accountId;
    if (receiverId === sender.accountId) {
      receiverId = activePool[(i + 7) % activePool.length].accountId;
    }

    const zFactor = isElevated ? rng.float(1.6, 2.7) : rng.float(-1.4, 1.4);
    const rawAmount = sender.avgTransactionAmount + zFactor * sender.stdDevAmount;
    const amount = Math.max(12, Math.round(rawAmount * 100) / 100);

    const tsMs = buildTypicalTimestamp(
      rng,
      anchorNowMs,
      sender.typicalHours,
      isElevated && rng.next() < 0.45,
    );

    const newDevice = isElevated && rng.next() < 0.35;
    const deviceId = newDevice
      ? `DEV-ELEV-${txnNum}`
      : rng.pick(sender.knownDevices);

    const crossBorder = isElevated && rng.next() < 0.32;
    const geo = crossBorder
      ? rng.pick(HOME_GEOS.filter((g) => g.country !== sender.homeCountry))
      : { country: sender.homeCountry, city: sender.homeCity };

    const groundTruth: GroundTruth = isElevated ? 'suspicious' : 'legitimate';

    bulkTxns.push({
      txnId: `TXN-${String(txnNum++).padStart(6, '0')}`,
      timestamp: new Date(tsMs + (i % 5) * (HOUR_MS / 120)).toISOString(),
      amount,
      currency: 'USD',
      senderId: sender.accountId,
      receiverId,
      channel: rng.pick(CHANNELS),
      deviceId,
      ipCountry: geo.country,
      ipCity: geo.city,
      merchantCategory: isElevated
        ? rng.pick(SUSPICIOUS_CATEGORIES)
        : rng.pick(NORMAL_CATEGORIES),
      isCrossBorder: crossBorder,
      isNewReceiver: !useKnownPartner,
      groundTruth,
    });
  }

  const all = [...suspiciousTxns, ...bulkTxns].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0,
  );

  // Recompute isNewReceiver strictly chronologically
  const seenPairs = new Set<string>();
  for (let i = all.length - 1; i >= 0; i -= 1) {
    const t = all[i];
    const key = `${t.senderId}->${t.receiverId}`;
    t.isNewReceiver = !seenPairs.has(key);
    seenPairs.add(key);
  }

  return { accounts, transactions: all };
}
