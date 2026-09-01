import { TacticalAnalysisData } from '../types';
import { fitTextFontSize } from './smartTextFit';

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
  return fitTextFontSize({
    text: topic,
    preferredPx: isWide ? 76 : 96,
    minPx: isWide ? 42 : 54,
    maxLines: 2,
    charsPerLineAtPreferred: 10,
    lineHeight: 0.94,
    containerHeightPx: isWide ? 155 : 195,
  });
}
