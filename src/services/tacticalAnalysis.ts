import { TacticalAnalysisData } from '../types';

export const MAX_TACTICAL_PRINCIPLES = 3;
export const MAX_TACTICAL_TRIGGERS = 3;

export function visibleTacticalPrinciples(
  principles: TacticalAnalysisData['corePrinciples'] = [],
): TacticalAnalysisData['corePrinciples'] {
  return principles
    .map((principle) => ({
      title: String(principle?.title || '').trim(),
      description: String(principle?.description || '').trim(),
    }))
    .filter((principle) => principle.title || principle.description)
    .slice(0, MAX_TACTICAL_PRINCIPLES);
}

export function visibleExecutionTriggers(instructions: string[] = []): string[] {
  return instructions
    .map((instruction) => String(instruction).trim())
    .filter(Boolean)
    .slice(0, MAX_TACTICAL_TRIGGERS);
}

export function tacticalDeepDiveLabel(phase?: string): string {
  const normalizedPhase = String(phase || '').trim().toUpperCase();
  return normalizedPhase
    ? `TACTICAL DEEP DIVE • ${normalizedPhase}`
    : 'TACTICAL DEEP DIVE';
}

export function tacticalTopicFontSize(topic: string, isWide = false): string {
  const length = String(topic || '').trim().length;

  if (isWide) {
    if (length <= 20) return '76px';
    if (length <= 32) return '66px';
    if (length <= 46) return '56px';
    if (length <= 60) return '48px';
    return '42px';
  }

  if (length <= 20) return '96px';
  if (length <= 32) return '84px';
  if (length <= 46) return '72px';
  if (length <= 60) return '62px';
  return '54px';
}
