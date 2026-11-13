import type { Channel } from '../types';

export interface GeoLocation {
  country: string;
  city: string;
}

export const HOME_GEOS: readonly GeoLocation[] = [
  { country: 'US', city: 'New York' },
  { country: 'US', city: 'Chicago' },
  { country: 'US', city: 'Austin' },
  { country: 'GB', city: 'London' },
  { country: 'CA', city: 'Toronto' },
  { country: 'DE', city: 'Frankfurt' },
  { country: 'SG', city: 'Singapore' },
  { country: 'AU', city: 'Sydney' },
];

export const HIGH_RISK_FOREIGN_GEOS: readonly GeoLocation[] = [
  { country: 'CY', city: 'Limassol' },
  { country: 'PA', city: 'Panama City' },
  { country: 'AE', city: 'Dubai' },
  { country: 'MT', city: 'Valletta' },
  { country: 'KY', city: 'George Town' },
  { country: 'HK', city: 'Hong Kong' },
];

export const CHANNELS: readonly Channel[] = [
  'UPI',
  'card',
  'wallet',
  'bank_transfer',
  'ATM',
  'crypto_onramp',
];

export const NORMAL_CATEGORIES: readonly string[] = [
  'Retail & Groceries',
  'Cloud & Software',
  'Logistics & Freight',
  'Utilities & Telecom',
  'Dining & Travel',
  'Professional Services',
  'Payroll & Contractors',
  'Healthcare',
];

export const SUSPICIOUS_CATEGORIES: readonly string[] = [
  'Digital Asset Exchange',
  'Offshore Consulting',
  'Precious Metals',
  'Cross-Border Wire',
  'Shell Holding Transfer',
  'High-Value Electronics',
];
