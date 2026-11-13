import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSyntheticDataset } from './dataGenerator';
import { runDetectionEngine, scoreSingleTransaction } from './detectionEngine';
import { DEMO_ANCHOR_MS, DEMO_SEED } from './prng';

test('seeded dataset generates 1,200 accounts and 8,000 reproducible transactions', () => {
  const ds1 = generateSyntheticDataset(DEMO_SEED, DEMO_ANCHOR_MS);
  const ds2 = generateSyntheticDataset(DEMO_SEED, DEMO_ANCHOR_MS);

  assert.equal(ds1.accounts.length, 1200);
  assert.equal(ds1.transactions.length, 8000);
  assert.equal(ds1.transactions[0].txnId, ds2.transactions[0].txnId);
  assert.equal(ds1.transactions[0].amount, ds2.transactions[0].amount);
  assert.equal(ds1.transactions[7999].timestamp, ds2.transactions[7999].timestamp);
});

test('detection engine fires all 6+ AML rules, detects cycles, mules, shells, and provides >=3 SHAP reasons', () => {
  const ds = generateSyntheticDataset(DEMO_SEED, DEMO_ANCHOR_MS);
  const output = runDetectionEngine(ds.accounts, ds.transactions);

  const triggeredRuleIds = new Set<string>();
  let flaggedCount = 0;
  let circularCount = 0;

  for (const txn of ds.transactions) {
    const res = output.resultsByTxnId[txn.txnId];
    assert.ok(res, `Missing result for ${txn.txnId}`);
    assert.ok(res.riskScore.score >= 0 && res.riskScore.score <= 100);

    for (const r of res.triggeredRules) {
      if (r.triggered) triggeredRuleIds.add(r.ruleId);
    }
    if (res.cyclePath) circularCount += 1;

    if (res.riskScore.score >= 25) {
      flaggedCount += 1;
      assert.ok(
        res.reasons.length >= 3,
        `Flagged txn ${txn.txnId} had only ${res.reasons.length} reasons`,
      );
    }
  }

  for (const expectedRule of [
    'STRUCTURING',
    'VELOCITY',
    'ROUND_AMOUNT',
    'CROSS_BORDER_ANOMALY',
    'NEW_DEVICE_HIGH_VALUE',
    'DORMANT_BURST',
    'CIRCULAR_FLOW',
  ]) {
    assert.ok(
      triggeredRuleIds.has(expectedRule),
      `Expected rule ${expectedRule} to trigger at least once`,
    );
  }

  assert.ok(circularCount >= 12, `Expected circular flow txns, got ${circularCount}`);
  assert.ok(flaggedCount >= 200, `Expected >=200 flagged txns, got ${flaggedCount}`);

  const roles = Object.values(output.accountMetrics).map((m) => m.roleFlag);
  assert.ok(roles.includes('potential_mule'), 'Expected potential_mule accounts');
  assert.ok(roles.includes('potential_shell'), 'Expected potential_shell accounts');
  assert.ok(output.alerts.length >= 30, 'Expected generated alerts');
  assert.equal(output.networkNodes.length, 80);
});

test('scoreSingleTransaction scores a live injected high-risk transaction accurately', () => {
  const ds = generateSyntheticDataset(DEMO_SEED, DEMO_ANCHOR_MS);
  const output = runDetectionEngine(ds.accounts, ds.transactions);
  const sender = ds.accounts[10];
  const receiver = ds.accounts[25];

  const liveTxn = {
    txnId: 'TXN-LIVE-001',
    timestamp: new Date(DEMO_ANCHOR_MS + 3000).toISOString(),
    amount: sender.avgTransactionAmount * 6.5,
    currency: 'USD' as const,
    senderId: sender.accountId,
    receiverId: receiver.accountId,
    channel: 'crypto_onramp' as const,
    deviceId: 'DEV-UNKNOWN-LIVE',
    ipCountry: 'PA',
    ipCity: 'Panama City',
    merchantCategory: 'Digital Asset Exchange',
    isCrossBorder: true,
    isNewReceiver: true,
    groundTruth: 'fraud' as const,
  };

  const res = scoreSingleTransaction(
    liveTxn,
    ds.accounts,
    ds.transactions.slice(0, 200),
    output.accountMetrics,
  );
  assert.ok(res.riskScore.score >= 50, `Expected high risk score, got ${res.riskScore.score}`);
  assert.ok(res.reasons.length >= 3);
});

test('report export builders generate valid CSV and JSON summaries', async () => {
  const { buildReportCsv, buildReportJson } = await import('./reportExport');
  const payload = {
    generatedAt: '2026-11-13T04:50:00.000Z',
    totalTransactions: 8000,
    totalAccounts: 1200,
    totalAmount: 13400000,
    fraudPreventedAmount: 956900,
    mediumPlusCount: 1614,
    highAlertsCount: 259,
    criticalAlertsCount: 88,
    circularRingsCount: 4,
    circularAccountCount: 14,
    patternBreakdown: [{ name: 'New Device', count: 159 }],
    channelRiskSeries: [{ channel: 'UPI', low: 1000, medium: 200, high: 20, critical: 5 }],
    narrative: 'In the last 90 days, FinGuard AI analysed 8,000 transactions.',
  };

  const json = buildReportJson(payload);
  const parsed = JSON.parse(json) as { totalTransactions: number; patternBreakdown: unknown[] };
  assert.equal(parsed.totalTransactions, 8000);
  assert.equal(parsed.patternBreakdown.length, 1);

  const csv = buildReportCsv(payload);
  assert.ok(csv.includes('Section,Metric_or_Category,Value_or_Total'));
  assert.ok(csv.includes('Summary,Transactions (90d),8000'));
  assert.ok(csv.includes('Pattern Breakdown,New Device,159'));
  assert.ok(csv.includes('Channel Risk,UPI,1225,1000,200,20,5'));
});

