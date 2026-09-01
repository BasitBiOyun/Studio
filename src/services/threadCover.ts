import { fitTextFontSize } from './smartTextFit';

export const MAX_THREAD_TOPICS = 3;

export function visibleThreadTopics(topics: string[] = []): string[] {
  return topics
    .map((topic) => String(topic || '').trim())
    .filter(Boolean)
    .slice(0, MAX_THREAD_TOPICS);
}

export function threadHeadlineFontSize(text: string, isWide = false): string {
  return fitTextFontSize({
    text,
    preferredPx: isWide ? 82 : 120,
    minPx: isWide ? 52 : 76,
    maxLines: isWide ? 2 : 3,
    charsPerLineAtPreferred: isWide ? 20 : 18,
    lineHeight: 0.96,
  });
}

export function threadSubtitleFontSize(text: string, isWide = false): string {
  return fitTextFontSize({
    text,
    preferredPx: isWide ? 27 : 34,
    minPx: isWide ? 20 : 25,
    maxLines: 3,
    charsPerLineAtPreferred: isWide ? 46 : 42,
    lineHeight: 1.08,
  });
}

export function threadTopicFontSize(text: string, isWide = false): string {
  return fitTextFontSize({
    text,
    preferredPx: isWide ? 17 : 19,
    minPx: isWide ? 15 : 17,
    maxLines: 2,
    charsPerLineAtPreferred: isWide ? 26 : 28,
    lineHeight: 1.08,
  });
}

export function threadHeaderContext(badge?: string, authorHandle?: string) {
  return {
    badge: String(badge || '').trim(),
    authorHandle: String(authorHandle || '').trim(),
  };
}
