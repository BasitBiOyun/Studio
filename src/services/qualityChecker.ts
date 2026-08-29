import { Project, QualityIssue, StatItem, TemplateType } from '../types';

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

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

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

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

export function getTemplatePrimaryText(project: Project): string {
  const template = project.templates[project.templateType] || project.templates['scouting-report'];
  const content = template.content;

  switch (project.templateType) {
    case 'scouting-report':
      return clean(project.sharedData.player?.name);
    case 'player-comparison':
      return [content.comparisonData?.player1?.name, content.comparisonData?.player2?.name]
        .map(clean)
        .filter(Boolean)
        .join(' vs ');
    case 'transfer-graphic':
      return clean(content.transferData?.headline || content.transferData?.player?.name);
    case 'match-preview':
      return [content.matchPreviewData?.team1?.name, content.matchPreviewData?.team2?.name]
        .map(clean)
        .filter(Boolean)
        .join(' vs ');
    case 'match-analysis':
      return [content.matchAnalysisData?.scoreline?.team1, content.matchAnalysisData?.scoreline?.team2]
        .map(clean)
        .filter(Boolean)
        .join(' vs ');
    case 'tactical-analysis':
      return clean(content.tacticalData?.topic);
    case 'stat-highlight':
      return clean((content.statHighlightData as any)?.subject || content.statHighlightData?.heroStatLabel);
    case 'ranking-top-list':
      return clean(content.rankingData?.categoryTitle);
    case 'quote-opinion':
      return clean(content.quoteData?.quote || content.quoteData?.authorName);
    case 'thread-cover':
      return clean(content.threadCoverData?.headline);
    case 'match-result':
      return [content.matchResultData?.team1, content.matchResultData?.team2]
        .map(clean)
        .filter(Boolean)
        .join(' vs ');
    case 'team-profile':
      return clean(content.teamProfileData?.teamName);
    default:
      return clean(project.name);
  }
}

function getMetrics(project: Project): StatItem[] {
  const content = (project.templates[project.templateType] || project.templates['scouting-report']).content;
  if (project.templateType === 'scouting-report') return content.stats || [];
  if (project.templateType === 'stat-highlight') return content.statHighlightData?.contextMetrics || [];
  if (project.templateType === 'team-profile') return content.teamProfileData?.metrics || [];
  return [];
}

function needsPrimaryPlayerVisual(templateType: TemplateType): boolean {
  return ['scouting-report', 'player-comparison', 'transfer-graphic'].includes(templateType);
}

function addPairCompletenessIssues(project: Project, issues: QualityIssue[]) {
  const content = (project.templates[project.templateType] || project.templates['scouting-report']).content;

  if (project.templateType === 'player-comparison') {
    if (!clean(content.comparisonData?.player1?.name) || !clean(content.comparisonData?.player2?.name)) {
      issues.push({
        id: 'comparison-player-missing',
        type: 'error',
        title: 'Comparison Needs Two Players',
        description: 'Both Player A and Player B need a name before export.',
        field: 'comparisonData',
      });
    }
  }

  if (project.templateType === 'match-preview') {
    if (!clean(content.matchPreviewData?.team1?.name) || !clean(content.matchPreviewData?.team2?.name)) {
      issues.push({
        id: 'preview-team-missing',
        type: 'error',
        title: 'Match Preview Needs Two Teams',
        description: 'Both teams need a name before export.',
        field: 'matchPreviewData',
      });
    }
  }

  if (project.templateType === 'match-analysis') {
    if (!clean(content.matchAnalysisData?.scoreline?.team1) || !clean(content.matchAnalysisData?.scoreline?.team2)) {
      issues.push({
        id: 'analysis-team-missing',
        type: 'error',
        title: 'Match Analysis Needs Two Teams',
        description: 'Both scoreline teams need a name before export.',
        field: 'matchAnalysisData.scoreline',
      });
    }
  }

  if (project.templateType === 'match-result') {
    if (!clean(content.matchResultData?.team1) || !clean(content.matchResultData?.team2)) {
      issues.push({
        id: 'result-team-missing',
        type: 'error',
        title: 'Match Result Needs Two Teams',
        description: 'Both teams need a name before export.',
        field: 'matchResultData',
      });
    }
  }
}

export function runDesignQualityCheck(project: Project): QualityIssue[] {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const issues: QualityIssue[] = [];
  const primaryText = getTemplatePrimaryText(project);

  if (!primaryText) {
    issues.push({
      id: 'missing-primary-content',
      type: 'error',
      title: 'Missing Primary Content',
      description: 'This template is missing the main name, headline, topic, quote, or matchup it needs to render meaningfully.',
      field: 'content',
    });
  } else if (project.templateType !== 'quote-opinion' && primaryText.length > 90) {
    issues.push({
      id: 'long-primary-content',
      type: 'warning',
      title: 'Very Long Main Headline',
      description: `The primary text is ${primaryText.length} characters. Auto-scaling is active, but a shorter headline will read better in a social feed.`,
      field: 'content',
    });
  }

  addPairCompletenessIssues(project, issues);

  const transform = activeTemplate.visuals.imageTransform;
  if (activeTemplate.visuals.playerImageSrc) {
    if (Math.abs(transform.x) > 120 || Math.abs(transform.y) > 120) {
      issues.push({
        id: 'photo-heavily-offset',
        type: 'warning',
        title: 'Primary Visual Heavily Offset',
        description: 'The primary image is close to the safe movement limit and may be clipped.',
        field: 'imageTransform',
      });
    }
    if (transform.scale < 0.35 || transform.scale > 3.5) {
      issues.push({
        id: 'photo-scale-outside-editor-range',
        type: 'warning',
        title: 'Primary Visual Scale Is Extreme',
        description: 'The image scale is outside the supported direct-edit range of 0.35× to 3.5×.',
        field: 'imageTransform.scale',
      });
    }
  } else if (needsPrimaryPlayerVisual(project.templateType)) {
    issues.push({
      id: 'missing-primary-visual',
      type: 'warning',
      title: 'No Primary Player Visual',
      description: 'This player-focused template is designed to work best with a primary player cutout or action image.',
      field: 'playerImageSrc',
    });
  }

  if (
    project.templateType === 'player-comparison' &&
    !activeTemplate.visuals.secondaryPlayerImageSrc
  ) {
    issues.push({
      id: 'missing-secondary-visual',
      type: 'tip',
      title: 'No Secondary Player Visual',
      description: 'Player Comparison can render without it, but a second cutout gives both players equal visual weight.',
      field: 'secondaryPlayerImageSrc',
    });
  }

  const contrastAccent = getContrastRatio(activeTemplate.theme.primaryAccent, activeTemplate.theme.bg1);
  if (contrastAccent < 3.0) {
    issues.push({
      id: 'low-contrast-accent',
      type: 'warning',
      title: 'Low Primary Accent Contrast',
      description: `Accent-to-background contrast is ${contrastAccent.toFixed(1)}:1. Some labels may be difficult to read on smaller screens.`,
      field: 'theme.primaryAccent',
    });
  }

  getMetrics(project).forEach((stat, idx) => {
    if (!clean(stat.label) || !clean(stat.value)) {
      issues.push({
        id: `empty-stat-${idx}`,
        type: 'warning',
        title: `Incomplete Metric #${idx + 1}`,
        description: 'A visible metric is missing its label or value.',
        field: `metrics.${idx}`,
      });
    }
    if (clean(stat.label).length > 34) {
      issues.push({
        id: `long-stat-label-${idx}`,
        type: 'tip',
        title: `Long Metric Label #${idx + 1}`,
        description: `“${clean(stat.label)}” is long. A shorter label usually reads better on exported graphics.`,
        field: `metrics.${idx}.label`,
      });
    }
  });

  return issues;
}

export function runDesignQualityAudit(project: Project): QualityAuditResult {
  const sourceIssues = runDesignQualityCheck(project);
  let score = 100;

  const issues: QualityAuditResult['issues'] = sourceIssues.map((issue) => {
    if (issue.type === 'error') score -= 25;
    if (issue.type === 'warning') score -= 8;

    return {
      id: issue.id,
      severity: issue.type === 'tip' ? 'info' : issue.type,
      title: issue.title,
      description: issue.description,
      recommendation:
        issue.type === 'error'
          ? 'Complete the missing required content in Data & Text before export.'
          : issue.type === 'warning'
          ? 'Review this item in the editor and confirm the exported preview still reads clearly.'
          : undefined,
    };
  });

  const finalScore = Math.max(0, score);
  return {
    score: finalScore,
    passed: finalScore >= 75 && !issues.some((issue) => issue.severity === 'error'),
    issues,
  };
}
