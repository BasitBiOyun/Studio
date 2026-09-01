import { AdvancedLayoutConfig, Project, ThemeColors } from '../types';

export type BrandPresetId =
  | 'basitbioyun-editorial'
  | 'fenerbahce-analysis'
  | 'transfer-news'
  | 'scouting'
  | 'matchday';

export interface BrandPreset {
  id: BrandPresetId;
  label: string;
  description: string;
  theme: ThemeColors;
  layout: Partial<AdvancedLayoutConfig>;
  footerSocialVisibility: Partial<Record<'x' | 'youtube' | 'tiktok' | 'instagram', boolean>>;
  logoTreatment: {
    opacity: number;
  };
}

const SAFE_LAYOUT_KEYS = new Set<keyof AdvancedLayoutConfig>([
  'spacingScale',
  'borderRadius',
  'fontDisplay',
  'fontBody',
  'headerAlignment',
  'grainEnabled',
  'grainOpacity',
]);

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'basitbioyun-editorial',
    label: 'BasitBiOyun Editorial',
    description: 'Cyan editorial system with balanced spacing and full social footer.',
    theme: {
      name: 'BasitBiOyun Editorial',
      primaryAccent: '#22d3ee',
      secondaryAccent: '#2563eb',
      bg1: '#07111f',
      bg2: '#020408',
      mainText: '#ffffff',
      mutedText: '#94a3b8',
      textAccent: '#ffffff',
      pattern: 'editorial-magazine',
      gradientAngle: 135,
    },
    layout: {
      spacingScale: 'normal',
      borderRadius: 'subtle',
      fontDisplay: "'Barlow Condensed', sans-serif",
      fontBody: "'Plus Jakarta Sans', sans-serif",
      headerAlignment: 'left',
      grainEnabled: true,
      grainOpacity: 10,
    },
    footerSocialVisibility: { x: true, youtube: true, tiktok: true, instagram: true },
    logoTreatment: { opacity: 100 },
  },
  {
    id: 'fenerbahce-analysis',
    label: 'Fenerbahçe Analysis',
    description: 'Navy and yellow analysis system built around match and player graphics.',
    theme: {
      name: 'Fenerbahçe Analysis',
      primaryAccent: '#fde000',
      secondaryAccent: '#123b7a',
      bg1: '#061126',
      bg2: '#01040b',
      mainText: '#ffffff',
      mutedText: '#a8b1c2',
      textAccent: '#07111f',
      pattern: 'stadium-spotlight',
      gradientAngle: 140,
    },
    layout: {
      spacingScale: 'normal',
      borderRadius: 'subtle',
      fontDisplay: "'Barlow Condensed', sans-serif",
      fontBody: "'Plus Jakarta Sans', sans-serif",
      headerAlignment: 'split',
      grainEnabled: true,
      grainOpacity: 12,
    },
    footerSocialVisibility: { x: true, youtube: true, tiktok: true, instagram: true },
    logoTreatment: { opacity: 100 },
  },
  {
    id: 'transfer-news',
    label: 'Transfer News',
    description: 'Fast breaking-news treatment with compact spacing and high contrast.',
    theme: {
      name: 'Transfer News',
      primaryAccent: '#ff4d3d',
      secondaryAccent: '#f59e0b',
      bg1: '#160706',
      bg2: '#030202',
      mainText: '#ffffff',
      mutedText: '#c7b8b5',
      textAccent: '#ffffff',
      pattern: 'diagonal-speed-lines',
      gradientAngle: 128,
    },
    layout: {
      spacingScale: 'compact',
      borderRadius: 'sharp',
      fontDisplay: "'Anton', sans-serif",
      fontBody: "'Inter Tight', sans-serif",
      headerAlignment: 'left',
      grainEnabled: true,
      grainOpacity: 16,
    },
    footerSocialVisibility: { x: true, youtube: false, tiktok: false, instagram: true },
    logoTreatment: { opacity: 98 },
  },
  {
    id: 'scouting',
    label: 'Scouting',
    description: 'Restrained data-led system for reports, comparisons and player evaluation.',
    theme: {
      name: 'Scouting',
      primaryAccent: '#38bdf8',
      secondaryAccent: '#14b8a6',
      bg1: '#071219',
      bg2: '#020708',
      mainText: '#ffffff',
      mutedText: '#9fb2bc',
      textAccent: '#ffffff',
      pattern: 'minimal-data',
      gradientAngle: 145,
    },
    layout: {
      spacingScale: 'normal',
      borderRadius: 'subtle',
      fontDisplay: "'Archivo', sans-serif",
      fontBody: "'Plus Jakarta Sans', sans-serif",
      headerAlignment: 'left',
      grainEnabled: true,
      grainOpacity: 6,
    },
    footerSocialVisibility: { x: true, youtube: true, tiktok: false, instagram: false },
    logoTreatment: { opacity: 94 },
  },
  {
    id: 'matchday',
    label: 'Matchday',
    description: 'Poster-led match identity with centered hierarchy and stronger texture.',
    theme: {
      name: 'Matchday',
      primaryAccent: '#f8fafc',
      secondaryAccent: '#22c55e',
      bg1: '#08110d',
      bg2: '#010302',
      mainText: '#ffffff',
      mutedText: '#a6b2aa',
      textAccent: '#07110b',
      pattern: 'matchday-poster',
      gradientAngle: 135,
    },
    layout: {
      spacingScale: 'compact',
      borderRadius: 'sharp',
      fontDisplay: "'Bebas Neue', sans-serif",
      fontBody: "'Space Grotesk', sans-serif",
      headerAlignment: 'center',
      grainEnabled: true,
      grainOpacity: 18,
    },
    footerSocialVisibility: { x: true, youtube: false, tiktok: false, instagram: true },
    logoTreatment: { opacity: 100 },
  },
];

export function getBrandPreset(id: BrandPresetId): BrandPreset {
  const preset = BRAND_PRESETS.find((item) => item.id === id);
  if (!preset) throw new Error(`Unknown brand preset: ${id}`);
  return preset;
}

export function applySupportedLayoutPatch(
  layout: AdvancedLayoutConfig,
  patch: Record<string, unknown>,
): AdvancedLayoutConfig {
  const next: AdvancedLayoutConfig = { ...layout };
  const target = next as unknown as Record<string, unknown>;

  Object.entries(patch).forEach(([key, value]) => {
    if (SAFE_LAYOUT_KEYS.has(key as keyof AdvancedLayoutConfig)) {
      target[key] = value;
    }
  });

  return next;
}

function applyFooterSocialVisibility(
  project: Project,
  visibility: BrandPreset['footerSocialVisibility'],
): Project['sharedData'] {
  const credits = project.sharedData.credits as Project['sharedData']['credits'] & {
    socials?: Record<string, { visible?: boolean; handle?: string }>;
  };
  const existingSocials = credits.socials || {};
  const nextSocials = { ...existingSocials };

  Object.entries(visibility).forEach(([key, visible]) => {
    const current = existingSocials[key] || {};
    nextSocials[key] = { ...current, visible };
  });

  return {
    ...project.sharedData,
    credits: {
      ...credits,
      socials: nextSocials,
    } as Project['sharedData']['credits'],
  };
}

export function applyBrandPreset(project: Project, presetId: BrandPresetId): Project {
  const preset = getBrandPreset(presetId);
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const nextLayout = applySupportedLayoutPatch(
    activeTemplate.layout,
    preset.layout as Record<string, unknown>,
  );
  const nextLogos = activeTemplate.visuals.logos.map((logo) => ({
    ...logo,
    opacity: preset.logoTreatment.opacity,
  }));

  return {
    ...project,
    updatedAt: Date.now(),
    sharedData: applyFooterSocialVisibility(project, preset.footerSocialVisibility),
    templates: {
      ...project.templates,
      [project.templateType]: {
        ...activeTemplate,
        content: activeTemplate.content,
        theme: { ...preset.theme },
        layout: nextLayout,
        visuals: {
          ...activeTemplate.visuals,
          playerImageSrc: activeTemplate.visuals.playerImageSrc,
          secondaryPlayerImageSrc: activeTemplate.visuals.secondaryPlayerImageSrc,
          logos: nextLogos,
        },
      },
    },
  };
}
