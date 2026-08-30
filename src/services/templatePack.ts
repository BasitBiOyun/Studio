import { Project, TemplateContent, TemplateType } from '../types';
import { applyPlayerPackToProject, parsePlayerPack } from './playerPack';

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
  'schemaVersion',
  'templateType',
  'type',
  'data',
  'content',
  'sharedData',
  'sharedPlayer',
  'metadata',
  'context',
  'sources',
  'generatedAt',
]);

export interface TemplatePackParseResult {
  data: any | null;
  error: string | null;
  warnings: string[];
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T>(base: T, patch: any): T {
  if (Array.isArray(patch)) return [...patch] as T;
  if (!isPlainObject(patch) || !isPlainObject(base)) return patch as T;

  const output: Record<string, any> = { ...(base as any) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    output[key] = isPlainObject(value) && isPlainObject(output[key])
      ? deepMerge(output[key], value)
      : Array.isArray(value)
        ? [...value]
        : value;
  }
  return output as T;
}

function expectedSchemaVersion(templateType: TemplateType) {
  return `${templateType}-pack-v1`;
}

function unwrapTemplatePayload(parsed: any, templateType: TemplateType) {
  const contentKey = TEMPLATE_CONTENT_KEY[templateType];
  if (!contentKey) return parsed;

  if (isPlainObject(parsed.data)) return parsed.data;
  if (isPlainObject(parsed.content?.[contentKey])) return parsed.content[contentKey];
  if (isPlainObject(parsed[contentKey])) return parsed[contentKey];

  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => !ENVELOPE_KEYS.has(key)),
  );
}

export function parseTemplatePack(jsonString: string, templateType: TemplateType): TemplatePackParseResult {
  if (templateType === 'scouting-report') {
    const result = parsePlayerPack(jsonString);
    return {
      data: result.data,
      error: result.error,
      warnings: result.unknownKeys,
    };
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (!isPlainObject(parsed)) {
      return { data: null, error: 'JSON must contain an object.', warnings: [] };
    }

    const declaredType = parsed.templateType || parsed.type;
    if (declaredType && declaredType !== templateType) {
      return {
        data: null,
        error: `This JSON is for ${declaredType}, but the active template is ${templateType}.`,
        warnings: [],
      };
    }

    const schemaVersion = parsed.schemaVersion;
    const expectedVersion = expectedSchemaVersion(templateType);
    if (schemaVersion && schemaVersion !== expectedVersion && schemaVersion !== 'template-pack-v1') {
      return {
        data: null,
        error: `Unsupported schemaVersion: ${schemaVersion}. Expected ${expectedVersion} or template-pack-v1.`,
        warnings: [],
      };
    }

    const payload = unwrapTemplatePayload(parsed, templateType);
    if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
      return { data: null, error: 'Template JSON payload is empty or invalid.', warnings: [] };
    }

    const warnings: string[] = [];
    if (!schemaVersion) warnings.push('schemaVersion missing');
    if (!declaredType) warnings.push('templateType missing');

    return {
      data: {
        envelope: parsed,
        payload,
      },
      error: null,
      warnings,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to parse JSON file.',
      warnings: [],
    };
  }
}

export function applyTemplatePackToProject(project: Project, templateType: TemplateType, parsedData: any): Project {
  if (templateType === 'scouting-report') {
    return applyPlayerPackToProject(project, parsedData);
  }

  const contentKey = TEMPLATE_CONTENT_KEY[templateType];
  if (!contentKey) return project;

  const envelope = parsedData?.envelope || {};
  const payload = parsedData?.payload || parsedData;
  const newProject: Project = JSON.parse(JSON.stringify(project));
  const targetTemplate = newProject.templates[templateType];
  if (!targetTemplate) return project;

  const currentValue = targetTemplate.content[contentKey] as any;
  (targetTemplate.content as any)[contentKey] = deepMerge(currentValue || {}, payload);

  if (isPlainObject(envelope.sharedData)) {
    newProject.sharedData = deepMerge(newProject.sharedData, envelope.sharedData);
  }

  if (isPlainObject(envelope.sharedPlayer)) {
    newProject.sharedData.player = deepMerge(newProject.sharedData.player, envelope.sharedPlayer);
  }

  (targetTemplate.content as any).dataProvenance = {
    ...((targetTemplate.content as any).dataProvenance || {}),
    schemaVersion: envelope.schemaVersion || expectedSchemaVersion(templateType),
    metadata: envelope.metadata,
    context: envelope.context,
    sources: envelope.sources || [],
    importedAt: new Date().toISOString(),
  };

  newProject.templateType = templateType;
  newProject.updatedAt = Date.now();
  return newProject;
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
