import {
  Activity,
  Globe,
  Layers,
  RefreshCw,
  Smartphone,
  Zap,
} from 'lucide-react';
import type { RuleFlag } from '../../types';

const FLAG_META: Record<RuleFlag, { icon: typeof Layers; label: string }> = {
  STRUCTURING: { icon: Layers, label: 'Structuring' },
  VELOCITY: { icon: Zap, label: 'Velocity Burst' },
  ROUND_AMOUNT: { icon: Activity, label: 'Round Amount' },
  CROSS_BORDER_ANOMALY: { icon: Globe, label: 'Cross-Border' },
  NEW_DEVICE_HIGH_VALUE: { icon: Smartphone, label: 'New Device' },
  CIRCULAR_FLOW: { icon: RefreshCw, label: 'Circular Flow' },
  DORMANT_BURST: { icon: Zap, label: 'Dormant Burst' },
  MULE_BEHAVIOR: { icon: Layers, label: 'Mule Account' },
  SHELL_BEHAVIOR: { icon: Layers, label: 'Shell Account' },
};

export function FlagIcon({ flag }: { flag: RuleFlag }) {
  const cfg = FLAG_META[flag];
  const Icon = cfg.icon;
  return (
    <span title={cfg.label} aria-label={cfg.label} className="text-amber-400">
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
    </span>
  );
}
