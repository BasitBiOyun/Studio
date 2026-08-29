import { PlayerPackSchema } from './schema';
import { PlayerPackV1 } from '../types';

export interface PlayerSearchCandidate {
  providerId: string;
  externalId: string;
  name: string;
  club?: string;
  nationality?: string;
  birthYear?: number;
  position?: string;
}

export interface PlayerDataProvider {
  id: string;
  name: string;
  search(query: string): Promise<PlayerSearchCandidate[]>;
  fetchPlayer(externalId: string): Promise<unknown>;
  normalize(raw: unknown): PlayerPackV1;
}

const providers = new Map<string, PlayerDataProvider>();

export function registerPlayerDataProvider(provider: PlayerDataProvider) {
  if (!provider.id.trim()) throw new Error('Player provider id is required.');
  providers.set(provider.id, provider);
}

export function unregisterPlayerDataProvider(providerId: string) {
  providers.delete(providerId);
}

export function listPlayerDataProviders() {
  return Array.from(providers.values()).map(({ id, name }) => ({ id, name }));
}

export async function searchPlayersAcrossProviders(query: string) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  const settled = await Promise.allSettled(
    Array.from(providers.values()).map(async (provider) => {
      const results = await provider.search(cleanQuery);
      return results.map((candidate) => ({ ...candidate, providerId: provider.id }));
    })
  );

  return settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export async function fetchNormalizedPlayerPack(providerId: string, externalId: string): Promise<PlayerPackV1> {
  const provider = providers.get(providerId);
  if (!provider) throw new Error(`Unknown player data provider: ${providerId}`);

  const raw = await provider.fetchPlayer(externalId);
  const normalized = provider.normalize(raw);
  const result = PlayerPackSchema.safeParse(normalized);

  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    throw new Error(`Provider ${provider.name} returned an invalid Player Pack: ${details}`);
  }

  return result.data as PlayerPackV1;
}

/**
 * Small in-memory provider intended for tests, demos and manually curated datasets.
 * It performs no scraping and makes no network requests.
 */
export class StaticPlayerDataProvider implements PlayerDataProvider {
  id: string;
  name: string;
  private records: Record<string, PlayerPackV1>;

  constructor(id: string, name: string, records: Record<string, PlayerPackV1>) {
    this.id = id;
    this.name = name;
    this.records = records;
  }

  async search(query: string): Promise<PlayerSearchCandidate[]> {
    const q = query.toLocaleLowerCase();
    return Object.entries(this.records)
      .filter(([, pack]) => pack.player.name.toLocaleLowerCase().includes(q))
      .map(([externalId, pack]) => ({
        providerId: this.id,
        externalId,
        name: pack.player.name,
        club: typeof pack.player.club === 'string' ? pack.player.club : undefined,
        nationality: typeof pack.player.nationality === 'string' ? pack.player.nationality : undefined,
      }));
  }

  async fetchPlayer(externalId: string): Promise<unknown> {
    const record = this.records[externalId];
    if (!record) throw new Error(`Player ${externalId} was not found.`);
    return JSON.parse(JSON.stringify(record));
  }

  normalize(raw: unknown): PlayerPackV1 {
    const result = PlayerPackSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', '));
    }
    return result.data as PlayerPackV1;
  }
}
