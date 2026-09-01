export type TemplateTypographyRole = 'headline' | 'subtitle' | 'body' | 'verdict' | 'stat';

export const TEMPLATE_TYPOGRAPHY_MIN_SCALE = 0.75;
export const TEMPLATE_TYPOGRAPHY_MAX_SCALE = 1.25;

export const DEFAULT_TEMPLATE_TYPOGRAPHY: Record<TemplateTypographyRole, number> = {
  headline: 1,
  subtitle: 1,
  body: 1,
  verdict: 1,
  stat: 1,
};

export function templateTypographyScale(layout: any, role: TemplateTypographyRole): number {
  const raw = Number(layout?.typography?.[role] ?? DEFAULT_TEMPLATE_TYPOGRAPHY[role]);
  if (!Number.isFinite(raw)) return DEFAULT_TEMPLATE_TYPOGRAPHY[role];
  return Math.max(TEMPLATE_TYPOGRAPHY_MIN_SCALE, Math.min(TEMPLATE_TYPOGRAPHY_MAX_SCALE, raw));
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
