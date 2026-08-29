import Dexie, { Table } from 'dexie';
import { Project } from '../types';

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
  }
}

export const db = new AppDatabase();
