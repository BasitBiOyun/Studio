import type { ImageTransform, Project, TemplateType } from '../types';

export type AutoLayoutPresetId =
  | 'player-left'
  | 'player-right'
  | 'centered-subject'
  | 'no-subject-full-content'
  | 'crest-background'
  | 'two-player-split';

export interface AutoLayoutPresetOption {
  id: AutoLayoutPresetId;
  label: string;
  labelTr: string;
  description: string;
  descriptionTr: string;
}

const OPTIONS: Record<AutoLayoutPresetId, AutoLayoutPresetOption> = {
  'player-left': {
    id: 'player-left',
    label: 'Player Left',
    labelTr: 'Oyuncu Solda',
    description: 'Moves the primary subject left while keeping content inside the safe canvas area.',
    descriptionTr: 'Ana oyuncuyu sola taşır, içeriği güvenli canvas alanında tutar.',
  },
  'player-right': {
    id: 'player-right',
    label: 'Player Right',
    labelTr: 'Oyuncu Sağda',
    description: 'Keeps the primary subject on the right with a content-first reading path.',
    descriptionTr: 'Ana oyuncuyu sağda tutar ve içerik odaklı okuma düzenini korur.',
  },
  'centered-subject': {
    id: 'centered-subject',
    label: 'Centered Subject',
    labelTr: 'Ortalanmış Özne',
    description: 'Centers the subject as a balanced background focal point.',
    descriptionTr: 'Özneyi dengeli bir arka plan odağı olarak ortalar.',
  },
  'no-subject-full-content': {
    id: 'no-subject-full-content',
    label: 'No Subject / Full Content',
    labelTr: 'Özne Yok / Tam İçerik',
    description: 'Hides the optional subject layer and gives content the full safe width where supported.',
    descriptionTr: 'İsteğe bağlı özne katmanını gizler ve desteklenen şablonlarda içeriğe tam güvenli genişliği verir.',
  },
  'crest-background': {
    id: 'crest-background',
    label: 'Crest Background',
    labelTr: 'Arka Plan Arması',
    description: 'Uses the primary semantic crest as a restrained background element without changing its identity.',
    descriptionTr: 'Birincil semantic armayı kimliğini değiştirmeden kontrollü bir arka plan öğesi olarak kullanır.',
  },
  'two-player-split': {
    id: 'two-player-split',
    label: 'Two-Player Split',
    labelTr: 'İki Oyuncu Bölünmüş',
    description: 'Maintains a safe left/right two-player composition for comparison graphics.',
    descriptionTr: 'Karşılaştırma görselleri için güvenli sol/sağ iki oyunculu kompozisyonu korur.',
  },
};

const VALID_PRESETS: Record<TemplateType, AutoLayoutPresetId[]> = {
  'scouting-report': ['player-right', 'player-left', 'no-subject-full-content'],
  'player-comparison': ['two-player-split', 'no-subject-full-content'],
  'transfer-graphic': ['player-right', 'player-left', 'no-subject-full-content'],
  'match-preview': ['player-right', 'centered-subject', 'no-subject-full-content', 'crest-background'],
  'match-analysis': ['player-right', 'centered-subject', 'no-subject-full-content', 'crest-background'],
  'tactical-analysis': ['player-right', 'player-left', 'centered-subject', 'no-subject-full-content'],
  'stat-highlight': ['player-right', 'player-left', 'centered-subject', 'no-subject-full-content'],
  'ranking-top-list': ['player-right', 'player-left', 'centered-subject', 'no-subject-full-content'],
  'quote-opinion': ['player-left', 'player-right', 'centered-subject', 'no-subject-full-content'],
  'thread-cover': ['player-right', 'player-left', 'centered-subject', 'no-subject-full-content'],
  'match-result': ['player-right', 'centered-subject', 'no-subject-full-content', 'crest-background'],
  'team-profile': ['crest-background', 'no-subject-full-content'],
};

const DEFAULT_PRESET: Record<TemplateType, AutoLayoutPresetId> = {
  'scouting-report': 'player-right',
  'player-comparison': 'two-player-split',
  'transfer-graphic': 'player-right',
  'match-preview': 'player-right',
  'match-analysis': 'player-right',
  'tactical-analysis': 'player-right',
  'stat-highlight': 'player-right',
  'ranking-top-list': 'player-right',
  'quote-opinion': 'player-right',
  'thread-cover': 'player-right',
  'match-result': 'player-right',
  'team-profile': 'crest-background',
};

const PRIMARY_PLACEMENT: Partial<Record<AutoLayoutPresetId, Pick<ImageTransform, 'x' | 'y' | 'scale'>>> = {
  'player-left': { x: -30, y: 2, scale: 0.96 },
  'player-right': { x: 28, y: 2, scale: 1.02 },
  'centered-subject': { x: 0, y: 2, scale: 0.94 },
  'two-player-split': { x: -24, y: 4, scale: 1 },
};

const SECONDARY_SPLIT: Pick<ImageTransform, 'x' | 'y' | 'scale'> = { x: 24, y: 4, scale: 1 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function applyPlacement(transform: ImageTransform, patch?: Pick<ImageTransform, 'x' | 'y' | 'scale'>): ImageTransform {
  if (!patch) return { ...transform };
  return {
    ...transform,
    x: clamp(patch.x, -40, 40),
    y: clamp(patch.y, -20, 20),
    scale: clamp(patch.scale, 0.7, 1.2),
  };
}

function alignmentForPreset(id: AutoLayoutPresetId): 'left' | 'center' | 'split' {
  if (id === 'player-left') return 'split';
  if (id === 'centered-subject' || id === 'crest-background') return 'center';
  if (id === 'two-player-split') return 'split';
  return 'left';
}

export function getAutoLayoutPresets(templateType: TemplateType): AutoLayoutPresetOption[] {
  return VALID_PRESETS[templateType].map((id) => OPTIONS[id]);
}

export function getDefaultAutoLayoutPresetId(templateType: TemplateType): AutoLayoutPresetId {
  return DEFAULT_PRESET[templateType];
}

export function getActiveAutoLayoutPresetId(project: Project): AutoLayoutPresetId {
  const template = project.templates[project.templateType];
  const current = (template?.layout as any)?.autoLayoutPreset as AutoLayoutPresetId | undefined;
  if (current && VALID_PRESETS[project.templateType].includes(current)) return current;
  return getDefaultAutoLayoutPresetId(project.templateType);
}

export function applyAutoLayoutPreset(project: Project, presetId: AutoLayoutPresetId): Project {
  const templateType = project.templateType;
  if (!VALID_PRESETS[templateType].includes(presetId)) return project;
  const activeTemplate = project.templates[templateType];
  if (!activeTemplate) return project;

  const primaryPlacement = PRIMARY_PLACEMENT[presetId];
  const nextPrimary = applyPlacement(activeTemplate.visuals.imageTransform, primaryPlacement);
  const nextSecondary = activeTemplate.visuals.secondaryImageTransform
    ? applyPlacement(
        activeTemplate.visuals.secondaryImageTransform,
        presetId === 'two-player-split' ? SECONDARY_SPLIT : undefined,
      )
    : activeTemplate.visuals.secondaryImageTransform;

  return {
    ...project,
    updatedAt: Date.now(),
    templates: {
      ...project.templates,
      [templateType]: {
        ...activeTemplate,
        layout: {
          ...activeTemplate.layout,
          autoLayoutPreset: presetId,
          headerAlignment: alignmentForPreset(presetId),
        } as any,
        visuals: {
          ...activeTemplate.visuals,
          imageTransform: nextPrimary,
          secondaryImageTransform: nextSecondary,
        },
      },
    },
  };
}

export function resetAutoLayout(project: Project): Project {
  return applyAutoLayoutPreset(project, getDefaultAutoLayoutPresetId(project.templateType));
}

export function isSubjectHiddenByAutoLayout(project: Project): boolean {
  const preset = getActiveAutoLayoutPresetId(project);
  return preset === 'no-subject-full-content' || preset === 'crest-background';
}
