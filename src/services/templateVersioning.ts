import { DEFAULT_PROJECT } from '../constants/presets';
import type { Project, TemplateState, TemplateType } from '../types';
import { getTemplatePackVisualSlots } from './templatePackSchema';

export const CURRENT_PROJECT_SCHEMA_VERSION = 2;
export const CURRENT_TEMPLATE_STATE_VERSION = 2;

export interface TemplateVersionMetadata {
  projectSchemaVersion: number;
  templateVersions: Partial<Record<TemplateType, number>>;
  migrationWarnings?: string[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const TEMPLATE_TYPES = Object.keys(DEFAULT_PROJECT.templates) as TemplateType[];

export const KNOWN_GOOD_TEMPLATE_DEFAULTS: Record<TemplateType, Record<number, TemplateState>> = Object.fromEntries(
  TEMPLATE_TYPES.map((type) => [type, { [CURRENT_TEMPLATE_STATE_VERSION]: clone(DEFAULT_PROJECT.templates[type]) }]),
) as Record<TemplateType, Record<number, TemplateState>>;

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSemanticMultiLogoTemplate(type: TemplateType): boolean {
  return Object.keys(getTemplatePackVisualSlots(type)).length > 1;
}

function hasAmbiguousLegacyGenericLogo(rawTemplate: any, type: TemplateType): boolean {
  if (!isPlainObject(rawTemplate) || !isSemanticMultiLogoTemplate(type)) return false;
  const visuals = rawTemplate.visuals;
  if (!isPlainObject(visuals)) return false;

  const genericFields = [visuals.logo, visuals.logoSrc, visuals.clubLogo, visuals.teamLogo, visuals.genericLogo]
    .filter((value) => typeof value === 'string' && value.length > 0);
  if (genericFields.length > 0) return true;

  const logos = visuals.logos;
  return Array.isArray(logos) && logos.length === 1 && Boolean(logos[0]?.src);
}

function sanitizeLegacyTemplate(rawTemplate: any, type: TemplateType, warnings: string[]): any {
  if (!isPlainObject(rawTemplate)) return rawTemplate;
  const next = clone(rawTemplate);
  if (!hasAmbiguousLegacyGenericLogo(rawTemplate, type)) return next;

  next.visuals = isPlainObject(next.visuals) ? next.visuals : {};
  delete next.visuals.logo;
  delete next.visuals.logoSrc;
  delete next.visuals.clubLogo;
  delete next.visuals.teamLogo;
  delete next.visuals.genericLogo;

  if (Array.isArray(next.visuals.logos) && next.visuals.logos.length === 1) {
    delete next.visuals.logos;
  }

  warnings.push(`${type}: ambiguous legacy generic logo was not assigned to a semantic slot.`);
  return next;
}

export function prepareProjectForMigration(input: any): any {
  if (!isPlainObject(input)) return input;
  const next = clone(input);
  const warnings: string[] = Array.isArray(next.migrationWarnings) ? [...next.migrationWarnings] : [];

  if (isPlainObject(next.templates)) {
    for (const type of TEMPLATE_TYPES) {
      if (next.templates[type] !== undefined) {
        next.templates[type] = sanitizeLegacyTemplate(next.templates[type], type, warnings);
      }
    }
  }

  next.projectSchemaVersion = CURRENT_PROJECT_SCHEMA_VERSION;
  next.templateVersions = isPlainObject(next.templateVersions) ? { ...next.templateVersions } : {};
  for (const type of TEMPLATE_TYPES) {
    next.templateVersions[type] = CURRENT_TEMPLATE_STATE_VERSION;
  }
  if (warnings.length) next.migrationWarnings = Array.from(new Set(warnings));
  return next;
}

export function stampCurrentTemplateVersions(project: Project): Project {
  const next = clone(project) as Project & TemplateVersionMetadata;
  next.projectSchemaVersion = CURRENT_PROJECT_SCHEMA_VERSION;
  next.templateVersions = { ...(next.templateVersions || {}) };
  for (const type of TEMPLATE_TYPES) next.templateVersions[type] = CURRENT_TEMPLATE_STATE_VERSION;
  return next;
}

export function recoverTemplateToCurrentDefault(project: Project, templateType: TemplateType = project.templateType): Project {
  const next = stampCurrentTemplateVersions(project) as Project & TemplateVersionMetadata;
  next.templates = {
    ...next.templates,
    [templateType]: clone(KNOWN_GOOD_TEMPLATE_DEFAULTS[templateType][CURRENT_TEMPLATE_STATE_VERSION]),
  };
  next.templateVersions = { ...next.templateVersions, [templateType]: CURRENT_TEMPLATE_STATE_VERSION };
  next.updatedAt = Date.now();
  return next;
}

export function getTemplateVersionMetadata(project: Project): TemplateVersionMetadata {
  const source = project as Project & Partial<TemplateVersionMetadata>;
  return {
    projectSchemaVersion: source.projectSchemaVersion || CURRENT_PROJECT_SCHEMA_VERSION,
    templateVersions: { ...(source.templateVersions || {}) },
    migrationWarnings: source.migrationWarnings ? [...source.migrationWarnings] : undefined,
  };
}
