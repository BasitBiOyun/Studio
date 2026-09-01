export type TemplateTypographyRole = 'headline' | 'subtitle' | 'body' | 'stat';

const TYPOGRAPHY_MIN_SCALE = 0.75;
const TYPOGRAPHY_MAX_SCALE = 1.25;

export function templateTypographyScale(layout: any, role: TemplateTypographyRole): number {
  const raw = Number(layout?.typography?.[role] ?? 1);
  if (!Number.isFinite(raw)) return 1;
  return Math.max(TYPOGRAPHY_MIN_SCALE, Math.min(TYPOGRAPHY_MAX_SCALE, raw));
}

export function scaledTemplateFontSize(
  value: string | number,
  layout: any,
  role: TemplateTypographyRole,
  minPx = 10,
  maxPx = 220,
): string {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return String(value);
  const scaled = parsed * templateTypographyScale(layout, role);
  return `${Math.max(minPx, Math.min(maxPx, scaled)).toFixed(1)}px`;
}
