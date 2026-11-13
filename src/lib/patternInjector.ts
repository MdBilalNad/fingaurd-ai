import type { Account, Transaction } from '../types';
import { injectEntityAndDormantPatterns, makeSuspiciousTxn } from './entityPatternInjector';
import { HIGH_RISK_FOREIGN_GEOS, HOME_GEOS } from './geoProfiles';
import { DAY_MS, HOUR_MS, type SeededRng } from './prng';

function pickForeignGeo(rng: SeededRng, homeCountry: string) {
  const pool = [...HIGH_RISK_FOREIGN_GEOS, ...HOME_GEOS].filter(
    (g) => g.country !== homeCountry,
  );
  return rng.pick(pool);
}

export function generateSuspiciousPatterns(
  rng: SeededRng,
  accounts: Account[],
  anchorNowMs: number,
  startTxnIndex: number,
): { txns: Transaction[]; dormantExcludedIds: Set<string> } {
  const txns: Transaction[] = [];
  let idx = startTxnIndex;

  const individuals = accounts.filter(
    (a) => a.archetype === 'normal' && a.accountType === 'individual',
  );
  const businesses = accounts.filter(
    (a) => a.archetype === 'normal' && a.accountType === 'business',
  );
  const shells = accounts.filter((a) => a.archetype === 'shell');

  // 1. STRUCTURING (14 clusters x 4 txns = 56 txns)
  for (let c = 0; c < 14; c += 1) {
    const sender = individuals[(c * 17 + 5) % individuals.length];
    const baseMs = anchorNowMs - rng.float(2, 65) * DAY_MS;
    for (let k = 0; k < 4; k += 1) {
      const receiver = individuals[(c * 17 + 20 + k) % individuals.length];
      txns.push(
        makeSuspiciousTxn(
          idx++,
          baseMs + k * rng.float(2, 9) * HOUR_MS,
          sender,
          receiver.accountId,
          rng.float(9250, 9940),
          'bank_transfer',
          sender.knownDevices[0],
          sender.homeCountry,
          sender.homeCity,
          'STRUCTURING',
          'fraud',
        ),
      );
    }
  }

  // 2. VELOCITY BURSTS (12 bursts x 6 txns = 72 txns)
  for (let c = 0; c < 12; c += 1) {
    const sender = individuals[(c * 23 + 40) % individuals.length];
    const baseMs = anchorNowMs - rng.float(1, 50) * DAY_MS;
    for (let k = 0; k < 6; k += 1) {
      const receiver = individuals[(c * 23 + 60 + k) % individuals.length];
      txns.push(
        makeSuspiciousTxn(
          idx++,
          baseMs + k * rng.float(0.08, 0.25) * HOUR_MS,
          sender,
          receiver.accountId,
          rng.float(1200, 4600),
          k % 2 === 0 ? 'wallet' : 'card',
          `DEV-UNKN-${idx}`,
          sender.homeCountry,
          sender.homeCity,
          'VELOCITY',
          'fraud',
        ),
      );
    }
  }

  // 3. ROUND_AMOUNT to shell accounts (10 clusters x 4 txns = 40 txns)
  for (let c = 0; c < 10; c += 1) {
    const sender = businesses[c % businesses.length];
    const shell = shells[c % shells.length];
    const baseMs = anchorNowMs - rng.float(3, 45) * DAY_MS;
    const roundVals = [5000, 9000, 10000, 12000, 15000];
    for (let k = 0; k < 4; k += 1) {
      txns.push(
        makeSuspiciousTxn(
          idx++,
          baseMs + k * rng.float(1.5, 4) * HOUR_MS,
          sender,
          shell.accountId,
          roundVals[(c + k) % roundVals.length],
          'bank_transfer',
          sender.knownDevices[0],
          sender.homeCountry,
          sender.homeCity,
          'ROUND_AMOUNT',
          'suspicious',
        ),
      );
    }
  }

  // 4. CROSS_BORDER_ANOMALY (45 txns)
  for (let c = 0; c < 45; c += 1) {
    const sender = accounts[(c * 19 + 11) % accounts.length];
    const foreign = pickForeignGeo(rng, sender.homeCountry);
    const tsMs = anchorNowMs - rng.float(1, 75) * DAY_MS;
    txns.push(
      makeSuspiciousTxn(
        idx++,
        tsMs,
        sender,
        businesses[(c * 7) % businesses.length].accountId,
        Math.max(7500, sender.avgTransactionAmount * rng.float(3.4, 6.2)),
        c % 3 === 0 ? 'crypto_onramp' : 'bank_transfer',
        `DEV-FOREIGN-${idx}`,
        foreign.country,
        foreign.city,
        'CROSS_BORDER_ANOMALY',
        'suspicious',
      ),
    );
  }

  // 5. NEW_DEVICE_HIGH_VALUE (45 txns)
  for (let c = 0; c < 45; c += 1) {
    const sender = individuals[(c * 13 + 300) % individuals.length];
    const receiver = businesses[(c * 5 + 12) % businesses.length];
    const tsMs = anchorNowMs - rng.float(0.5, 60) * DAY_MS;
    const offHourDate = new Date(tsMs);
    offHourDate.setUTCHours((sender.typicalHours[0] + 15) % 24);
    txns.push(
      makeSuspiciousTxn(
        idx++,
        offHourDate.getTime(),
        sender,
        receiver.accountId,
        sender.avgTransactionAmount * rng.float(3.8, 7.2),
        'card',
        `DEV-NEW-${idx}`,
        sender.homeCountry,
        sender.homeCity,
        'NEW_DEVICE_HIGH_VALUE',
        'fraud',
      ),
    );
  }

  // 6. CIRCULAR_FLOW rings (4 rings of 3-4 hops within 48h = 14 txns)
  for (let r = 0; r < 4; r += 1) {
    const ringLen = r % 2 === 0 ? 3 : 4;
    const ring: Account[] = [];
    for (let k = 0; k < ringLen; k += 1) {
      ring.push(accounts[(600 + r * 12 + k * 3) % accounts.length]);
    }
    const baseMs = anchorNowMs - (3 + r * 6) * DAY_MS;
    const startAmt = 14500 + r * 3200;
    for (let k = 0; k < ringLen; k += 1) {
      const from = ring[k];
      const to = ring[(k + 1) % ringLen];
      txns.push(
        makeSuspiciousTxn(
          idx++,
          baseMs + k * 7 * HOUR_MS,
          from,
          to.accountId,
          startAmt - k * 280,
          'bank_transfer',
          from.knownDevices[0],
          from.homeCountry,
          from.homeCity,
          'CIRCULAR_FLOW',
          'fraud',
        ),
      );
    }
  }

  const entityResult = injectEntityAndDormantPatterns(
    rng,
    accounts,
    anchorNowMs,
    idx,
  );
  return {
    txns: [...txns, ...entityResult.txns],
    dormantExcludedIds: entityResult.dormantExcludedIds,
  };
}
