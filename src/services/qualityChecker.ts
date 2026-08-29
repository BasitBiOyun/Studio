import { Project, QualityIssue } from '../types';

export interface QualityAuditResult {
  score: number;
  passed: boolean;
  issues: {
    id: string;
    severity: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    recommendation?: string;
  }[];
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Compute relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Compute contrast ratio
function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 5;
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function runDesignQualityCheck(project: Project): QualityIssue[] {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const issues: QualityIssue[] = [];

  // 1. Player Name / Title Check
  const nameLen = project.sharedData.player?.name?.length || 0;
  if (nameLen === 0) {
    issues.push({
      id: 'missing-name',
      type: 'error',
      title: 'Missing Main Headline / Player Name',
      description: 'The graphic has no player name or main title filled in.',
      field: 'player.name',
    });
  } else if (nameLen > 24) {
    issues.push({
      id: 'long-name',
      type: 'warning',
      title: 'Long Title May Scale Down',
      description: `Title is ${nameLen} characters long. Auto-fit scaling is active, but keeping names concise improves editorial punch.`,
      field: 'player.name',
    });
  }

  // 2. Player Photo Placement & Scale Check
  if (!activeTemplate.visuals.playerImageSrc) {
    issues.push({
      id: 'missing-photo',
      type: 'warning',
      title: 'No Player Photo Loaded',
      description: 'Upload a cutout PNG or action shot to maximize social engagement.',
      field: 'playerImageSrc',
    });
  } else {
    if (Math.abs(activeTemplate.visuals.imageTransform.x) > 85) {
      issues.push({
        id: 'photo-offscreen-x',
        type: 'warning',
        title: 'Player Photo Heavily Offset (X)',
        description: 'The photo horizontal offset is extreme and parts of the subject may be clipped.',
        field: 'imageTransform.x',
      });
    }
    if (activeTemplate.visuals.imageTransform.scale < 0.6) {
      issues.push({
        id: 'photo-small',
        type: 'tip',
        title: 'Small Photo Subject',
        description: 'Photo scale is under 60%. Increasing scale to 1.1–1.3 creates stronger visual impact.',
        field: 'imageTransform.scale',
      });
    }
  }

  // 3. Contrast Check between Text Accent and Background
  const contrastAccent = getContrastRatio(activeTemplate.theme.primaryAccent, activeTemplate.theme.bg1);
  if (contrastAccent < 3.0) {
    issues.push({
      id: 'low-contrast-accent',
      type: 'warning',
      title: 'Low Contrast on Primary Accent',
      description: `The contrast ratio between your accent (${activeTemplate.theme.primaryAccent}) and background is ${contrastAccent.toFixed(1)}:1 (recommended ≥ 4.5:1).`,
      field: 'theme.primaryAccent',
    });
  }

  // 4. Stats Validation
  if (project.templateType === 'scouting-report' || project.templateType === 'stat-highlight') {
    activeTemplate.content.stats.forEach((st, idx) => {
      if (!st.value || st.value.trim() === '') {
        issues.push({
          id: `empty-stat-${idx}`,
          type: 'warning',
          title: `Empty Metric Value #${idx + 1}`,
          description: `Stat "${st.label || 'Metric'}" has no value entered.`,
          field: `stats.${idx}.value`,
        });
      }
      if ((st.label || '').length > 28) {
        issues.push({
          id: `long-stat-label-${idx}`,
          type: 'tip',
          title: `Long Stat Label #${idx + 1}`,
          description: `"${st.label}" is long. Consider shortening to 1-3 words (e.g. "Key Passes /90").`,
          field: `stats.${idx}.label`,
        });
      }
    });
  }

  return issues;
}

export function runDesignQualityAudit(project: Project): QualityAuditResult {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const issues: QualityAuditResult['issues'] = [];
  let score = 100;

  // Title / Name
  const nameLen = project.sharedData.player?.name?.length || 0;
  if (nameLen === 0) {
    score -= 25;
    issues.push({
      id: 'missing-title',
      severity: 'error',
      title: 'Missing Headline / Player Name',
      description: 'The graphic has no headline or player name specified.',
      recommendation: 'Enter a player name or headline in the Data tab.',
    });
  }

  // Contrast check
  const contrast = getContrastRatio(activeTemplate.theme.primaryAccent, activeTemplate.theme.bg1);
  if (contrast < 3.0) {
    score -= 15;
    issues.push({
      id: 'low-contrast',
      severity: 'warning',
      title: 'Low Accent Contrast Ratio',
      description: `Contrast ratio is ${contrast.toFixed(1)}:1. Text might be hard to read on mobile feeds.`,
      recommendation: 'Select a brighter accent color or darker background in Visuals tab.',
    });
  }

  // Cutout Photo check
  if (!activeTemplate.visuals.playerImageSrc) {
    score -= 10;
    issues.push({
      id: 'missing-cutout',
      severity: 'info',
      title: 'No Player Photo Cutout Loaded',
      description: 'Using a transparent PNG cutout provides maximum sports editorial presence.',
      recommendation: 'Upload a cutout PNG under Visuals > Player Cutout.',
    });
  }

  return {
    score: Math.max(0, score),
    passed: score >= 75,
    issues,
  };
}
