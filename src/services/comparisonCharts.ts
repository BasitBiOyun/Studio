import { ComparisonMetric } from '../types';

export interface ComparisonChartPoint {
  id: string;
  label: string;
  val1: number;
  val2: number;
  display1: string;
  display2: string;
  unit?: string;
  score1: number;
  score2: number;
}

export interface ComparisonPercentilePoint {
  id: string;
  label: string;
  percentile1?: number;
  percentile2?: number;
}

export function parseComparisonNumber(value: unknown): number | null {
  const normalized = String(value ?? '').trim().replace(/\s+/g, '').replace(/,/g, '');
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function rawPairScores(val1: number, val2: number): [number, number] {
  const max = Math.max(Math.abs(val1), Math.abs(val2));
  if (max === 0) return [50, 50];
  return [clampPercent((Math.abs(val1) / max) * 100), clampPercent((Math.abs(val2) / max) * 100)];
}

function performancePairScores(val1: number, val2: number, higherIsBetter = true): [number, number] {
  if (val1 === val2) return [75, 75];

  if (val1 >= 0 && val2 >= 0) {
    if (higherIsBetter) {
      const max = Math.max(val1, val2);
      if (max === 0) return [75, 75];
      return [clampPercent((val1 / max) * 100), clampPercent((val2 / max) * 100)];
    }

    const min = Math.min(val1, val2);
    if (min === 0) return [val1 === 0 ? 100 : 0, val2 === 0 ? 100 : 0];
    return [clampPercent((min / val1) * 100), clampPercent((min / val2) * 100)];
  }

  const low = Math.min(val1, val2);
  const high = Math.max(val1, val2);
  const span = high - low;
  if (span === 0) return [75, 75];
  const normalized1 = (val1 - low) / span;
  const normalized2 = (val2 - low) / span;
  return higherIsBetter
    ? [55 + normalized1 * 45, 55 + normalized2 * 45]
    : [100 - normalized1 * 45, 100 - normalized2 * 45];
}

export function buildComparisonChartPoints(metrics: ComparisonMetric[] = [], performanceAdjusted = false): ComparisonChartPoint[] {
  return metrics.flatMap((metric) => {
    const val1 = parseComparisonNumber(metric.val1);
    const val2 = parseComparisonNumber(metric.val2);
    if (val1 === null || val2 === null) return [];
    const [score1, score2] = performanceAdjusted
      ? performancePairScores(val1, val2, metric.higherIsBetter !== false)
      : rawPairScores(val1, val2);
    return [{
      id: metric.id,
      label: metric.label,
      val1,
      val2,
      display1: metric.val1,
      display2: metric.val2,
      unit: metric.unit,
      score1,
      score2,
    }];
  });
}

function parsePercentile(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseComparisonNumber(value);
  if (parsed === null) return undefined;
  return clampPercent(parsed);
}

export function buildComparisonPercentilePoints(metrics: ComparisonMetric[] = []): ComparisonPercentilePoint[] {
  return metrics.flatMap((metric) => {
    const percentile1 = parsePercentile(metric.percentile1);
    const percentile2 = parsePercentile(metric.percentile2);
    if (percentile1 === undefined && percentile2 === undefined) return [];
    return [{ id: metric.id, label: metric.label, percentile1, percentile2 }];
  });
}
