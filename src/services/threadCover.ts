export const MAX_THREAD_TOPICS = 3;

export function visibleThreadTopics(topics: string[] = []): string[] {
  return topics
    .map((topic) => String(topic || '').trim())
    .filter(Boolean)
    .slice(0, MAX_THREAD_TOPICS);
}

export function threadHeadlineFontSize(text: string, isWide = false): string {
  const length = String(text || '').trim().length;

  if (isWide) {
    if (length <= 28) return '82px';
    if (length <= 48) return '70px';
    if (length <= 72) return '60px';
    return '52px';
  }

  if (length <= 28) return '120px';
  if (length <= 48) return '104px';
  if (length <= 72) return '88px';
  return '76px';
}

export function threadSubtitleFontSize(text: string, isWide = false): string {
  const length = String(text || '').trim().length;

  if (isWide) {
    if (length <= 80) return '27px';
    if (length <= 150) return '23px';
    return '20px';
  }

  if (length <= 80) return '34px';
  if (length <= 150) return '29px';
  return '25px';
}

export function threadTopicFontSize(text: string, isWide = false): string {
  const length = String(text || '').trim().length;
  if (isWide) {
    if (length <= 54) return '17px';
    return '15px';
  }
  if (length <= 54) return '19px';
  return '17px';
}

export function threadHeaderContext(badge?: string, authorHandle?: string) {
  return {
    badge: String(badge || '').trim(),
    authorHandle: String(authorHandle || '').trim(),
  };
}
