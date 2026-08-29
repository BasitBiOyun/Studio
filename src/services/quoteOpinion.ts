export function quoteBodyFontSize(text: string, isWide = false): string {
  const length = String(text || '').trim().length;

  if (isWide) {
    if (length <= 110) return '38px';
    if (length <= 190) return '34px';
    if (length <= 280) return '30px';
    return '27px';
  }

  if (length <= 110) return '44px';
  if (length <= 190) return '40px';
  if (length <= 280) return '35px';
  return '31px';
}

export function quoteAuthorFontSize(name: string, isWide = false): string {
  const length = String(name || '').trim().length;

  if (isWide) {
    if (length <= 18) return '36px';
    if (length <= 30) return '31px';
    return '27px';
  }

  if (length <= 18) return '44px';
  if (length <= 30) return '38px';
  return '32px';
}

export function quotePunchlineFontSize(text: string, isWide = false): string {
  const length = String(text || '').trim().length;

  if (isWide) {
    if (length <= 70) return '18px';
    if (length <= 120) return '16px';
    return '14px';
  }

  if (length <= 70) return '22px';
  if (length <= 120) return '19px';
  return '17px';
}

export function quoteHeaderContext(topicTag?: string, sourceDate?: string) {
  return {
    topicTag: String(topicTag || '').trim(),
    sourceDate: String(sourceDate || '').trim(),
  };
}
