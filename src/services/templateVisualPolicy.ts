import { TemplateType } from '../types';

export interface TemplateVisualPolicy {
  primaryImageLabel?: string;
  secondaryImageLabel?: string;
  allowPrimaryImage: boolean;
  allowSecondaryImage: boolean;
  renderPrimaryAsGlobalLayer: boolean;
  renderSecondaryAsGlobalLayer: boolean;
  backgroundLogoIndex?: number;
}

const POLICY: Record<TemplateType, TemplateVisualPolicy> = {
  'scouting-report': {
    primaryImageLabel: 'Player Photo',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'player-comparison': {
    primaryImageLabel: 'Player 1 Photo',
    secondaryImageLabel: 'Player 2 Photo',
    allowPrimaryImage: true,
    allowSecondaryImage: true,
    renderPrimaryAsGlobalLayer: false,
    renderSecondaryAsGlobalLayer: false,
  },
  'transfer-graphic': {
    primaryImageLabel: 'Player Photo',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'match-preview': {
    primaryImageLabel: 'Optional Match Subject',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'match-analysis': {
    primaryImageLabel: 'Optional Match Subject',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'tactical-analysis': {
    primaryImageLabel: 'Optional Subject Image',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'stat-highlight': {
    primaryImageLabel: 'Optional Subject Image',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'ranking-top-list': {
    primaryImageLabel: 'Optional Highlight Image',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'quote-opinion': {
    primaryImageLabel: 'Optional Portrait',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'thread-cover': {
    primaryImageLabel: 'Optional Cover Subject',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'match-result': {
    primaryImageLabel: 'Optional Match Subject',
    allowPrimaryImage: true,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: true,
    renderSecondaryAsGlobalLayer: false,
  },
  'team-profile': {
    allowPrimaryImage: false,
    allowSecondaryImage: false,
    renderPrimaryAsGlobalLayer: false,
    renderSecondaryAsGlobalLayer: false,
    backgroundLogoIndex: 0,
  },
};

const LEGACY_PLAYER_PLACEHOLDERS = new Set(['/initial-player.png']);
const LEGACY_LOGO_PLACEHOLDERS = new Set(['/gent-logo.svg']);

export function getTemplateVisualPolicy(templateType: TemplateType): TemplateVisualPolicy {
  return POLICY[templateType] || POLICY['scouting-report'];
}

export function usablePlayerImageSrc(src?: string | null): string {
  const value = String(src || '').trim();
  if (!value || LEGACY_PLAYER_PLACEHOLDERS.has(value)) return '';
  return value;
}

export function usableLogoSrc(src?: string | null): string {
  const value = String(src || '').trim();
  if (!value || LEGACY_LOGO_PLACEHOLDERS.has(value)) return '';
  return value;
}
