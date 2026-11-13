import { useEffect, useRef } from 'react';
import { useFinGuard } from '../context/FinGuardContext';
import { ALERT_TITLES } from '../lib/alertBuilder';
import { scoreSingleTransaction } from '../lib/detectionEngine';
import { CHANNELS, HIGH_RISK_FOREIGN_GEOS, NORMAL_CATEGORIES, SUSPICIOUS_CATEGORIES } from '../lib/geoProfiles';
import type { Alert, RuleFlag, Transaction } from '../types';

export function useLiveSimulation() {
  const { state, dispatch } = useFinGuard();
  const stateRef = useRef(state);
  stateRef.current = state;
  const seqRef = useRef(1);

  useEffect(() => {
    if (!state.simulationEnabled) return undefined;

    const timer = window.setInterval(() => {
      const current = stateRef.current;
      const step = seqRef.current++;
      const sender = current.accounts[(step * 37) % current.accounts.length];
      const receiver = current.accounts[(step * 53 + 11) % current.accounts.length];
      const isSuspicious = step % 2 === 1;
      const foreign = HIGH_RISK_FOREIGN_GEOS[step % HIGH_RISK_FOREIGN_GEOS.length];
      const tsIso = new Date(current.anchorNowMs + step * 3000).toISOString();

      const txn: Transaction = {
        txnId: `TXN-LIVE-${String(step).padStart(4, '0')}`,
        timestamp: tsIso,
        amount: isSuspicious
          ? Math.round(sender.avgTransactionAmount * (3.8 + (step % 3)) * 100) / 100
          : Math.round(sender.avgTransactionAmount * 0.95 * 100) / 100,
        currency: 'USD',
        senderId: sender.accountId,
        receiverId: receiver.accountId,
        channel: isSuspicious ? 'crypto_onramp' : CHANNELS[step % CHANNELS.length],
        deviceId: isSuspicious ? `DEV-LIVE-${step}` : sender.knownDevices[0],
        ipCountry: isSuspicious ? foreign.country : sender.homeCountry,
        ipCity: isSuspicious ? foreign.city : sender.homeCity,
        merchantCategory: isSuspicious
          ? SUSPICIOUS_CATEGORIES[step % SUSPICIOUS_CATEGORIES.length]
          : NORMAL_CATEGORIES[step % NORMAL_CATEGORIES.length],
        isCrossBorder: isSuspicious,
        isNewReceiver: isSuspicious,
        groundTruth: isSuspicious ? 'fraud' : 'legitimate',
      };

      const result = scoreSingleTransaction(
        txn,
        current.accounts,
        current.transactions.slice(0, 150),
        current.accountMetrics,
      );

      let newAlert: Alert | undefined;
      if (result.riskScore.score >= 50) {
        const flag: RuleFlag = result.flags[0] ?? 'NEW_DEVICE_HIGH_VALUE';
        newAlert = {
          alertId: `ALT-LIVE-${String(step).padStart(3, '0')}`,
          createdAt: txn.timestamp,
          severity: result.riskScore.level,
          alertType: ALERT_TITLES[flag] ?? 'Real-Time Anomaly',
          primaryFlag: flag,
          description: result.reasons[0]?.humanText ?? 'Anomalous live transaction detected.',
          affectedTxnIds: [txn.txnId],
          accountIds: [txn.senderId, txn.receiverId],
          riskScore: result.riskScore.score,
          reasons: result.reasons,
          status: 'open',
        };
      }

      dispatch({ type: 'INJECT_TRANSACTION', transaction: txn, result, newAlert });

      if (newAlert) {
        dispatch({
          type: 'ADD_TOAST',
          toast: {
            id: `toast-${txn.txnId}`,
            title: `${newAlert.severity.toUpperCase()} Alert · ${txn.txnId}`,
            description: `${txn.senderId} → ${txn.receiverId} ($${txn.amount.toLocaleString('en-US')}) scored ${result.riskScore.score}/100`,
            severity: newAlert.severity,
            txnId: txn.txnId,
          },
        });
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [state.simulationEnabled, dispatch]);
}
