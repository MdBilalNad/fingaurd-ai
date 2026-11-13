import type { Account, AccountType, RiskTier } from '../types';
import { HOME_GEOS } from './geoProfiles';
import type { SeededRng } from './prng';

function buildTypicalHours(rng: SeededRng, isBusiness: boolean): number[] {
  const start = isBusiness ? rng.int(8, 10) : rng.int(7, 11);
  const span = isBusiness ? rng.int(8, 10) : rng.int(10, 14);
  const hours: number[] = [];
  for (let i = 0; i < span; i += 1) {
    hours.push((start + i) % 24);
  }
  return hours;
}

function buildDevices(rng: SeededRng, accountNum: number): string[] {
  const count = rng.weightedPick([
    { value: 1, weight: 0.35 },
    { value: 2, weight: 0.45 },
    { value: 3, weight: 0.2 },
  ]);
  const devices: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const hash = Math.floor(rng.next() * 0xffffff)
      .toString(16)
      .padStart(6, '0');
    devices.push(`DEV-${accountNum}-${hash}`);
  }
  return devices;
}

export function generateAccounts(rng: SeededRng, total = 1200): Account[] {
  const accounts: Account[] = [];
  const muleIndices = new Set([14, 78, 142, 235, 389, 512, 677, 891]);
  const shellIndices = new Set([45, 310, 740]);

  for (let i = 1; i <= total; i += 1) {
    const accountId = `C${String(i).padStart(4, '0')}`;
    const isMule = muleIndices.has(i);
    const isShell = shellIndices.has(i);
    const archetype = isMule ? 'mule' : isShell ? 'shell' : 'normal';

    const accountType: AccountType =
      isMule || isShell
        ? 'business'
        : rng.next() < 0.24
          ? 'business'
          : 'individual';

    const geo = rng.pick(HOME_GEOS);
    const avgTransactionAmount =
      accountType === 'business'
        ? Math.round(rng.float(1400, 4800))
        : Math.round(rng.float(180, 1150));

    const stdDevAmount = Math.max(
      60,
      Math.round(avgTransactionAmount * rng.float(0.28, 0.45)),
    );

    const riskTier: RiskTier =
      isMule || isShell
        ? 'high'
        : rng.weightedPick([
            { value: 'low', weight: 0.72 },
            { value: 'medium', weight: 0.21 },
            { value: 'high', weight: 0.07 },
          ]);

    const accountAgeDays =
      isMule || isShell ? rng.int(45, 220) : rng.int(90, 2400);

    accounts.push({
      accountId,
      accountType,
      homeCountry: geo.country,
      homeCity: geo.city,
      avgTransactionAmount,
      stdDevAmount,
      typicalHours: buildTypicalHours(rng, accountType === 'business'),
      knownDevices: buildDevices(rng, i),
      accountAgeDays,
      riskTier,
      archetype,
    });
  }

  return accounts;
}
