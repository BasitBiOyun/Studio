import Dexie, { Table } from 'dexie';
import { Project, BrandSettings, DesignReferenceItem } from '../types';

export class AppDatabase extends Dexie {
  projects!: Table<Project, string>;
  settings!: Table<{ id: string; data: any }, string>;

  constructor() {
    super('FootballStudioDB');
    this.version(1).stores({
      projects: 'id, updatedAt', // Primary key and indexed props
      settings: 'id'
    });
  }
}

export const db = new AppDatabase();
