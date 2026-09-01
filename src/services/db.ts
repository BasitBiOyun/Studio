import Dexie, { Table } from 'dexie';
import { Project } from '../types';

export type AssetKind = 'player-cutout' | 'club-logo' | 'competition-logo' | 'custom-image';

export interface AssetLibraryRecord {
  id: string;
  name: string;
  kind: AssetKind;
  dataUrl: string;
  mimeType: string;
  hash: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectVersionRecord {
  id: string;
  projectId: string;
  createdAt: number;
  fingerprint: string;
  project: Project;
}

export class AppDatabase extends Dexie {
  projects!: Table<Project, string>;
  settings!: Table<{ id: string; data: any }, string>;
  projectVersions!: Table<ProjectVersionRecord, string>;
  assets!: Table<AssetLibraryRecord, string>;

  constructor() {
    super('FootballStudioDB');

    this.version(1).stores({
      projects: 'id, updatedAt',
      settings: 'id',
    });

    this.version(2).stores({
      projects: 'id, updatedAt',
      settings: 'id',
      projectVersions: 'id, projectId, createdAt, [projectId+createdAt]',
    });

    this.version(3).stores({
      projects: 'id, updatedAt',
      settings: 'id',
      projectVersions: 'id, projectId, createdAt, [projectId+createdAt]',
      assets: 'id, kind, name, hash, updatedAt, [kind+hash]',
    });
  }
}

export const db = new AppDatabase();
