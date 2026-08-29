import { ComparisonMetric } from '../types';

export const MAX_COMPARISON_METRICS = 5;

export type ComparisonWinner = 'player1' | 'player2' | 'tie' | 'none';

function toComparableNumber(value: string): number | null {
  const normalized = String(value).trim().replace(/\s+/g, '').replace(/,/g, '');
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getMetricWinner(metric: ComparisonMetric): ComparisonWinner {
  const val1 = toComparableNumber(metric.val1);
  const val2 = toComparableNumber(metric.val2);

  if (val1 === null || val2 === null) return 'none';
  if (val1 === val2) return 'tie';

  const higherIsBetter = metric.higherIsBetter !== false;
  if (higherIsBetter) return val1 > val2 ? 'player1' : 'player2';
  return val1 < val2 ? 'player1' : 'player2';
}

export interface ComparisonContext {
  season?: string;
  competition?: string;
  league?: string;
  scope?: string;
  minimumMinutes?: string | number;
  minutes?: string | number;
  normalization?: string;
}

export function formatComparisonContext(context?: ComparisonContext | null): string {
  if (!context) return '';

  const competition = context.competition || context.league || context.scope;
  const minimumMinutes = context.minimumMinutes ?? context.minutes;
  const parts = [
    context.season,
    competition,
    context.normalization,
    minimumMinutes != null && String(minimumMinutes).trim() !== ''
      ? `MIN. ${minimumMinutes} MINUTES`
      : undefined,
  ]
    .filter(Boolean)
    .map((part) => String(part).trim().toUpperCase());

  return parts.join(' • ');
}

export function visibleComparisonMetrics(metrics: ComparisonMetric[] = []): ComparisonMetric[] {
  return metrics.slice(0, MAX_COMPARISON_METRICS);
}
