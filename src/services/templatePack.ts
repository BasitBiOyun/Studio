import { Project, TemplateContent, TemplateType } from '../types';
import { applyPlayerPackToProject, parsePlayerPack } from './playerPack';
import { resolveCountryFlag } from './footballLocale';
import { migrateTemplatePackEnvelope } from './dataPackMigrations';
import {
  getTemplatePackDefinition,
  getTemplatePackSchemaVersion,
  getTemplatePackVisualSlots,
  getUnknownTemplatePayloadKeys,
  validateTemplatePackPayload,
} from './templatePackSchema';

const TEMPLATE_CONTENT_KEY: Partial<Record<TemplateType, keyof TemplateContent>> = {
  'player-comparison': 'comparisonData',
  'transfer-graphic': 'transferData',
  'match-preview': 'matchPreviewData',
  'match-analysis': 'matchAnalysisData',
  'tactical-analysis': 'tacticalData',
  'stat-highlight': 'statHighlightData',
  'ranking-top-list': 'rankingData',
  'quote-opinion': 'quoteData',
  'thread-cover': 'threadCoverData',
  'match-result': 'matchResultData',
  'team-profile': 'teamProfileData',
};

const ENVELOPE_KEYS = new Set([
  'schemaVersion', 'templateType', 'type', 'data', 'content', 'sharedData', 'sharedPlayer',
  'metadata', 'context', 'sources', 'generatedAt', 'visuals',
]);

export interface TemplatePackParseResult {
  data: any | null;
  error: string | null;
  warnings: string[];
}

export interface SemanticLogoInstruction {
  logoSrc?: string;
  visible?: boolean;
}

export interface ParsedTemplatePackData {
  envelope: Record<string, any>;
  payload: any;
  visuals: Record<string, SemanticLogoInstruction>;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const isPlainObject = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function deepMerge<T>(base: T, patch: any): T {
  if (Array.isArray(patch)) return [...patch] as T;
  if (!isPlainObject(patch) || !isPlainObject(base)) return patch as T;
  const output: Record<string, any> = { ...(base as any) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    output[key] = isPlainObject(value) && isPlainObject(output[key])
      ? deepMerge(output[key], value)
      : Array.isArray(value) ? [...value] : value;
  }
  return output as T;
}

function unwrapTemplatePayload(parsed: any, templateType: TemplateType) {
  const contentKey = TEMPLATE_CONTENT_KEY[templateType];
  if (!contentKey) return parsed;
  if (isPlainObject(parsed.data)) return parsed.data;
  if (isPlainObject(parsed.content?.[contentKey])) return parsed.content[contentKey];
  if (isPlainObject(parsed[contentKey])) return parsed[contentKey];
  return Object.fromEntries(Object.entries(parsed).filter(([key]) => !ENVELOPE_KEYS.has(key)));
}

function normalizeVisualInstructions(
  templateType: TemplateType,
  rawVisuals: unknown,
): { visuals: Record<string, SemanticLogoInstruction>; warnings: string[]; error?: string } {
  if (rawVisuals == null) return { visuals: {}, warnings: [] };
  if (!isPlainObject(rawVisuals)) {
    return { visuals: {}, warnings: [], error: 'visuals must be an object keyed by semantic identity.' };
  }

  const validSlots = getTemplatePackVisualSlots(templateType);
  const visuals: Record<string, SemanticLogoInstruction> = {};
  const warnings: string[] = [];

  for (const [semanticKey, instruction] of Object.entries(rawVisuals)) {
    if (!(semanticKey in validSlots)) {
      warnings.push(`Unknown visual identity ignored: ${semanticKey}`);
      continue;
    }
    if (typeof instruction === 'string') {
      visuals[semanticKey] = { logoSrc: instruction, visible: Boolean(instruction) };
      continue;
    }
    if (!isPlainObject(instruction)) {
      return { visuals: {}, warnings, error: `visuals.${semanticKey} must be a logo URL/data URI string or an object.` };
    }
    const logoSrc = instruction.logoSrc ?? instruction.src;
    if (logoSrc !== undefined && typeof logoSrc !== 'string') {
      return { visuals: {}, warnings, error: `visuals.${semanticKey}.logoSrc must be a string.` };
    }
    if (instruction.visible !== undefined && typeof instruction.visible !== 'boolean') {
      return { visuals: {}, warnings, error: `visuals.${semanticKey}.visible must be a boolean.` };
    }
    visuals[semanticKey] = {
      ...(logoSrc !== undefined ? { logoSrc } : {}),
      ...(instruction.visible !== undefined ? { visible: instruction.visible } : {}),
    };
  }
  return { visuals, warnings };
}

export function parseTemplatePack(jsonString: string, templateType: TemplateType): TemplatePackParseResult {
  let parsedInput: any;
  try {
    parsedInput = JSON.parse(jsonString);
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to parse JSON file.', warnings: [] };
  }
  if (!isPlainObject(parsedInput)) return { data: null, error: 'JSON must contain an object.', warnings: [] };

  if (templateType === 'scouting-report') {
    const declaredType = parsedInput.templateType;
    const legacyStudioAlias = parsedInput.schemaVersion === 'studio-pack-v1' && declaredType === 'player-scouting';
    if (declaredType && declaredType !== 'scouting-report' && !legacyStudioAlias) {
      return { data: null, error: `This JSON is for ${declaredType}, but the active template is scouting-report.`, warnings: [] };
    }
    const visualResult = normalizeVisualInstructions(templateType, parsedInput.visuals);
    if (visualResult.error) return { data: null, error: visualResult.error, warnings: visualResult.warnings };
    const playerResult = parsePlayerPack(jsonString);
    if (playerResult.error || !playerResult.data) {
      return { data: null, error: playerResult.error || 'Invalid scouting/player pack.', warnings: [] };
    }
    const warnings = playerResult.unknownKeys
      .filter((key) => key !== 'templateType' && key !== 'visuals')
      .map((key) => key.startsWith('migrated:') ? key : `Unknown field preserved by player-pack parser: ${key}`);
    if (!declaredType) warnings.push('Legacy scouting pack has no templateType; treated as scouting-report.');
    if (legacyStudioAlias) warnings.push('Legacy player-scouting template identity accepted as scouting-report.');
    warnings.push(...visualResult.warnings);
    return {
      data: { envelope: parsedInput, payload: playerResult.data, visuals: visualResult.visuals } satisfies ParsedTemplatePackData,
      error: null,
      warnings,
    };
  }

  const expectedVersion = getTemplatePackSchemaVersion(templateType);
  const migration = migrateTemplatePackEnvelope(parsedInput, templateType, expectedVersion);
  if (migration.error) return { data: null, error: migration.error, warnings: [] };
  const envelope = migration.value;
  if (envelope.schemaVersion !== expectedVersion) {
    return { data: null, error: `Unsupported schemaVersion: ${envelope.schemaVersion}. Expected ${expectedVersion}.`, warnings: [] };
  }

  const payload = unwrapTemplatePayload(envelope, templateType);
  if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
    return { data: null, error: 'Template JSON payload is empty or invalid.', warnings: [] };
  }
  const validationErrors = validateTemplatePackPayload(templateType, payload);
  if (validationErrors.length) {
    return { data: null, error: `Validation failed: ${validationErrors.join(', ')}`, warnings: [] };
  }
  const visualResult = normalizeVisualInstructions(templateType, envelope.visuals);
  if (visualResult.error) return { data: null, error: visualResult.error, warnings: visualResult.warnings };

  const warnings: string[] = [];
  if (migration.warning) warnings.push(migration.warning);
  const unknownKeys = getUnknownTemplatePayloadKeys(templateType, payload);
  if (unknownKeys.length) warnings.push(`Unknown data fields preserved: ${unknownKeys.join(', ')}`);
  warnings.push(...visualResult.warnings);
  return {
    data: { envelope, payload, visuals: visualResult.visuals } satisfies ParsedTemplatePackData,
    error: null,
    warnings,
  };
}

function applySemanticVisualInstructions(
  project: Project,
  templateType: TemplateType,
  instructions: Record<string, SemanticLogoInstruction> | undefined,
): Project {
  if (!instructions || Object.keys(instructions).length === 0) return project;
  const active = project.templates[templateType];
  if (!active) return project;
  const slots = getTemplatePackVisualSlots(templateType);
  const logos = active.visuals.logos.map((logo) => ({ ...logo }));

  for (const [semanticKey, instruction] of Object.entries(instructions)) {
    const index = slots[semanticKey];
    if (index === undefined || !logos[index]) continue;
    const logoSrc = instruction.logoSrc;
    logos[index] = {
      ...logos[index],
      ...(logoSrc !== undefined ? { src: logoSrc } : {}),
      ...(instruction.visible !== undefined
        ? { visible: instruction.visible }
        : logoSrc !== undefined ? { visible: Boolean(logoSrc) } : {}),
    };
  }

  return {
    ...project,
    updatedAt: Date.now(),
    templates: {
      ...project.templates,
      [templateType]: { ...active, visuals: { ...active.visuals, logos } },
    },
  };
}

export function applyTemplatePackToProject(project: Project, templateType: TemplateType, parsedData: any): Project {
  const envelope = parsedData?.envelope || {};
  const payload = parsedData?.payload || parsedData;
  const visualInstructions = parsedData?.visuals || {};

  if (templateType === 'scouting-report') {
    const originalVisuals = clone(project.templates['scouting-report']?.visuals);
    let updated = applyPlayerPackToProject(project, payload);
    const content = updated.templates['scouting-report']?.content as any;
    const studioData = payload?.schemaVersion === 'studio-pack-v1' ? payload.data : null;
    const rawPlayer = studioData?.player || payload?.player;

    if (originalVisuals && updated.templates['scouting-report']) updated.templates['scouting-report'].visuals = originalVisuals;
    if (content && studioData?.headline) content.scoutingHeadline = studioData.headline;
    if (content && payload?.schemaVersion === 'studio-pack-v1') {
      content.dataProvenance = {
        ...(content.dataProvenance || {}),
        schemaVersion: 'studio-pack-v1', context: payload.context, sources: payload.sources || [],
        importedAt: new Date().toISOString(),
      };
    }
    const resolvedFlag = resolveCountryFlag(
      updated.sharedData.player.nationality,
      rawPlayer?.nationalityCode || rawPlayer?.countryCode || rawPlayer?.nationality?.code || updated.sharedData.player.countryFlag,
    );
    if (resolvedFlag) updated.sharedData.player.countryFlag = resolvedFlag;
    return applySemanticVisualInstructions(updated, templateType, visualInstructions);
  }

  const contentKey = TEMPLATE_CONTENT_KEY[templateType];
  if (!contentKey) return project;
  const newProject: Project = clone(project);
  const targetTemplate = newProject.templates[templateType];
  if (!targetTemplate) return project;
  const currentValue = targetTemplate.content[contentKey] as any;
  (targetTemplate.content as any)[contentKey] = deepMerge(currentValue || {}, payload);

  if (isPlainObject(envelope.sharedData)) newProject.sharedData = deepMerge(newProject.sharedData, envelope.sharedData);
  if (isPlainObject(envelope.sharedPlayer)) newProject.sharedData.player = deepMerge(newProject.sharedData.player, envelope.sharedPlayer);
  (targetTemplate.content as any).dataProvenance = {
    ...((targetTemplate.content as any).dataProvenance || {}),
    schemaVersion: envelope.schemaVersion || getTemplatePackSchemaVersion(templateType),
    metadata: envelope.metadata,
    context: envelope.context,
    sources: envelope.sources || [],
    importedAt: new Date().toISOString(),
  };
  newProject.templateType = templateType;
  newProject.updatedAt = Date.now();
  return applySemanticVisualInstructions(newProject, templateType, visualInstructions);
}

function buildSemanticVisualExport(project: Project, templateType: TemplateType) {
  const active = project.templates[templateType];
  if (!active) return {};
  return Object.fromEntries(Object.entries(getTemplatePackVisualSlots(templateType)).flatMap(([semanticKey, index]) => {
    const logo = active.visuals.logos[index];
    return logo ? [[semanticKey, { logoSrc: logo.src || '', visible: Boolean(logo.visible) }]] : [];
  }));
}

function scoutingPackFromProject(project: Project, includeVisuals: boolean) {
  const content = project.templates['scouting-report']?.content;
  const provenance = (content as any)?.dataProvenance || {};
  const player = project.sharedData.player;
  const pack: Record<string, any> = {
    schemaVersion: 'player-pack-v1',
    templateType: 'scouting-report',
    player: {
      name: player.name,
      age: player.age,
      nationality: player.nationality,
      countryCode: player.countryFlag,
      club: player.club,
      preferredFoot: player.preferredFoot,
      height: player.height,
      positions: player.positions,
    },
    stats: clone(content?.stats || []),
    scouting: {
      summary: content?.profile?.summary || '',
      tacticalProfile: content?.profile?.tacticalProfile || '',
      strengths: clone(content?.strengths || []),
      development: clone(content?.development || []),
    },
  };
  if (provenance.context) pack.context = clone(provenance.context);
  if (Array.isArray(provenance.sources) && provenance.sources.length) pack.sources = clone(provenance.sources);
  if (includeVisuals) pack.visuals = buildSemanticVisualExport(project, 'scouting-report');
  return pack;
}

export function createTemplatePack(
  project: Project,
  templateType: TemplateType = project.templateType,
  includeVisuals = false,
): Record<string, any> {
  if (templateType === 'scouting-report') return scoutingPackFromProject(project, includeVisuals);
  const active = project.templates[templateType];
  const contentKey = TEMPLATE_CONTENT_KEY[templateType];
  const pack: Record<string, any> = {
    schemaVersion: getTemplatePackSchemaVersion(templateType),
    templateType,
    data: clone(contentKey && active ? (active.content[contentKey] || {}) : {}),
  };
  const provenance = (active?.content as any)?.dataProvenance;
  if (provenance?.context) pack.context = clone(provenance.context);
  if (Array.isArray(provenance?.sources) && provenance.sources.length) pack.sources = clone(provenance.sources);
  if (includeVisuals) pack.visuals = buildSemanticVisualExport(project, templateType);
  return pack;
}

function safeFilenamePart(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').toLowerCase() || 'studio';
}

export function downloadTemplatePack(
  project: Project,
  templateType: TemplateType = project.templateType,
  includeVisuals = false,
): void {
  const pack = createTemplatePack(project, templateType, includeVisuals);
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const baseName = project.name || project.sharedData.player.name || templateType;
  anchor.href = url;
  anchor.download = `${safeFilenamePart(baseName)}-${templateType}-data.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function templatePackLabel(templateType: TemplateType): string {
  const labels: Record<TemplateType, string> = {
    'scouting-report': 'Scouting Report / Player Pack',
    'player-comparison': 'Player Comparison',
    'transfer-graphic': 'Transfer Graphic',
    'match-preview': 'Match Preview',
    'match-analysis': 'Match Analysis',
    'tactical-analysis': 'Tactical Analysis',
    'stat-highlight': 'Stat Highlight',
    'ranking-top-list': 'Ranking / Top List',
    'quote-opinion': 'Quote / Opinion',
    'thread-cover': 'Thread Cover',
    'match-result': 'Match Result',
    'team-profile': 'Team Profile',
  };
  return labels[templateType];
}

export { getTemplatePackDefinition } from './templatePackSchema';
