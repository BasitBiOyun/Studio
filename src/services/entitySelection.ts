import { Project } from '../types';
import type { ClubCatalogueEntry } from './clubCatalogue';
import type { CompetitionCatalogueEntry } from './competitionCatalogue';
import { displayCompetitionName } from './competitionCatalogue';
import { ASSET_LOGO_TARGETS } from './assetTargets';

export type EntityKind = 'club' | 'competition';
export type EntityTargetKey = `logo-${number}`;

export interface EntitySemanticTarget {
  key: EntityTargetKey;
  index: number;
  labelEn: string;
  labelTr: string;
}

const TARGET_TR: Record<string, string> = {
  'Player Club Logo': 'Oyuncu Kulübü Logosu',
  'Competition / League Logo': 'Turnuva / Lig Logosu',
  'Player 1 Club Logo': 'Oyuncu 1 Kulüp Logosu',
  'Player 2 Club Logo': 'Oyuncu 2 Kulüp Logosu',
  'Competition Logo': 'Turnuva Logosu',
  'From Club Logo': 'Eski Kulüp Logosu',
  'To Club Logo': 'Yeni Kulüp Logosu',
  'Team 1 Logo': 'Takım 1 Logosu',
  'Team 2 Logo': 'Takım 2 Logosu',
  'Team / Club Logo': 'Takım / Kulüp Logosu',
  'Opponent / Secondary Logo': 'Rakip / İkinci Logo',
  'Player / Club Logo': 'Oyuncu / Kulüp Logosu',
  'Highlighted Club Logo': 'Öne Çıkan Kulüp Logosu',
  'Author Club Logo': 'Yazar Kulübü Logosu',
  'Topic / Club Logo': 'Konu / Kulüp Logosu',
  'Source / Competition Logo': 'Kaynak / Turnuva Logosu',
  'Team Logo / Background Crest': 'Takım Logosu / Arka Plan Arması',
  'League / Competition Logo': 'Lig / Turnuva Logosu',
};

export function getEntityTargets(project: Project, kind: EntityKind): EntitySemanticTarget[] {
  const policy = ASSET_LOGO_TARGETS[project.templateType];
  const entries = kind === 'competition' ? policy.competition : policy.club;
  const activeTemplate = project.templates[project.templateType];

  return entries
    .filter(({ index }) => Boolean(activeTemplate?.visuals?.logos?.[index]))
    .map(({ index, label }) => ({
      key: `logo-${index}` as EntityTargetKey,
      index,
      labelEn: label,
      labelTr: TARGET_TR[label] || label,
    }));
}

function applyLogo(project: Project, targetKey: EntityTargetKey, visualSrc: string): Project {
  const active = project.templates[project.templateType];
  if (!active) return project;
  const index = Number(targetKey.replace('logo-', ''));
  if (!Number.isInteger(index) || !active.visuals.logos[index]) return project;

  const logos = active.visuals.logos.map((logo, logoIndex) =>
    logoIndex === index
      ? { ...logo, src: visualSrc, visible: Boolean(visualSrc) }
      : logo,
  );

  return {
    ...project,
    updatedAt: Date.now(),
    templates: {
      ...project.templates,
      [project.templateType]: {
        ...active,
        visuals: { ...active.visuals, logos },
      },
    },
  };
}

function replaceLeadingIdentity(value: string, nextName: string): string {
  const original = String(value || '').trim();
  if (!original) return nextName;
  const separator = original.includes('•') ? '•' : original.includes('|') ? '|' : '';
  if (!separator) return nextName;
  const rest = original.split(separator).slice(1).join(separator).trim();
  return rest ? `${nextName} ${separator} ${rest}` : nextName;
}

function updateClubText(project: Project, logoIndex: number, clubName: string): Project {
  const active = project.templates[project.templateType];
  if (!active) return project;

  switch (project.templateType) {
    case 'scouting-report':
      if (logoIndex !== 0) return project;
      return {
        ...project,
        sharedData: {
          ...project.sharedData,
          player: { ...project.sharedData.player, club: clubName },
        },
      };

    case 'player-comparison': {
      const data = active.content.comparisonData;
      if (!data || (logoIndex !== 0 && logoIndex !== 1)) return project;
      const comparisonData = logoIndex === 0
        ? { ...data, player1: { ...data.player1, club: clubName } }
        : { ...data, player2: { ...data.player2, club: clubName } };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, comparisonData } },
        },
      };
    }

    case 'transfer-graphic': {
      const data = active.content.transferData;
      if (!data || (logoIndex !== 0 && logoIndex !== 1)) return project;
      const transferData = logoIndex === 0 ? { ...data, fromClub: clubName } : { ...data, toClub: clubName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, transferData } },
        },
      };
    }

    case 'match-preview': {
      const data = active.content.matchPreviewData;
      if (!data || (logoIndex !== 0 && logoIndex !== 1)) return project;
      const matchPreviewData = logoIndex === 0
        ? { ...data, team1: { ...data.team1, name: clubName } }
        : { ...data, team2: { ...data.team2, name: clubName } };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, matchPreviewData } },
        },
      };
    }

    case 'match-analysis': {
      const data = active.content.matchAnalysisData;
      if (!data || (logoIndex !== 0 && logoIndex !== 1)) return project;
      const scoreline = logoIndex === 0
        ? { ...data.scoreline, team1: clubName }
        : { ...data.scoreline, team2: clubName };
      const matchAnalysisData = { ...data, scoreline };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, matchAnalysisData } },
        },
      };
    }

    case 'tactical-analysis': {
      const data = active.content.tacticalData;
      if (!data || logoIndex !== 0) return project;
      const tacticalData = { ...data, teamOrCoach: replaceLeadingIdentity(data.teamOrCoach, clubName) };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, tacticalData } },
        },
      };
    }

    case 'stat-highlight':
      if (logoIndex !== 0) return project;
      return {
        ...project,
        sharedData: {
          ...project.sharedData,
          player: { ...project.sharedData.player, club: clubName },
        },
      };

    case 'ranking-top-list': {
      const data = active.content.rankingData;
      if (!data || logoIndex !== 1) return project;
      const highlightedIndex = data.items.findIndex((item) => item.highlighted);
      if (highlightedIndex < 0) return project;
      const items = data.items.map((item, index) =>
        index === highlightedIndex ? { ...item, club: clubName } : item,
      );
      const rankingData = { ...data, items };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, rankingData } },
        },
      };
    }

    case 'match-result': {
      const data = active.content.matchResultData;
      if (!data || (logoIndex !== 0 && logoIndex !== 1)) return project;
      const matchResultData = logoIndex === 0 ? { ...data, team1: clubName } : { ...data, team2: clubName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, matchResultData } },
        },
      };
    }

    case 'team-profile': {
      const data = active.content.teamProfileData;
      if (!data || logoIndex !== 0) return project;
      const teamProfileData = { ...data, teamName: clubName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, teamProfileData } },
        },
      };
    }

    default:
      return project;
  }
}

function updateCompetitionText(
  project: Project,
  logoIndex: number,
  competitionName: string,
): Project {
  const active = project.templates[project.templateType];
  if (!active) return project;

  switch (project.templateType) {
    case 'match-preview': {
      const data = active.content.matchPreviewData;
      if (!data || logoIndex !== 2) return project;
      const matchPreviewData = { ...data, competition: competitionName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, matchPreviewData } },
        },
      };
    }
    case 'match-analysis': {
      const data = active.content.matchAnalysisData;
      if (!data || logoIndex !== 2) return project;
      const matchAnalysisData = { ...data, competition: competitionName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, matchAnalysisData } },
        },
      };
    }
    case 'match-result': {
      const data = active.content.matchResultData;
      if (!data || logoIndex !== 2) return project;
      const matchResultData = { ...data, competition: competitionName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, matchResultData } },
        },
      };
    }
    case 'team-profile': {
      const data = active.content.teamProfileData;
      if (!data || logoIndex !== 1) return project;
      const teamProfileData = { ...data, league: competitionName };
      return {
        ...project,
        templates: {
          ...project.templates,
          [project.templateType]: { ...active, content: { ...active.content, teamProfileData } },
        },
      };
    }
    default:
      return project;
  }
}

export function applyClubEntitySelection(
  project: Project,
  targetKey: EntityTargetKey,
  club: Pick<ClubCatalogueEntry, 'name'>,
  visualSrc: string,
  updateText = true,
): Project {
  const target = getEntityTargets(project, 'club').find((item) => item.key === targetKey);
  if (!target) return project;
  const withLogo = applyLogo(project, targetKey, visualSrc);
  const withText = updateText ? updateClubText(withLogo, target.index, club.name) : withLogo;
  return { ...withText, updatedAt: Date.now() };
}

export function applyCompetitionEntitySelection(
  project: Project,
  targetKey: EntityTargetKey,
  competition: CompetitionCatalogueEntry,
  visualSrc: string,
  language: 'tr' | 'en',
  updateText = true,
): Project {
  const target = getEntityTargets(project, 'competition').find((item) => item.key === targetKey);
  if (!target) return project;
  const withLogo = applyLogo(project, targetKey, visualSrc);
  const name = displayCompetitionName(competition, language);
  const withText = updateText ? updateCompetitionText(withLogo, target.index, name) : withLogo;
  return { ...withText, updatedAt: Date.now() };
}
