import { z } from 'zod';
import { CLUB_LIBRARY } from '../constants/clubs';
import { Project, StatIconType, StatItem, TemplateType } from '../types';

const provenanceStatusSchema = z.enum([
  'verified',
  'manual',
  'derived',
  'calculated',
  'missing',
  'missing-source',
]);

const sourceSchema = z.object({
  provider: z.string().optional(),
  source: z.string().optional(),
  url: z.string().optional(),
  sourceUrl: z.string().optional(),
  competition: z.string().optional(),
  season: z.string().optional(),
  sampleSize: z.union([z.string(), z.number()]).optional(),
  minutes: z.union([z.string(), z.number()]).optional(),
  retrievedAt: z.string().optional(),
  verified: z.boolean().optional(),
  status: provenanceStatusSchema.optional(),
}).passthrough();

const statSchema = z.object({
  id: z.string().optional(),
  key: z.string().optional(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  icon: z.string().optional(),
  subValue: z.string().optional(),
  percentile: z.union([z.string(), z.number()]).optional(),
  percentileRank: z.union([z.string(), z.number()]).optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  competition: z.string().optional(),
  season: z.string().optional(),
  sampleSize: z.union([z.string(), z.number()]).optional(),
  retrievedAt: z.string().optional(),
  status: provenanceStatusSchema.optional(),
  provenance: sourceSchema.optional(),
}).passthrough();

const playerSchema = z.object({
  name: z.string(),
  age: z.union([z.string(), z.number()]).optional(),
  nationality: z.union([
    z.string(),
    z.object({ name: z.string(), code: z.string().optional() }).passthrough(),
  ]).optional(),
  nationalityCode: z.string().optional(),
  countryCode: z.string().optional(),
  height: z.string().optional(),
  heightCm: z.union([z.string(), z.number()]).optional(),
  preferredFoot: z.string().optional(),
  positions: z.union([z.string(), z.array(z.string())]).optional(),
  primaryPosition: z.string().optional(),
  club: z.union([
    z.string(),
    z.object({ name: z.string(), country: z.string().optional() }).passthrough(),
  ]).optional(),
}).passthrough();

const contextSchema = z.object({
  season: z.string().optional(),
  competition: z.string().optional(),
  league: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  venue: z.string().optional(),
  round: z.string().optional(),
  score: z.string().optional(),
  asOf: z.string().optional(),
  scope: z.string().optional(),
}).passthrough();

const basePackShape = {
  schemaVersion: z.literal('studio-pack-v1'),
  projectTitle: z.string().optional(),
  context: contextSchema.optional(),
  sources: z.array(sourceSchema).optional(),
};

const comparisonPlayerSchema = z.object({
  name: z.string(),
  age: z.union([z.string(), z.number()]).optional().default(''),
  nationality: z.string().optional().default(''),
  preferredFoot: z.string().optional().default(''),
  height: z.string().optional().default(''),
  positions: z.string().optional().default(''),
  club: z.string().optional().default(''),
}).passthrough();

const comparisonMetricSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  val1: z.union([z.string(), z.number()]),
  val2: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  higherIsBetter: z.boolean().optional(),
  provenance: sourceSchema.optional(),
}).passthrough();

const playerScoutingPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('player-scouting'),
  data: z.object({
    player: playerSchema,
    headline: z.string().optional(),
    summary: z.string().optional().default(''),
    tacticalProfile: z.string().optional().default(''),
    strengths: z.array(z.string()).optional().default([]),
    development: z.array(z.string()).optional().default([]),
    stats: z.array(statSchema).optional().default([]),
  }).passthrough(),
}).passthrough();

const playerComparisonPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('player-comparison'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional().default(''),
    playerA: comparisonPlayerSchema,
    playerB: comparisonPlayerSchema,
    metrics: z.array(comparisonMetricSchema).optional().default([]),
    verdictTitle: z.string().optional().default('ANALYTICAL VERDICT'),
    verdict: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

const transferPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('transfer-graphic'),
  data: z.object({
    player: playerSchema,
    headline: z.string().optional().default(''),
    badgeText: z.string().optional().default(''),
    transferFee: z.string().optional().default(''),
    contractLength: z.string().optional().default(''),
    fromClub: z.string().optional().default(''),
    toClub: z.string().optional().default(''),
    detailsSummary: z.string().optional().default(''),
    keyConditions: z.array(z.string()).optional().default([]),
  }).passthrough(),
}).passthrough();

const matchPreviewPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('match-preview'),
  data: z.object({
    competition: z.string().optional().default(''),
    matchDate: z.string().optional().default(''),
    kickoffTime: z.string().optional().default(''),
    team1: z.object({
      name: z.string(),
      form: z.array(z.string()).optional().default([]),
      manager: z.string().optional().default(''),
      standing: z.string().optional().default(''),
    }).passthrough(),
    team2: z.object({
      name: z.string(),
      form: z.array(z.string()).optional().default([]),
      manager: z.string().optional().default(''),
      standing: z.string().optional().default(''),
    }).passthrough(),
    keyBattleTitle: z.string().optional().default(''),
    keyBattleDetails: z.string().optional().default(''),
    tacticalKeys: z.array(z.string()).optional().default([]),
  }).passthrough(),
}).passthrough();

const matchAnalysisPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('match-analysis'),
  data: z.object({
    competition: z.string().optional().default(''),
    scoreline: z.object({
      team1: z.string(), score1: z.number(), team2: z.string(), score2: z.number(),
    }),
    scorersTeam1: z.array(z.string()).optional().default([]),
    scorersTeam2: z.array(z.string()).optional().default([]),
    stats: z.array(z.object({
      label: z.string(),
      val1: z.union([z.string(), z.number()]),
      val2: z.union([z.string(), z.number()]),
      val1Num: z.number().optional(),
      val2Num: z.number().optional(),
      provenance: sourceSchema.optional(),
    }).passthrough()).optional().default([]),
    tacticalSummary: z.string().optional().default(''),
    keyTakeaways: z.array(z.string()).optional().default([]),
    performerTitle: z.string().optional().default(''),
    performerName: z.string().optional().default(''),
    performerNote: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

const tacticalPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('tactical-analysis'),
  data: z.object({
    topic: z.string().optional().default(''),
    teamOrCoach: z.string().optional().default(''),
    formation: z.string().optional().default(''),
    phase: z.enum(['In Possession', 'Out of Possession', 'Defensive Transition', 'Attacking Transition']).optional().default('In Possession'),
    corePrinciples: z.array(z.object({ title: z.string(), description: z.string() })).optional().default([]),
    tacticalNote: z.string().optional().default(''),
    keyInstructions: z.array(z.string()).optional().default([]),
    players: z.array(z.object({
      id: z.string(),
      name: z.string(),
      number: z.union([z.string(), z.number()]).optional(),
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    }).passthrough()).optional(),
    averagePositions: z.array(z.object({
      playerId: z.string(), x: z.number().min(0).max(100), y: z.number().min(0).max(100),
    }).passthrough()).optional(),
    passingNetwork: z.array(z.object({
      fromPlayerId: z.string(), toPlayerId: z.string(), passCount: z.number().nonnegative(),
    }).passthrough()).optional(),
  }).passthrough(),
}).passthrough();

const statHighlightPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('stat-highlight'),
  data: z.object({
    subject: z.string().optional(),
    heroStat: z.union([z.string(), z.number()]),
    heroStatLabel: z.string(),
    rankBadge: z.string().optional().default(''),
    categoryTag: z.string().optional().default(''),
    sampleSize: z.string().optional().default(''),
    contextMetrics: z.array(statSchema).optional().default([]),
    editorialVerdict: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

const rankingPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('ranking-list'),
  data: z.object({
    categoryTitle: z.string(),
    subtitle: z.string().optional().default(''),
    metricHeader: z.string().optional().default(''),
    seasonFilter: z.string().optional().default(''),
    items: z.array(z.object({
      id: z.string().optional(),
      rank: z.number(),
      playerName: z.string(),
      club: z.string().optional().default(''),
      val: z.union([z.string(), z.number()]),
      subVal: z.string().optional(),
      highlighted: z.boolean().optional(),
      provenance: sourceSchema.optional(),
    }).passthrough()).default([]),
    footerNote: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

const quotePackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('quote-opinion'),
  data: z.object({
    quote: z.string(),
    authorName: z.string(),
    authorRole: z.string().optional().default(''),
    topicTag: z.string().optional().default(''),
    sourceDate: z.string().optional().default(''),
    keyPunchline: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

const threadPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('thread-cover'),
  data: z.object({
    headline: z.string(),
    subtitle: z.string().optional().default(''),
    badge: z.string().optional().default(''),
    authorHandle: z.string().optional().default(''),
    topicBullets: z.array(z.string()).optional().default([]),
  }).passthrough(),
}).passthrough();

const matchResultPackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('match-result'),
  data: z.object({
    competition: z.string().optional().default(''),
    stage: z.string().optional().default(''),
    team1: z.string(),
    team2: z.string(),
    score1: z.number(),
    score2: z.number(),
    scorers1: z.array(z.string()).optional().default([]),
    scorers2: z.array(z.string()).optional().default([]),
    matchStats: z.array(z.object({
      label: z.string(), val1: z.union([z.string(), z.number()]), val2: z.union([z.string(), z.number()]), provenance: sourceSchema.optional(),
    }).passthrough()).optional().default([]),
    mvpPlayer: z.string().optional().default(''),
    mvpStat: z.string().optional().default(''),
    matchSummary: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

const teamProfilePackSchema = z.object({
  ...basePackShape,
  templateType: z.literal('team-profile'),
  data: z.object({
    teamName: z.string(),
    manager: z.string().optional().default(''),
    league: z.string().optional().default(''),
    leagueRank: z.string().optional().default(''),
    tacticalStyleTag: z.string().optional().default(''),
    metrics: z.array(statSchema).optional().default([]),
    strengths: z.array(z.string()).optional().default([]),
    weaknesses: z.array(z.string()).optional().default([]),
    tacticalSummary: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

export const StudioPackSchema = z.discriminatedUnion('templateType', [
  playerScoutingPackSchema,
  playerComparisonPackSchema,
  transferPackSchema,
  matchPreviewPackSchema,
  matchAnalysisPackSchema,
  tacticalPackSchema,
  statHighlightPackSchema,
  rankingPackSchema,
  quotePackSchema,
  threadPackSchema,
  matchResultPackSchema,
  teamProfilePackSchema,
]);

export type StudioPackV1 = z.infer<typeof StudioPackSchema>;
export type StudioPackTemplateType = StudioPackV1['templateType'];

const TEMPLATE_MAP: Record<StudioPackTemplateType, TemplateType> = {
  'player-scouting': 'scouting-report',
  'player-comparison': 'player-comparison',
  'transfer-graphic': 'transfer-graphic',
  'match-preview': 'match-preview',
  'match-analysis': 'match-analysis',
  'tactical-analysis': 'tactical-analysis',
  'stat-highlight': 'stat-highlight',
  'ranking-list': 'ranking-top-list',
  'quote-opinion': 'quote-opinion',
  'thread-cover': 'thread-cover',
  'match-result': 'match-result',
  'team-profile': 'team-profile',
};

function normalizedStatus(status?: string) {
  if (status === 'derived' || status === 'calculated') return 'calculated' as const;
  if (status === 'manual') return 'manual' as const;
  if (status === 'verified') return 'verified' as const;
  return 'missing' as const;
}

function toStatItem(stat: z.infer<typeof statSchema>, index: number, sources?: z.infer<typeof sourceSchema>[]): StatItem {
  const fallbackSource = sources?.[0];
  const provenance = stat.provenance || {};
  const source = provenance.source || provenance.provider || stat.source || fallbackSource?.source || fallbackSource?.provider;
  const sourceUrl = provenance.sourceUrl || provenance.url || stat.sourceUrl || fallbackSource?.sourceUrl || fallbackSource?.url;
  const status = provenance.status || stat.status || fallbackSource?.status || (fallbackSource?.verified ? 'verified' : undefined);
  const percentile = stat.percentileRank ?? stat.percentile;

  return {
    id: stat.id || stat.key || `imported-stat-${index}`,
    label: stat.label,
    value: String(stat.value),
    icon: ((stat.icon || 'chart') as StatIconType),
    subValue: stat.subValue,
    percentileRank: percentile == null ? undefined : String(percentile),
    provenance: {
      source,
      sourceUrl,
      competition: provenance.competition || stat.competition || fallbackSource?.competition,
      season: provenance.season || stat.season || fallbackSource?.season,
      sampleSize: provenance.sampleSize == null
        ? (stat.sampleSize == null ? (fallbackSource?.sampleSize == null ? undefined : String(fallbackSource.sampleSize)) : String(stat.sampleSize))
        : String(provenance.sampleSize),
      retrievedAt: provenance.retrievedAt || stat.retrievedAt || fallbackSource?.retrievedAt,
      status: normalizedStatus(status),
    },
  };
}

function playerName(player: z.infer<typeof playerSchema>['club']) {
  if (!player) return '';
  return typeof player === 'string' ? player : player.name;
}

function nationalityName(value: z.infer<typeof playerSchema>['nationality']) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.name;
}

function toPlayerInfo(player: z.infer<typeof playerSchema>) {
  const positions = Array.isArray(player.positions) ? player.positions.join(' / ') : (player.positions || player.primaryPosition || '');
  const height = player.height || (player.heightCm != null ? `${player.heightCm} cm` : '');
  return {
    name: player.name,
    age: player.age == null ? '' : String(player.age),
    nationality: nationalityName(player.nationality),
    preferredFoot: player.preferredFoot || '',
    height,
    positions,
    club: playerName(player.club),
  };
}

function resolveClubLogo(clubName: string): string | undefined {
  if (!clubName) return undefined;
  const key = clubName.toLowerCase().trim();
  if (CLUB_LIBRARY[key]) return CLUB_LIBRARY[key];
  const match = Object.keys(CLUB_LIBRARY).find((candidate) => key.includes(candidate) || candidate.includes(key));
  return match ? CLUB_LIBRARY[match] : undefined;
}

function attachPackSources(content: Record<string, any>, pack: StudioPackV1) {
  if (pack.sources?.length) {
    content.dataProvenance = {
      schemaVersion: 'studio-pack-v1',
      context: pack.context,
      sources: pack.sources,
      importedAt: new Date().toISOString(),
    };
  }
}

export function applyStudioPackToProject(project: Project, pack: StudioPackV1): Project {
  const next: Project = JSON.parse(JSON.stringify(project));
  const templateType = TEMPLATE_MAP[pack.templateType];
  const template = next.templates[templateType];
  const data: any = pack.data;

  next.templateType = templateType;
  next.updatedAt = Date.now();
  if (pack.projectTitle) next.name = pack.projectTitle;

  switch (pack.templateType) {
    case 'player-scouting': {
      const player = toPlayerInfo(data.player);
      next.sharedData.player = { ...next.sharedData.player, ...player };
      template.content.profile = {
        ...template.content.profile,
        summary: data.summary || template.content.profile.summary,
        tacticalProfile: data.tacticalProfile || template.content.profile.tacticalProfile,
      };
      if (data.stats?.length) template.content.stats = data.stats.map((s: any, i: number) => toStatItem(s, i, pack.sources));
      if (data.strengths) template.content.strengths = [...data.strengths];
      if (data.development) template.content.development = [...data.development];
      const logo = resolveClubLogo(player.club);
      if (logo && template.visuals.logos[0]) {
        template.visuals.logos[0] = { ...template.visuals.logos[0], src: logo, visible: true };
      }
      break;
    }
    case 'player-comparison':
      template.content.comparisonData = {
        player1: { ...toPlayerInfo(data.playerA) },
        player2: { ...toPlayerInfo(data.playerB) },
        subtitle: data.subtitle || '',
        metrics: (data.metrics || []).map((m: any, index: number) => ({
          ...m,
          id: m.id || `comparison-${index}`,
          val1: String(m.val1),
          val2: String(m.val2),
        })),
        verdictTitle: data.verdictTitle || 'ANALYTICAL VERDICT',
        verdictText: data.verdict || '',
      };
      break;
    case 'transfer-graphic':
      template.content.transferData = {
        player: toPlayerInfo(data.player),
        headline: data.headline,
        badgeText: data.badgeText,
        transferFee: data.transferFee,
        contractLength: data.contractLength,
        fromClub: data.fromClub,
        toClub: data.toClub,
        detailsSummary: data.detailsSummary,
        keyConditions: [...data.keyConditions],
      };
      break;
    case 'match-preview':
      template.content.matchPreviewData = JSON.parse(JSON.stringify(data));
      break;
    case 'match-analysis':
      template.content.matchAnalysisData = {
        ...JSON.parse(JSON.stringify(data)),
        stats: (data.stats || []).map((s: any) => ({ ...s, val1: String(s.val1), val2: String(s.val2) })),
      };
      break;
    case 'tactical-analysis': {
      const { players, averagePositions, passingNetwork, ...legacyTacticalData } = data;
      template.content.tacticalData = JSON.parse(JSON.stringify(legacyTacticalData));
      (template.content as any).tacticalMapData = { players, averagePositions, passingNetwork };
      break;
    }
    case 'stat-highlight':
      template.content.statHighlightData = {
        heroStat: String(data.heroStat),
        heroStatLabel: data.heroStatLabel,
        rankBadge: data.rankBadge,
        categoryTag: data.categoryTag,
        sampleSize: data.sampleSize,
        contextMetrics: (data.contextMetrics || []).map((s: any, i: number) => toStatItem(s, i, pack.sources)),
        editorialVerdict: data.editorialVerdict,
      };
      break;
    case 'ranking-list':
      template.content.rankingData = {
        categoryTitle: data.categoryTitle,
        subtitle: data.subtitle,
        metricHeader: data.metricHeader,
        seasonFilter: data.seasonFilter,
        items: (data.items || []).map((item: any, index: number) => ({
          ...item,
          id: item.id || `ranking-${index}`,
          val: String(item.val),
        })),
        footerNote: data.footerNote,
      };
      break;
    case 'quote-opinion':
      template.content.quoteData = JSON.parse(JSON.stringify(data));
      break;
    case 'thread-cover':
      template.content.threadCoverData = JSON.parse(JSON.stringify(data));
      break;
    case 'match-result':
      template.content.matchResultData = {
        ...JSON.parse(JSON.stringify(data)),
        matchStats: (data.matchStats || []).map((s: any) => ({ ...s, val1: String(s.val1), val2: String(s.val2) })),
      };
      break;
    case 'team-profile':
      template.content.teamProfileData = {
        ...JSON.parse(JSON.stringify(data)),
        metrics: (data.metrics || []).map((s: any, i: number) => toStatItem(s, i, pack.sources)),
      };
      break;
  }

  attachPackSources(template.content as any, pack);
  return next;
}

export function parseStudioPack(input: string | unknown) {
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    const result = StudioPackSchema.safeParse(parsed);
    if (!result.success) {
      return {
        data: null,
        error: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', '),
        unknownKeys: [] as string[],
      };
    }
    const knownTopLevel = ['schemaVersion', 'templateType', 'projectTitle', 'context', 'data', 'sources'];
    const unknownKeys = Object.keys((parsed || {}) as Record<string, unknown>).filter((key) => !knownTopLevel.includes(key));
    return { data: result.data, error: null, unknownKeys };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Invalid JSON.', unknownKeys: [] as string[] };
  }
}
