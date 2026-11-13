import type { Account, Channel, RuleFlag, Transaction } from '../types';
import { HIGH_RISK_FOREIGN_GEOS, SUSPICIOUS_CATEGORIES } from './geoProfiles';
import { DAY_MS, HOUR_MS, type SeededRng } from './prng';

export function makeSuspiciousTxn(
  idNum: number,
  tsMs: number,
  sender: Account,
  receiverId: string,
  amount: number,
  channel: Channel,
  deviceId: string,
  ipCountry: string,
  ipCity: string,
  pattern: RuleFlag,
  groundTruth: 'suspicious' | 'fraud',
): Transaction {
  return {
    txnId: `TXN-${String(idNum).padStart(6, '0')}`,
    timestamp: new Date(tsMs).toISOString(),
    amount: Math.round(amount * 100) / 100,
    currency: 'USD',
    senderId: sender.accountId,
    receiverId,
    channel,
    deviceId,
    ipCountry,
    ipCity,
    merchantCategory:
      pattern === 'ROUND_AMOUNT' || pattern === 'SHELL_BEHAVIOR'
        ? 'Shell Holding Transfer'
        : SUSPICIOUS_CATEGORIES[idNum % SUSPICIOUS_CATEGORIES.length],
    isCrossBorder: ipCountry !== sender.homeCountry,
    isNewReceiver: true,
    groundTruth,
    injectedPattern: pattern,
  };
}

export function injectEntityAndDormantPatterns(
  rng: SeededRng,
  accounts: Account[],
  anchorNowMs: number,
  startIdx: number,
): { txns: Transaction[]; nextIdx: number; dormantExcludedIds: Set<string> } {
  const txns: Transaction[] = [];
  const dormantExcludedIds = new Set<string>();
  let idx = startIdx;

  const individuals = accounts.filter(
    (a) => a.archetype === 'normal' && a.accountType === 'individual',
  );
  const businesses = accounts.filter(
    (a) => a.archetype === 'normal' && a.accountType === 'business',
  );
  const mules = accounts.filter((a) => a.archetype === 'mule');
  const shells = accounts.filter((a) => a.archetype === 'shell');

  // 7. DORMANT_BURST: 7 accounts dormant 65+ days then 5 txns in 16h
  for (let d = 0; d < 7; d += 1) {
    const sender = individuals[(820 + d * 11) % individuals.length];
    dormantExcludedIds.add(sender.accountId);
    txns.push(
      makeSuspiciousTxn(
        idx++,
        anchorNowMs - 85 * DAY_MS,
        sender,
        individuals[(830 + d) % individuals.length].accountId,
        sender.avgTransactionAmount,
        'card',
        sender.knownDevices[0],
        sender.homeCountry,
        sender.homeCity,
        'DORMANT_BURST',
        'suspicious',
      ),
    );
    const burstBase = anchorNowMs - (2 + d * 2) * DAY_MS;
    for (let k = 0; k < 5; k += 1) {
      txns.push(
        makeSuspiciousTxn(
          idx++,
          burstBase + k * 3.1 * HOUR_MS,
          sender,
          individuals[(845 + d * 9 + k) % individuals.length].accountId,
          sender.avgTransactionAmount * rng.float(2.4, 4.1),
          'wallet',
          `DEV-BURST-${idx}`,
          sender.homeCountry,
          sender.homeCity,
          'DORMANT_BURST',
          'fraud',
        ),
      );
    }
  }

  // 8. MULE fan-out (fanOutRatio > 5 AND passThroughRatio > 0.8)
  for (const mule of mules) {
    const baseMs = anchorNowMs - rng.float(4, 28) * DAY_MS;
    const feeder = businesses[rng.int(0, businesses.length - 1)];
    txns.push(
      makeSuspiciousTxn(
        idx++,
        baseMs,
        feeder,
        mule.accountId,
        36000,
        'bank_transfer',
        feeder.knownDevices[0],
        feeder.homeCountry,
        feeder.homeCity,
        'MULE_BEHAVIOR',
        'fraud',
      ),
    );
    for (let k = 0; k < 7; k += 1) {
      const target =
        individuals[(mule.accountId.charCodeAt(4) * 19 + k * 7) % individuals.length];
      txns.push(
        makeSuspiciousTxn(
          idx++,
          baseMs + (k + 1) * 1.8 * HOUR_MS,
          mule,
          target.accountId,
          4850,
          'wallet',
          mule.knownDevices[0],
          mule.homeCountry,
          mule.homeCity,
          'MULE_BEHAVIOR',
          'fraud',
        ),
      );
    }
  }

  // 9. SHELL rapid inbound + dispersion (inDegree > 20 AND avgHoldingTime < 6h)
  for (const shell of shells) {
    const baseMs = anchorNowMs - rng.float(5, 35) * DAY_MS;
    for (let k = 0; k < 22; k += 1) {
      const feeder = accounts[(100 + k * 17) % accounts.length];
      txns.push(
        makeSuspiciousTxn(
          idx++,
          baseMs + k * 0.15 * HOUR_MS,
          feeder,
          shell.accountId,
          rng.float(1800, 3200),
          'bank_transfer',
          feeder.knownDevices[0],
          feeder.homeCountry,
          feeder.homeCity,
          'SHELL_BEHAVIOR',
          'suspicious',
        ),
      );
    }
    const foreign = HIGH_RISK_FOREIGN_GEOS[0];
    txns.push(
      makeSuspiciousTxn(
        idx++,
        baseMs + 4.5 * HOUR_MS,
        shell,
        mules[0].accountId,
        49500,
        'crypto_onramp',
        shell.knownDevices[0],
        foreign.country,
        foreign.city,
        'SHELL_BEHAVIOR',
        'fraud',
      ),
    );
  }

  return { txns, nextIdx: idx, dormantExcludedIds };
}
