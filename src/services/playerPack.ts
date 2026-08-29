import { PlayerPackV1, Project, StatItem } from '../types';
import { COUNTRIES } from '../constants/countries';
import { CLUB_LIBRARY } from '../constants/clubs';

export function applyPlayerPackToProject(project: Project, pack: PlayerPackV1): Project {
  // Deep clone to avoid mutating the original
  const newProject: Project = JSON.parse(JSON.stringify(project));

  // 1. Map Player Identity
  if (pack.player) {
    newProject.sharedData.player.name = pack.player.name || newProject.sharedData.player.name;
    newProject.sharedData.player.age = pack.player.age ? String(pack.player.age) : newProject.sharedData.player.age;
    newProject.sharedData.player.height = pack.player.height || newProject.sharedData.player.height;
    newProject.sharedData.player.preferredFoot = pack.player.preferredFoot || newProject.sharedData.player.preferredFoot;
    newProject.sharedData.player.positions = pack.player.positions || newProject.sharedData.player.positions;
    
    if (pack.player.club) {
      newProject.sharedData.player.club = pack.player.club;
      // Auto-resolve club logo placeholder if possible.
      const clubKey = pack.player.club.toLowerCase();
      
      // Look for a match in our library
      let resolvedLogo = CLUB_LIBRARY[clubKey];
      if (!resolvedLogo) {
        const found = Object.keys(CLUB_LIBRARY).find(k => clubKey.includes(k) || k.includes(clubKey));
        if (found) resolvedLogo = CLUB_LIBRARY[found];
      }
      
      if (resolvedLogo) {
        Object.keys(newProject.templates).forEach((key) => {
          const tKey = key as any;
          const template = newProject.templates[tKey];
          if (template && template.visuals.logos.length > 0) {
            // Update the first logo to be the club logo
            template.visuals.logos[0].src = resolvedLogo;
            template.visuals.logos[0].visible = true;
          }
        });
      }
    }
    
    if (pack.player.nationality) {
      newProject.sharedData.player.nationality = pack.player.nationality;
      const matched = COUNTRIES.find(c => c.name.toLowerCase() === pack.player.nationality?.toLowerCase());
      if (matched) {
        newProject.sharedData.player.countryFlag = matched.flag;
      }
    }
  }

  // 2. We populate all templates that have compatible fields
  // Specifically: scouting-report, player-comparison, etc.
  const scoutingTemplate = newProject.templates['scouting-report'];
  if (scoutingTemplate) {
    const { content } = scoutingTemplate;
    
    if (pack.scoutingSummary) {
      content.profile.summary = pack.scoutingSummary;
    }
    if (pack.tacticalProfile) {
      content.profile.tacticalProfile = pack.tacticalProfile;
    }
    if (pack.strengths && Array.isArray(pack.strengths)) {
      content.strengths = [...pack.strengths];
    }
    if (pack.developmentAreas && Array.isArray(pack.developmentAreas)) {
      content.development = [...pack.developmentAreas];
    }
    if (pack.stats && Array.isArray(pack.stats)) {
      content.stats = pack.stats.map((s, idx) => {
        const provenance = s.provenance ? {
          source: s.provenance.source,
          sourceUrl: s.provenance.sourceUrl,
          competition: s.provenance.competition || pack.context?.league,
          season: s.provenance.season || pack.context?.season,
          sampleSize: s.provenance.sampleSize,
          retrievedAt: s.provenance.retrievedAt,
          status: s.provenance.status || (s.provenance.source ? 'verified' : 'missing')
        } : {
          competition: pack.context?.league,
          season: pack.context?.season,
          status: 'missing'
        };

        return {
          id: `stat-${idx}-${Date.now()}`,
          label: s.label,
          value: String(s.value),
          percentileRank: s.percentile ? String(s.percentile) : undefined,
          icon: 'chart',
          provenance: provenance
        } as StatItem;
      });
    }
  }

  // Update modified date
  newProject.updatedAt = Date.now();

  return newProject;
}

import { PlayerPackSchema } from './schema';

export function parsePlayerPack(jsonString: string): { data: PlayerPackV1 | null; error: string | null; unknownKeys: string[] } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed) {
      return { data: null, error: 'Empty JSON.', unknownKeys: [] };
    }
    
    // Zod validation
    const result = PlayerPackSchema.safeParse(parsed);
    if (!result.success) {
      const errorMessages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { data: null, error: `Validation failed: ${errorMessages}`, unknownKeys: [] };
    }

    if (parsed.schemaVersion !== 'player-pack-v1') {
      return { data: null, error: 'Unsupported schema version.', unknownKeys: [] };
    }

    // Identify unknown keys at the top level
    const knownKeys = ['schemaVersion', 'player', 'context', 'stats', 'scoutingSummary', 'tacticalProfile', 'strengths', 'developmentAreas', 'metadata'];
    const unknownKeys = Object.keys(parsed).filter(k => !knownKeys.includes(k));

    return { data: result.data as PlayerPackV1, error: null, unknownKeys };
  } catch (e: any) {
    return { data: null, error: e.message || 'Failed to parse JSON file.', unknownKeys: [] };
  }
}
