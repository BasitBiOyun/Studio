import { Project, StatItem, TemplateType } from '../types';
import { db } from './db';

export type BatchContentKind = 'main' | 'stat-highlight' | 'thread-cover' | 'story';

export interface BatchContentOutput {
  kind: BatchContentKind;
  label: string;
  project: Project;
}

interface SourceFacts {
  title: string;
  subtitle: string;
  summary: string;
  bullets: string[];
  stat?: StatItem;
  contextLabel: string;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function compact(values: Array<string | undefined | null>): string[] {
  return values.map((value) => String(value || '').trim()).filter(Boolean);
}

function firstStat(project: Project): StatItem | undefined {
  const content = project.templates[project.templateType].content;
  if (project.templateType === 'stat-highlight' && content.statHighlightData?.contextMetrics?.length) {
    return clone(content.statHighlightData.contextMetrics[0]);
  }
  if (project.templateType === 'team-profile' && content.teamProfileData?.metrics?.length) {
    return clone(content.teamProfileData.metrics[0]);
  }
  if (['scouting-report', 'transfer-graphic', 'tactical-analysis'].includes(project.templateType) && content.stats?.length) {
    return clone(content.stats[0]);
  }
  return undefined;
}

export function extractBatchSourceFacts(project: Project): SourceFacts {
  const content = project.templates[project.templateType].content;
  const playerName = project.sharedData?.player?.name || '';
  let title = playerName || project.name || '';
  let subtitle = '';
  let summary = content.profile?.summary || '';
  let bullets = compact(content.strengths || []);
  let contextLabel = project.templateType.replace(/-/g, ' ');

  switch (project.templateType) {
    case 'transfer-graphic': {
      const data = content.transferData;
      title = data?.headline || playerName || title;
      subtitle = compact([data?.fromClub, data?.toClub]).join(' → ');
      summary = data?.detailsSummary || summary;
      bullets = compact(data?.keyConditions || []);
      contextLabel = compact([data?.badgeText, data?.transferFee]).join(' • ');
      break;
    }
    case 'match-preview': {
      const data = content.matchPreviewData;
      title = compact([data?.team1?.name, data?.team2?.name]).join(' vs ') || title;
      subtitle = data?.competition || '';
      summary = data?.keyBattleDetails || summary;
      bullets = compact(data?.tacticalKeys || []);
      contextLabel = compact([data?.matchDate, data?.kickoffTime]).join(' • ');
      break;
    }
    case 'match-analysis': {
      const data = content.matchAnalysisData;
      title = data ? `${data.scoreline.team1} ${data.scoreline.score1}-${data.scoreline.score2} ${data.scoreline.team2}` : title;
      subtitle = data?.competition || '';
      summary = data?.tacticalSummary || summary;
      bullets = compact(data?.keyTakeaways || []);
      contextLabel = data?.performerName || '';
      break;
    }
    case 'tactical-analysis': {
      const data = content.tacticalData;
      title = data?.topic || title;
      subtitle = data?.teamOrCoach || '';
      summary = data?.tacticalNote || summary;
      bullets = compact(data?.keyInstructions || []);
      contextLabel = compact([data?.formation, data?.phase]).join(' • ');
      break;
    }
    case 'stat-highlight': {
      const data = content.statHighlightData;
      title = playerName || title;
      subtitle = data?.heroStatLabel || '';
      summary = data?.editorialVerdict || summary;
      bullets = compact([data?.rankBadge, data?.categoryTag]);
      contextLabel = data?.sampleSize || '';
      break;
    }
    case 'ranking-top-list': {
      const data = content.rankingData;
      title = data?.categoryTitle || title;
      subtitle = data?.subtitle || '';
      summary = data?.footerNote || summary;
      bullets = compact(data?.items?.slice(0, 4).map((item) => `${item.rank}. ${item.playerName} ${item.val}`) || []);
      contextLabel = compact([data?.metricHeader, data?.seasonFilter]).join(' • ');
      break;
    }
    case 'quote-opinion': {
      const data = content.quoteData;
      title = data?.keyPunchline || data?.topicTag || title;
      subtitle = compact([data?.authorName, data?.authorRole]).join(' • ');
      summary = data?.quote || summary;
      bullets = [];
      contextLabel = data?.sourceDate || '';
      break;
    }
    case 'thread-cover': {
      const data = content.threadCoverData;
      title = data?.headline || title;
      subtitle = data?.subtitle || '';
      summary = data?.subtitle || summary;
      bullets = compact(data?.topicBullets || []);
      contextLabel = compact([data?.badge, data?.authorHandle]).join(' • ');
      break;
    }
    case 'match-result': {
      const data = content.matchResultData;
      title = data ? `${data.team1} ${data.score1}-${data.score2} ${data.team2}` : title;
      subtitle = compact([data?.competition, data?.stage]).join(' • ');
      summary = data?.matchSummary || summary;
      bullets = compact([data?.mvpPlayer, data?.mvpStat]);
      contextLabel = data?.competition || '';
      break;
    }
    case 'team-profile': {
      const data = content.teamProfileData;
      title = data?.teamName || title;
      subtitle = compact([data?.league, data?.leagueRank]).join(' • ');
      summary = data?.tacticalSummary || summary;
      bullets = compact([...(data?.strengths || []), ...(data?.weaknesses || [])]).slice(0, 5);
      contextLabel = compact([data?.manager, data?.tacticalStyleTag]).join(' • ');
      break;
    }
    case 'player-comparison': {
      const data = content.comparisonData;
      title = data ? `${data.player1.name} vs ${data.player2.name}` : title;
      subtitle = data?.subtitle || '';
      summary = data?.verdictText || summary;
      bullets = compact(data?.metrics?.slice(0, 4).map((metric) => `${metric.label}: ${metric.val1} / ${metric.val2}`) || []);
      contextLabel = data?.verdictTitle || '';
      break;
    }
    default:
      break;
  }

  return {
    title: title.trim(),
    subtitle: subtitle.trim(),
    summary: summary.trim(),
    bullets: bullets.slice(0, 5),
    stat: firstStat(project),
    contextLabel: contextLabel.trim(),
  };
}

function createOutputBase(source: Project, kind: BatchContentKind, templateType: TemplateType, ratio: Project['aspectRatio']): Project {
  const now = Date.now();
  const output = clone(source);
  const sourceState = source.templates[source.templateType];
  const targetState = output.templates[templateType];

  output.id = `batch-${source.id}-${kind}-${now}-${Math.random().toString(36).slice(2, 7)}`;
  output.name = `${source.name || source.sharedData?.player?.name || 'Graphic'} - ${kind.replace(/-/g, ' ')}`;
  output.templateType = templateType;
  output.aspectRatio = ratio;
  output.createdAt = now;
  output.updatedAt = now;

  targetState.theme = clone(sourceState.theme);
  targetState.visuals = clone(sourceState.visuals);
  return output;
}

export function generateBatchContentSet(source: Project): BatchContentOutput[] {
  const facts = extractBatchSourceFacts(source);
  const outputs: BatchContentOutput[] = [];

  const main = createOutputBase(source, 'main', source.templateType, source.aspectRatio);
  main.name = `${source.name || source.sharedData?.player?.name || 'Graphic'} - Main`;
  outputs.push({ kind: 'main', label: 'Main Graphic', project: main });

  const story = createOutputBase(source, 'story', source.templateType, '9:16' as Project['aspectRatio']);
  story.name = `${source.name || source.sharedData?.player?.name || 'Graphic'} - Story`;
  outputs.push({ kind: 'story', label: 'Story / Vertical', project: story });

  if (facts.stat?.value && facts.stat?.label) {
    const stat = createOutputBase(source, 'stat-highlight', 'stat-highlight', '1:1');
    const target = stat.templates['stat-highlight'].content;
    target.statHighlightData = {
      ...target.statHighlightData!,
      heroStat: facts.stat.value,
      heroStatLabel: facts.stat.label,
      rankBadge: facts.stat.percentileRank || '',
      categoryTag: facts.contextLabel || '',
      sampleSize: compact([
        facts.stat.provenance?.competition,
        facts.stat.provenance?.season,
        facts.stat.provenance?.sampleSize,
      ]).join(' • '),
      contextMetrics: [clone(facts.stat)],
      editorialVerdict: facts.summary,
    };
    stat.name = `${source.name || facts.title || 'Graphic'} - Stat Highlight`;
    outputs.push({ kind: 'stat-highlight', label: 'Stat Highlight', project: stat });
  }

  if (facts.title && (facts.subtitle || facts.summary || facts.bullets.length)) {
    const thread = createOutputBase(source, 'thread-cover', 'thread-cover', '1:1');
    const target = thread.templates['thread-cover'].content;
    target.threadCoverData = {
      ...target.threadCoverData!,
      headline: facts.title,
      subtitle: facts.subtitle || facts.summary,
      badge: facts.contextLabel,
      authorHandle: source.sharedData?.credits?.visualBy || '',
      topicBullets: facts.bullets,
    };
    thread.name = `${source.name || facts.title || 'Graphic'} - Thread Cover`;
    outputs.push({ kind: 'thread-cover', label: 'Thread Cover', project: thread });
  }

  return outputs;
}

export async function saveBatchContentSet(outputs: BatchContentOutput[]): Promise<void> {
  await db.projects.bulkPut(outputs.map((output) => clone(output.project)));
}
