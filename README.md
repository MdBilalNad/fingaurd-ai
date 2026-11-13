# FinGuard AI — Financial Security & AML Command Center

FinGuard AI is a self-contained, browser-native financial security and anti-money laundering (AML) monitoring dashboard with Explainable AI (XAI) built into every alert. It runs entirely client-side with zero external API calls, zero backend setup, and deterministic seeded synthetic data (`"finguard-demo-2026"`).

## Technology Stack

- **Framework**: React 19 + TypeScript (strict mode) + Vite 8
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";`)
- **Charts**: Recharts (90-day stacked volume AreaChart, Risk Distribution Donut, Pattern Breakdown & Channel Risk BarCharts)
- **Icons**: Lucide React
- **State Management**: React Context + `useReducer` with memoized selectors (`useMemo` / `useCallback`)

## Three-Layer Detection Methodology & XAI

1. **Behavioral Anomaly Detector (40% weight)** (`src/lib/behavioralDetector.ts`):
   Computes a `[0, 1]` anomaly score per transaction from amount z-score (`|amount - mean| / stdDev`), off-hours deviation against account `typicalHours`, unrecognised device fingerprint, cross-border IP mismatch, counterparty novelty, and 24-hour outgoing velocity.
2. **Deterministic AML Rule Engine (35% weight)** (`src/lib/ruleEngine.ts`, `src/lib/circularFlowDetector.ts`):
   Evaluates sliding-window rules:
   - **Structuring**: 3+ transfers just below $10,000 within 48h to distinct receivers.
   - **Velocity Burst**: 5+ outgoing transactions within 2 hours.
   - **Round-Amount Transfers**: 3+ exact `$1,000`-multiple transfers within 24 hours.
   - **Cross-Border Anomaly**: High-value foreign IP transfer mismatching account home country.
   - **New Device High-Value**: Unrecognised device transfer >= 3× account average.
   - **Dormant Account Burst**: >60 days inactivity followed by 4+ transfers in 24 hours.
   - **Circular Flow**: Directed graph DFS detecting 3–5 hop cycles within 72 hours.
3. **Graph Risk Scorer (15% sender + 10% receiver weight)** (`src/lib/graphScorer.ts`):
   Computes `inDegree`, `outDegree`, `fanOutRatio`, `passThroughRatio`, and average holding time to flag `potential_mule` and `potential_shell` entities.
4. **SHAP-Style Explainability (`ShapReason[]`)** (`src/lib/explainability.ts`):
   Every flagged transaction (`riskScore >= 25`) includes 3–6 ranked feature attributions with signed contributions and plain-language explanations.

## Data Schema

Core TypeScript interfaces live under `src/types/`:
- `Account` (`C0001`–`C1200`), `Transaction` (8,000 events over 90 days), `DetectionResult`, `RiskScore`, `ShapReason`, `Alert`, `NetworkNode`, `NetworkEdge`.

## Customizing Thresholds

- **Composite Weights & Risk Tiers**: Edit weights (`0.40 / 0.35 / 0.15 / 0.10`) and `mapScoreToRiskLevel` thresholds (`25 / 50 / 75`) in `src/lib/detectionEngine.ts` and `src/lib/networkBuilder.ts`.
- **AML Rule Windows**: Adjust structuring bounds (`[8000, 10000)`), velocity burst count (`>= 5` in `2h`), or dormant gap (`> 60d`) in `src/lib/ruleEngine.ts` and `src/lib/circularFlowDetector.ts`.
- **Graph Role Thresholds**: Adjust `fanOutRatio > 5`, `passThroughRatio > 0.8`, or `inDegree > 20 && avgHoldingHours < 6` in `src/lib/graphScorer.ts`.

## Limitations

This is a client-side prototype using synthetic data and simplified heuristics. Production AML systems require calibrated statistical/ML models trained on labeled historical fraud, case management audit trails, and regulatory validation.
