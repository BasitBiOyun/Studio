function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char] || char));
}

function initials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  return (parts.map((part) => part[0]).join('') || '?').toLocaleUpperCase('tr-TR').slice(0, 3);
}

export function entityFallbackBadge(name: string): string {
  const label = escapeXml(initials(name));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="116" fill="#111827"/><rect x="18" y="18" width="476" height="476" rx="102" fill="none" stroke="#475569" stroke-width="18"/><text x="256" y="286" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="136" font-weight="800" fill="#f8fafc">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Image reader failed'));
    reader.readAsDataURL(blob);
  });
}

export async function materializeEntityImage(url: string | null | undefined, name: string): Promise<string> {
  const source = String(url || '').trim();
  if (!source) return entityFallbackBadge(name);
  if (source.startsWith('data:') || source.startsWith('blob:')) return source;

  try {
    const response = await fetch(source, {
      mode: 'cors',
      cache: 'force-cache',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) return entityFallbackBadge(name);
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) return entityFallbackBadge(name);
    return await blobToDataUrl(blob);
  } catch {
    return entityFallbackBadge(name);
  }
}
