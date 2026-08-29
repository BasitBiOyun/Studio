import { z } from 'zod';

export const PlayerPackSchema = z.object({
  schemaVersion: z.string().optional(),
  player: z.object({
    name: z.string().optional(),
    age: z.union([z.string(), z.number()]).optional(),
    nationality: z.string().optional(),
    club: z.string().optional(),
    preferredFoot: z.string().optional(),
    height: z.string().optional(),
    positions: z.string().optional(),
  }).optional(),
  context: z.object({
    season: z.string().optional(),
    league: z.string().optional(),
  }).optional(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      percentile: z.number().optional(),
      provenance: z.any().optional(),
    })
  ).optional(),
  scoutingSummary: z.string().optional(),
  tacticalProfile: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  developmentAreas: z.array(z.string()).optional(),
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
