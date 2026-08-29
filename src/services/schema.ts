import { z } from 'zod';

export const ProvenanceSchema = z.object({
  source: z.string().optional(),
  provider: z.string().optional(),
  sourceUrl: z.string().optional(),
  url: z.string().optional(),
  competition: z.string().optional(),
  season: z.string().optional(),
  sampleSize: z.union([z.string(), z.number()]).optional(),
  minutes: z.union([z.string(), z.number()]).optional(),
  retrievedAt: z.string().optional(),
  status: z.enum(['verified', 'manual', 'derived', 'calculated', 'missing', 'missing-source']).optional(),
  verified: z.boolean().optional(),
}).passthrough();

const NationalitySchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    code: z.string().optional(),
  }).passthrough(),
]);

const ClubSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    country: z.string().optional(),
    wikidataId: z.string().nullable().optional(),
  }).passthrough(),
]);

export const PlayerPackSchema = z.object({
  schemaVersion: z.literal('player-pack-v1'),
  type: z.string().optional(),
  generatedAt: z.string().optional(),
  player: z.object({
    name: z.string(),
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    age: z.union([z.string(), z.number()]).optional(),
    nationality: NationalitySchema.optional(),
    nationalityCode: z.string().optional(),
    countryCode: z.string().optional(),
    club: ClubSchema.optional(),
    preferredFoot: z.string().optional(),
    height: z.string().optional(),
    heightCm: z.union([z.string(), z.number()]).optional(),
    positions: z.union([z.string(), z.array(z.string())]).optional(),
    primaryPosition: z.string().optional(),
  }).passthrough(),
  context: z.object({
    season: z.string().optional(),
    league: z.string().optional(),
    competition: z.string().optional(),
    scope: z.string().optional(),
    asOf: z.string().optional(),
  }).passthrough().optional(),
  stats: z.array(
    z.object({
      key: z.string().optional(),
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      percentile: z.union([z.string(), z.number()]).nullable().optional(),
      percentileRank: z.union([z.string(), z.number()]).nullable().optional(),
      icon: z.string().optional(),
      subValue: z.string().optional(),
      source: z.string().optional(),
      sourceUrl: z.string().optional(),
      competition: z.string().optional(),
      season: z.string().optional(),
      sampleSize: z.union([z.string(), z.number()]).optional(),
      retrievedAt: z.string().optional(),
      status: z.enum(['verified', 'manual', 'derived', 'calculated', 'missing', 'missing-source']).optional(),
      calculation: z.string().optional(),
      provenance: ProvenanceSchema.optional(),
    }).passthrough()
  ).optional(),
  scouting: z.object({
    headline: z.string().optional(),
    summary: z.string().optional(),
    tacticalProfile: z.string().optional(),
    strengths: z.array(z.string()).optional(),
    development: z.array(z.string()).optional(),
  }).passthrough().optional(),
  scoutingSummary: z.string().optional(),
  tacticalProfile: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  developmentAreas: z.array(z.string()).optional(),
  seasonSummary: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).optional(),
  roleProfile: z.any().optional(),
  sources: z.array(ProvenanceSchema).optional(),
  metadata: z.any().optional(),
}).passthrough();

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  templateType: z.string(),
  aspectRatio: z.string().optional(),
  visualMode: z.string().optional(),
  sharedData: z.any().optional(),
  templates: z.any().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
}).passthrough();
