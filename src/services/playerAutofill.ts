import { Project, PlayerPackV1 } from '../types';
import {
  fetchNormalizedPlayerPack,
  searchPlayersAcrossProviders,
  PlayerSearchCandidate,
} from './playerDataProviders';
import { applyPlayerPackToProject } from './playerPack';

export interface PlayerAutofillPreview {
  providerId: string;
  externalId: string;
  candidate?: PlayerSearchCandidate;
  pack: PlayerPackV1;
  changes: {
    playerName?: string;
    club?: string;
    nationality?: string;
    statsCount: number;
    strengthsCount: number;
    developmentCount: number;
  };
}

export async function searchPlayerAutofill(query: string) {
  return searchPlayersAcrossProviders(query);
}

export async function createPlayerAutofillPreview(
  providerId: string,
  externalId: string,
  candidate?: PlayerSearchCandidate,
): Promise<PlayerAutofillPreview> {
  const pack = await fetchNormalizedPlayerPack(providerId, externalId);
  const raw: any = pack;
  const scouting = raw.scouting || {};
  const nationality = typeof raw.player.nationality === 'string'
    ? raw.player.nationality
    : raw.player.nationality?.name;
  const club = typeof raw.player.club === 'string'
    ? raw.player.club
    : raw.player.club?.name;

  return {
    providerId,
    externalId,
    candidate,
    pack,
    changes: {
      playerName: raw.player.name,
      club,
      nationality,
      statsCount: Array.isArray(raw.stats) ? raw.stats.length : 0,
      strengthsCount: Array.isArray(scouting.strengths)
        ? scouting.strengths.length
        : (Array.isArray(raw.strengths) ? raw.strengths.length : 0),
      developmentCount: Array.isArray(scouting.development)
        ? scouting.development.length
        : (Array.isArray(raw.developmentAreas) ? raw.developmentAreas.length : 0),
    },
  };
}

/**
 * Confirmation is deliberately separate from preview. Providers never mutate
 * project state directly; only this explicit confirmation step applies data.
 */
export function confirmPlayerAutofill(project: Project, preview: PlayerAutofillPreview): Project {
  return applyPlayerPackToProject(project, preview.pack);
}
