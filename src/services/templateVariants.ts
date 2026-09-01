import type { Project, TemplateType, VisualMode } from '../types';

export type TemplateVariantId =
  | 'transfer-minimal'
  | 'transfer-breaking'
  | 'transfer-editorial'
  | 'match-editorial'
  | 'match-poster'
  | 'match-data'
  | 'scouting-editorial'
  | 'scouting-data'
  | 'comparison-split'
  | 'comparison-table';

export interface TemplateVariantOption {
  id: TemplateVariantId;
  label: string;
  labelTr: string;
  description: string;
  descriptionTr: string;
  visualMode: VisualMode;
}

export const TEMPLATE_VARIANTS: Partial<Record<TemplateType, TemplateVariantOption[]>> = {
  'transfer-graphic': [
    { id: 'transfer-minimal', label: 'Minimal', labelTr: 'Minimal', description: 'Reduced chrome with compact deal details.', descriptionTr: 'Daha az çerçeve ve kompakt transfer detayları.', visualMode: 'editorial' },
    { id: 'transfer-breaking', label: 'Breaking', labelTr: 'Son Dakika', description: 'Headline-first composition for breaking transfer news.', descriptionTr: 'Son dakika transferleri için başlık odaklı kompozisyon.', visualMode: 'poster' },
    { id: 'transfer-editorial', label: 'Editorial', labelTr: 'Editoryal', description: 'Balanced editorial composition with full deal context.', descriptionTr: 'Tüm transfer bağlamını koruyan dengeli editoryal kompozisyon.', visualMode: 'editorial' },
  ],
  'match-preview': [
    { id: 'match-editorial', label: 'Editorial', labelTr: 'Editoryal', description: 'Balanced match story with teams, battle and tactical keys.', descriptionTr: 'Takımlar, kritik eşleşme ve taktik anahtarları dengeli gösterir.', visualMode: 'editorial' },
    { id: 'match-poster', label: 'Poster', labelTr: 'Poster', description: 'Crest-first matchday composition with a stronger versus moment.', descriptionTr: 'Armaları ve karşılaşma hissini öne çıkaran maç günü kompozisyonu.', visualMode: 'poster' },
    { id: 'match-data', label: 'Data', labelTr: 'Veri', description: 'Compact analytical layout prioritising form and tactical deciders.', descriptionTr: 'Form ve taktik belirleyicileri öne çıkaran kompakt analitik düzen.', visualMode: 'data' },
  ],
  'scouting-report': [
    { id: 'scouting-editorial', label: 'Editorial', labelTr: 'Editoryal', description: 'Narrative scouting composition with tactical profile first.', descriptionTr: 'Taktik profili önceleyen anlatı odaklı scouting kompozisyonu.', visualMode: 'editorial' },
    { id: 'scouting-data', label: 'Data', labelTr: 'Veri', description: 'Metrics-first scouting composition for denser analysis.', descriptionTr: 'Daha yoğun analiz için istatistikleri öne alan scouting düzeni.', visualMode: 'data' },
  ],
  'player-comparison': [
    { id: 'comparison-split', label: 'Split', labelTr: 'Bölünmüş', description: 'Player-versus-player split composition.', descriptionTr: 'İki oyuncuyu karşı karşıya gösteren bölünmüş kompozisyon.', visualMode: 'editorial' },
    { id: 'comparison-table', label: 'Table / Data', labelTr: 'Tablo / Veri', description: 'Table-led comparison with metrics as the primary hierarchy.', descriptionTr: 'İstatistikleri ana hiyerarşi yapan tablo odaklı karşılaştırma.', visualMode: 'data' },
  ],
};

const DEFAULT_VARIANTS: Partial<Record<TemplateType, TemplateVariantId>> = {
  'transfer-graphic': 'transfer-editorial',
  'match-preview': 'match-editorial',
  'scouting-report': 'scouting-editorial',
  'player-comparison': 'comparison-split',
};

export function getTemplateVariants(templateType: TemplateType): TemplateVariantOption[] {
  return TEMPLATE_VARIANTS[templateType] || [];
}

export function getActiveTemplateVariantId(project: Project): TemplateVariantId | null {
  const options = getTemplateVariants(project.templateType);
  if (!options.length) return null;
  const current = (project.templates[project.templateType]?.layout as any)?.templateVariant as TemplateVariantId | undefined;
  if (current && options.some((option) => option.id === current)) return current;
  return DEFAULT_VARIANTS[project.templateType] || options[0].id;
}

export function getActiveTemplateVariant(project: Project): TemplateVariantOption | null {
  const id = getActiveTemplateVariantId(project);
  return id ? getTemplateVariants(project.templateType).find((option) => option.id === id) || null : null;
}

export function getTemplateVariantVisualMode(project: Project): VisualMode | null {
  return getActiveTemplateVariant(project)?.visualMode || null;
}

export function applyTemplateVariant(project: Project, variantId: TemplateVariantId): Project {
  const options = getTemplateVariants(project.templateType);
  if (!options.some((option) => option.id === variantId)) return project;
  const templateType = project.templateType;
  const activeTemplate = project.templates[templateType];
  if (!activeTemplate) return project;
  if ((activeTemplate.layout as any)?.templateVariant === variantId) return project;

  return {
    ...project,
    updatedAt: Date.now(),
    templates: {
      ...project.templates,
      [templateType]: {
        ...activeTemplate,
        layout: { ...activeTemplate.layout, templateVariant: variantId } as any,
      },
    },
  };
}
