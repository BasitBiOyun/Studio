import { z } from 'zod';
import type { TemplateType } from '../types';

const stringOrNumber = z.union([z.string(), z.number()]);
const looseObject = z.record(z.string(), z.any());
const playerIdentity = z.object({
  name: z.string().optional(),
  club: z.string().optional(),
  age: stringOrNumber.optional(),
  positions: z.union([z.string(), z.array(z.string())]).optional(),
}).passthrough();
const teamIdentity = z.object({
  name: z.string().optional(),
  manager: z.string().optional(),
  standing: z.string().optional(),
  form: z.array(z.string()).optional(),
}).passthrough();
const metric = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  val: stringOrNumber.optional(),
  val1: stringOrNumber.optional(),
  val2: stringOrNumber.optional(),
  val1Num: z.number().optional(),
  val2Num: z.number().optional(),
  subVal: z.string().optional(),
  higherIsBetter: z.boolean().optional(),
}).passthrough();

function payload(shape: z.ZodRawShape) {
  return z.object(shape).partial().passthrough();
}

export interface TemplatePackDefinition {
  schemaVersion: string;
  payloadSchema: z.ZodTypeAny;
  payloadKeys: readonly string[];
  visualSlots: Readonly<Record<string, number>>;
}

const definitions: Record<TemplateType, TemplatePackDefinition> = {
  'scouting-report': {
    schemaVersion: 'player-pack-v1',
    payloadSchema: z.any(),
    payloadKeys: [
      'player', 'stats', 'scouting', 'scoutingSummary', 'tacticalProfile', 'strengths',
      'developmentAreas', 'seasonSummary', 'roleProfile', 'context', 'sources', 'metadata',
    ],
    visualSlots: { playerClub: 0, competition: 1 },
  },
  'player-comparison': {
    schemaVersion: 'player-comparison-pack-v1',
    payloadSchema: payload({
      player1: playerIdentity,
      player2: playerIdentity,
      subtitle: z.string(),
      metrics: z.array(metric),
      verdictTitle: z.string(),
      verdictText: z.string(),
    }),
    payloadKeys: ['player1', 'player2', 'subtitle', 'metrics', 'verdictTitle', 'verdictText'],
    visualSlots: { player1Club: 0, player2Club: 1, competition: 2 },
  },
  'transfer-graphic': {
    schemaVersion: 'transfer-graphic-pack-v1',
    payloadSchema: payload({
      player: playerIdentity,
      headline: z.string(),
      badgeText: z.string(),
      transferFee: stringOrNumber,
      contractLength: z.string(),
      fromClub: z.string(),
      toClub: z.string(),
      detailsSummary: z.string(),
      keyConditions: z.array(z.string()),
    }),
    payloadKeys: ['player', 'headline', 'badgeText', 'transferFee', 'contractLength', 'fromClub', 'toClub', 'detailsSummary', 'keyConditions'],
    visualSlots: { fromClub: 0, toClub: 1, competition: 2 },
  },
  'match-preview': {
    schemaVersion: 'match-preview-pack-v1',
    payloadSchema: payload({
      competition: z.string(),
      matchDate: z.string(),
      kickoffTime: z.string(),
      team1: teamIdentity,
      team2: teamIdentity,
      keyBattleTitle: z.string(),
      keyBattleDetails: z.string(),
      tacticalKeys: z.array(z.string()),
    }),
    payloadKeys: ['competition', 'matchDate', 'kickoffTime', 'team1', 'team2', 'keyBattleTitle', 'keyBattleDetails', 'tacticalKeys'],
    visualSlots: { homeTeam: 0, awayTeam: 1, competition: 2 },
  },
  'match-analysis': {
    schemaVersion: 'match-analysis-pack-v1',
    payloadSchema: payload({
      competition: z.string(),
      scoreline: z.object({
        team1: z.string().optional(),
        score1: stringOrNumber.optional(),
        team2: z.string().optional(),
        score2: stringOrNumber.optional(),
      }).passthrough(),
      scorersTeam1: z.array(z.string()),
      scorersTeam2: z.array(z.string()),
      stats: z.array(metric),
      tacticalSummary: z.string(),
      keyTakeaways: z.array(z.string()),
      performerTitle: z.string(),
      performerName: z.string(),
      performerNote: z.string(),
    }),
    payloadKeys: ['competition', 'scoreline', 'scorersTeam1', 'scorersTeam2', 'stats', 'tacticalSummary', 'keyTakeaways', 'performerTitle', 'performerName', 'performerNote'],
    visualSlots: { homeTeam: 0, awayTeam: 1, competition: 2 },
  },
  'tactical-analysis': {
    schemaVersion: 'tactical-analysis-pack-v1',
    payloadSchema: payload({
      topic: z.string(),
      teamOrCoach: z.string(),
      formation: z.string(),
      phase: z.string(),
      corePrinciples: z.array(looseObject),
      tacticalNote: z.string(),
      keyInstructions: z.array(z.string()),
    }),
    payloadKeys: ['topic', 'teamOrCoach', 'formation', 'phase', 'corePrinciples', 'tacticalNote', 'keyInstructions'],
    visualSlots: { club: 0, opponent: 1, competition: 2 },
  },
  'stat-highlight': {
    schemaVersion: 'stat-highlight-pack-v1',
    payloadSchema: payload({
      heroStat: stringOrNumber,
      heroStatLabel: z.string(),
      rankBadge: z.string(),
      categoryTag: z.string(),
      sampleSize: z.string(),
      contextMetrics: z.array(metric),
      editorialVerdict: z.string(),
    }),
    payloadKeys: ['heroStat', 'heroStatLabel', 'rankBadge', 'categoryTag', 'sampleSize', 'contextMetrics', 'editorialVerdict'],
    visualSlots: { club: 0, competition: 1 },
  },
  'ranking-top-list': {
    schemaVersion: 'ranking-top-list-pack-v1',
    payloadSchema: payload({
      categoryTitle: z.string(),
      subtitle: z.string(),
      metricHeader: z.string(),
      seasonFilter: z.string(),
      items: z.array(looseObject),
      footerNote: z.string(),
    }),
    payloadKeys: ['categoryTitle', 'subtitle', 'metricHeader', 'seasonFilter', 'items', 'footerNote'],
    visualSlots: { competition: 0, highlightedClub: 1 },
  },
  'quote-opinion': {
    schemaVersion: 'quote-opinion-pack-v1',
    payloadSchema: payload({
      quote: z.string(),
      authorName: z.string(),
      authorRole: z.string(),
      topicTag: z.string(),
      sourceDate: z.string(),
      keyPunchline: z.string(),
    }),
    payloadKeys: ['quote', 'authorName', 'authorRole', 'topicTag', 'sourceDate', 'keyPunchline'],
    visualSlots: { authorClub: 0, competition: 1 },
  },
  'thread-cover': {
    schemaVersion: 'thread-cover-pack-v1',
    payloadSchema: payload({
      headline: z.string(),
      subtitle: z.string(),
      badge: z.string(),
      authorHandle: z.string(),
      topicBullets: z.array(z.string()),
    }),
    payloadKeys: ['headline', 'subtitle', 'badge', 'authorHandle', 'topicBullets'],
    visualSlots: { club: 0, competition: 1 },
  },
  'match-result': {
    schemaVersion: 'match-result-pack-v1',
    payloadSchema: payload({
      competition: z.string(),
      stage: z.string(),
      team1: z.string(),
      team2: z.string(),
      score1: stringOrNumber,
      score2: stringOrNumber,
      scorers1: z.array(z.string()),
      scorers2: z.array(z.string()),
      matchStats: z.array(metric),
      mvpPlayer: z.string(),
      mvpStat: z.string(),
      matchSummary: z.string(),
    }),
    payloadKeys: ['competition', 'stage', 'team1', 'team2', 'score1', 'score2', 'scorers1', 'scorers2', 'matchStats', 'mvpPlayer', 'mvpStat', 'matchSummary'],
    visualSlots: { homeTeam: 0, awayTeam: 1, competition: 2 },
  },
  'team-profile': {
    schemaVersion: 'team-profile-pack-v1',
    payloadSchema: payload({
      teamName: z.string(),
      manager: z.string(),
      league: z.string(),
      leagueRank: z.string(),
      tacticalStyleTag: z.string(),
      metrics: z.array(metric),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      tacticalSummary: z.string(),
    }),
    payloadKeys: ['teamName', 'manager', 'league', 'leagueRank', 'tacticalStyleTag', 'metrics', 'strengths', 'weaknesses', 'tacticalSummary'],
    visualSlots: { club: 0, competition: 1 },
  },
};

export function getTemplatePackDefinition(templateType: TemplateType): TemplatePackDefinition {
  return definitions[templateType];
}

export function getTemplatePackSchemaVersion(templateType: TemplateType): string {
  return definitions[templateType].schemaVersion;
}

export function getTemplatePackVisualSlots(templateType: TemplateType): Readonly<Record<string, number>> {
  return definitions[templateType].visualSlots;
}

export function validateTemplatePackPayload(templateType: TemplateType, value: unknown): string[] {
  if (templateType === 'scouting-report') return [];
  const result = definitions[templateType].payloadSchema.safeParse(value);
  if (result.success) return [];
  return result.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : 'data';
    return `${path}: ${issue.message}`;
  });
}

export function getUnknownTemplatePayloadKeys(templateType: TemplateType, value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const allowed = new Set(definitions[templateType].payloadKeys);
  return Object.keys(value as Record<string, unknown>).filter((key) => !allowed.has(key));
}
