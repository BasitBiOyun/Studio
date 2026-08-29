import { PlayerPackV1, Project, StatItem, StatIconType } from '../types';
import { COUNTRIES } from '../constants/countries';
import { CLUB_LIBRARY } from '../constants/clubs';
import { PlayerPackSchema } from './schema';
import { StudioPackV1, applyStudioPackToProject, parseStudioPack } from './studioPack';

export type ImportableDataPack = PlayerPackV1 | StudioPackV1;

function getNationalityName(value: any): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value.name || '';
}

function getCountryCode(player: any): string | undefined {
  const direct = player.countryCode || player.nationalityCode;
  if (direct) return String(direct).toLowerCase();
  if (player.nationality && typeof player.nationality === 'object' && player.nationality.code) {
    return String(player.nationality.code).toLowerCase();
  }
  const nationality = getNationalityName(player.nationality);
  return COUNTRIES.find((country) => country.name.toLowerCase() === nationality.toLowerCase())?.code;
}

function getClubName(value: any): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value.name || '';
}

function getPositions(player: any): string {
  if (Array.isArray(player.positions)) return player.positions.join(' / ');
  return player.positions || player.primaryPosition || '';
}

function getHeight(player: any): string {
  if (player.height) return String(player.height);
  if (player.heightCm != null) return `${player.heightCm} cm`;
  return '';
}

function resolveClubLogo(clubName: string): string | undefined {
  if (!clubName) return undefined;
  const key = clubName.toLowerCase().trim();
  if (CLUB_LIBRARY[key]) return CLUB_LIBRARY[key];
  const found = Object.keys(CLUB_LIBRARY).find((candidate) => key.includes(candidate) || candidate.includes(key));
  return found ? CLUB_LIBRARY[found] : undefined;
}

function normalizedStatus(status?: string) {
  if (status === 'verified') return 'verified' as const;
  if (status === 'manual') return 'manual' as const;
  if (status === 'derived' || status === 'calculated') return 'calculated' as const;
  return 'missing' as const;
}

function normalizeStat(stat: any, index: number, pack: any): StatItem {
  const provenance = stat.provenance || {};
  const fallback = Array.isArray(pack.sources) ? pack.sources[0] || {} : {};
  const source = provenance.source || provenance.provider || stat.source || fallback.source || fallback.provider;
  const sourceUrl = provenance.sourceUrl || provenance.url || stat.sourceUrl || fallback.sourceUrl || fallback.url;
  const status = provenance.status || stat.status || fallback.status || (fallback.verified ? 'verified' : undefined);
  const percentile = stat.percentileRank ?? stat.percentile;

  return {
    id: stat.id || stat.key || `imported-stat-${index}`,
    label: stat.label,
    value: String(stat.value),
    icon: (stat.icon || 'chart') as StatIconType,
    subValue: stat.subValue,
    percentileRank: percentile == null ? undefined : String(percentile),
    provenance: {
      source,
      sourceUrl,
      competition: provenance.competition || stat.competition || pack.context?.competition || pack.context?.league || fallback.competition,
      season: provenance.season || stat.season || pack.context?.season || fallback.season,
      sampleSize: provenance.sampleSize == null
        ? (stat.sampleSize == null ? (fallback.sampleSize == null ? undefined : String(fallback.sampleSize)) : String(stat.sampleSize))
        : String(provenance.sampleSize),
      retrievedAt: provenance.retrievedAt || stat.retrievedAt || fallback.retrievedAt,
      status: normalizedStatus(status),
    },
  };
}

export function applyPlayerPackToProject(project: Project, pack: ImportableDataPack): Project {
  if ((pack as any).schemaVersion === 'studio-pack-v1') {
    return applyStudioPackToProject(project, pack as StudioPackV1);
  }

  const rawPack: any = pack;
  const newProject: Project = JSON.parse(JSON.stringify(project));
  const player = rawPack.player || {};
  const nationality = getNationalityName(player.nationality);
  const club = getClubName(player.club);
  const countryCode = getCountryCode(player);

  newProject.sharedData.player = {
    ...newProject.sharedData.player,
    name: player.name || newProject.sharedData.player.name,
    age: player.age == null ? newProject.sharedData.player.age : String(player.age),
    height: getHeight(player) || newProject.sharedData.player.height,
    preferredFoot: player.preferredFoot || newProject.sharedData.player.preferredFoot,
    positions: getPositions(player) || newProject.sharedData.player.positions,
    club: club || newProject.sharedData.player.club,
    nationality: nationality || newProject.sharedData.player.nationality,
    countryFlag: countryCode || newProject.sharedData.player.countryFlag,
  };

  const scoutingTemplate = newProject.templates['scouting-report'];
  const scouting = rawPack.scouting || {};

  if (scoutingTemplate) {
    const { content } = scoutingTemplate;
    const summary = scouting.summary || rawPack.scoutingSummary;
    const tacticalProfile = scouting.tacticalProfile || rawPack.tacticalProfile;
    const strengths = scouting.strengths || rawPack.strengths;
    const development = scouting.development || rawPack.developmentAreas;

    if (summary) content.profile.summary = summary;
    if (tacticalProfile) content.profile.tacticalProfile = tacticalProfile;
    if (Array.isArray(strengths)) content.strengths = [...strengths];
    if (Array.isArray(development)) content.development = [...development];
    if (Array.isArray(rawPack.stats) && rawPack.stats.length) {
      content.stats = rawPack.stats.map((stat: any, index: number) => normalizeStat(stat, index, rawPack));
    }

    const logo = resolveClubLogo(club);
    if (logo && scoutingTemplate.visuals.logos[0]) {
      scoutingTemplate.visuals.logos[0] = {
        ...scoutingTemplate.visuals.logos[0],
        src: logo,
        visible: true,
      };
    }

    (content as any).dataProvenance = {
      schemaVersion: 'player-pack-v1',
      context: rawPack.context,
      sources: rawPack.sources || [],
      metadata: rawPack.metadata,
      importedAt: new Date().toISOString(),
    };
  }

  newProject.templateType = 'scouting-report';
  newProject.updatedAt = Date.now();
  return newProject;
}

export function parsePlayerPack(jsonString: string): {
  data: ImportableDataPack | null;
  error: string | null;
  unknownKeys: string[];
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { data: null, error: 'Empty JSON.', unknownKeys: [] };
    }

    if (parsed.schemaVersion === 'studio-pack-v1') {
      return parseStudioPack(parsed) as {
        data: ImportableDataPack | null;
        error: string | null;
        unknownKeys: string[];
      };
    }

    const result = PlayerPackSchema.safeParse(parsed);
    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return { data: null, error: `Validation failed: ${errorMessages}`, unknownKeys: [] };
    }

    const knownKeys = [
      'schemaVersion', 'type', 'generatedAt', 'player', 'context', 'stats', 'scouting',
      'scoutingSummary', 'tacticalProfile', 'strengths', 'developmentAreas', 'seasonSummary',
      'roleProfile', 'sources', 'metadata',
    ];
    const unknownKeys = Object.keys(parsed).filter((key) => !knownKeys.includes(key));

    return { data: result.data as unknown as PlayerPackV1, error: null, unknownKeys };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to parse JSON file.',
      unknownKeys: [],
    };
  }
}
