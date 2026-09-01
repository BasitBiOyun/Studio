import { Project, TemplateType } from '../types';
import type { AssetKind, AssetLibraryRecord } from './db';
import { getTemplateVisualPolicy } from './templateVisualPolicy';

export type AssetTargetKey = 'primary-image' | 'secondary-image' | `logo-${number}`;

export interface AssetSemanticTarget {
  key: AssetTargetKey;
  label: string;
}

interface LogoTargetPolicy {
  club: Array<{ index: number; label: string }>;
  competition: Array<{ index: number; label: string }>;
}

export const ASSET_LOGO_TARGETS: Record<TemplateType, LogoTargetPolicy> = {
  'scouting-report': {
    club: [{ index: 0, label: 'Player Club Logo' }],
    competition: [{ index: 1, label: 'Competition / League Logo' }],
  },
  'player-comparison': {
    club: [
      { index: 0, label: 'Player 1 Club Logo' },
      { index: 1, label: 'Player 2 Club Logo' },
    ],
    competition: [{ index: 2, label: 'Competition Logo' }],
  },
  'transfer-graphic': {
    club: [
      { index: 0, label: 'From Club Logo' },
      { index: 1, label: 'To Club Logo' },
    ],
    competition: [{ index: 2, label: 'Competition Logo' }],
  },
  'match-preview': {
    club: [
      { index: 0, label: 'Team 1 Logo' },
      { index: 1, label: 'Team 2 Logo' },
    ],
    competition: [{ index: 2, label: 'Competition Logo' }],
  },
  'match-analysis': {
    club: [
      { index: 0, label: 'Team 1 Logo' },
      { index: 1, label: 'Team 2 Logo' },
    ],
    competition: [{ index: 2, label: 'Competition Logo' }],
  },
  'tactical-analysis': {
    club: [
      { index: 0, label: 'Team / Club Logo' },
      { index: 1, label: 'Opponent / Secondary Logo' },
    ],
    competition: [{ index: 2, label: 'Competition Logo' }],
  },
  'stat-highlight': {
    club: [{ index: 0, label: 'Player / Club Logo' }],
    competition: [{ index: 1, label: 'Competition Logo' }],
  },
  'ranking-top-list': {
    club: [{ index: 1, label: 'Highlighted Club Logo' }],
    competition: [{ index: 0, label: 'Competition Logo' }],
  },
  'quote-opinion': {
    club: [{ index: 0, label: 'Author Club Logo' }],
    competition: [{ index: 1, label: 'Source / Competition Logo' }],
  },
  'thread-cover': {
    club: [{ index: 0, label: 'Topic / Club Logo' }],
    competition: [{ index: 1, label: 'Competition Logo' }],
  },
  'match-result': {
    club: [
      { index: 0, label: 'Team 1 Logo' },
      { index: 1, label: 'Team 2 Logo' },
    ],
    competition: [{ index: 2, label: 'Competition Logo' }],
  },
  'team-profile': {
    club: [{ index: 0, label: 'Team Logo / Background Crest' }],
    competition: [{ index: 1, label: 'League / Competition Logo' }],
  },
};

function imageTargets(project: Project): AssetSemanticTarget[] {
  const policy = getTemplateVisualPolicy(project.templateType);
  const result: AssetSemanticTarget[] = [];
  if (policy.allowPrimaryImage) {
    result.push({ key: 'primary-image', label: policy.primaryImageLabel || 'Primary Image' });
  }
  if (policy.allowSecondaryImage) {
    result.push({ key: 'secondary-image', label: policy.secondaryImageLabel || 'Secondary Image' });
  }
  return result;
}

export function getAssetTargets(project: Project, kind: AssetKind): AssetSemanticTarget[] {
  if (kind === 'player-cutout' || kind === 'custom-image') return imageTargets(project);

  const policy = ASSET_LOGO_TARGETS[project.templateType];
  const entries = kind === 'competition-logo' ? policy.competition : policy.club;
  const activeTemplate = project.templates[project.templateType];

  return entries
    .filter(({ index }) => Boolean(activeTemplate?.visuals?.logos?.[index]))
    .map(({ index, label }) => ({ key: `logo-${index}` as AssetTargetKey, label }));
}

export function applyAssetToProject(
  project: Project,
  asset: Pick<AssetLibraryRecord, 'kind' | 'dataUrl'>,
  targetKey: AssetTargetKey,
): Project {
  const allowed = getAssetTargets(project, asset.kind).some((target) => target.key === targetKey);
  if (!allowed) return project;

  const templateType = project.templateType;
  const activeTemplate = project.templates[templateType];
  if (!activeTemplate) return project;

  if (targetKey === 'primary-image' || targetKey === 'secondary-image') {
    const visuals = {
      ...activeTemplate.visuals,
      ...(targetKey === 'primary-image'
        ? { playerImageSrc: asset.dataUrl }
        : { secondaryPlayerImageSrc: asset.dataUrl }),
    };

    return {
      ...project,
      updatedAt: Date.now(),
      templates: {
        ...project.templates,
        [templateType]: { ...activeTemplate, visuals },
      },
    };
  }

  const logoIndex = Number(targetKey.replace('logo-', ''));
  if (!Number.isInteger(logoIndex) || !activeTemplate.visuals.logos[logoIndex]) return project;

  const logos = activeTemplate.visuals.logos.map((logo, index) =>
    index === logoIndex ? { ...logo, src: asset.dataUrl, visible: true } : logo,
  );

  return {
    ...project,
    updatedAt: Date.now(),
    templates: {
      ...project.templates,
      [templateType]: {
        ...activeTemplate,
        visuals: { ...activeTemplate.visuals, logos },
      },
    },
  };
}
