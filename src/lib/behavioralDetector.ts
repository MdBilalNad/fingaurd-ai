import type { Account, Transaction } from '../types';

export interface BehavioralFeatures {
  zAmount: number;
  hourDeviation: number;
  newDevice: number;
  crossBorder: number;
  newReceiver: number;
  velocity24h: number;
  behavioralAnomalyScore: number;
  txnHour: number;
}

export function computeBehavioralFeatures(
  txn: Transaction,
  sender: Account,
  velocity24h: number,
): BehavioralFeatures {
  const stdDev = Math.max(1, sender.stdDevAmount);
  const zAmount = Math.abs(txn.amount - sender.avgTransactionAmount) / stdDev;
  const txnHour = new Date(txn.timestamp).getUTCHours();
  const hourDeviation = sender.typicalHours.includes(txnHour) ? 0 : 1;
  const newDevice = sender.knownDevices.includes(txn.deviceId) ? 0 : 1;
  const crossBorder =
    txn.isCrossBorder && txn.ipCountry !== sender.homeCountry ? 1 : 0;
  const newReceiver = txn.isNewReceiver ? 1 : 0;

  const raw =
    0.3 * zAmount +
    0.15 * hourDeviation +
    0.2 * newDevice +
    0.15 * crossBorder +
    0.1 * newReceiver +
    0.1 * Math.min(velocity24h / 10, 1);

  const behavioralAnomalyScore = Math.max(0, Math.min(1, raw));

  return {
    zAmount,
    hourDeviation,
    newDevice,
    crossBorder,
    newReceiver,
    velocity24h,
    behavioralAnomalyScore,
    txnHour,
  };
}
