import { ProjectSchema } from './schema';
import { Project, BrandSettings, DesignReferenceItem, TemplateType } from '../types';
import { DEFAULT_PROJECT, DEFAULT_BRAND_SETTINGS, INITIAL_DESIGN_REFERENCES } from '../constants/presets';
import { db } from './db';

const STORAGE_KEY_CURRENT = 'bbo_current_project';
const STORAGE_KEY_LIST = 'bbo_projects_library';
const STORAGE_KEY_BRAND = 'bbo_brand_settings';
const STORAGE_KEY_REFERENCES = 'bbo_design_references';

const TEMPLATE_TYPES = Object.keys(DEFAULT_PROJECT.templates) as TemplateType[];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T>(base: T, incoming: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(incoming)) {
    return incoming === undefined || incoming === null ? clone(base) : clone(incoming as T);
  }

  const result: Record<string, any> = clone(base as Record<string, any>);
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined) continue;
    if (isPlainObject(result[key]) && isPlainObject(value)) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = clone(value);
    }
  }
  return result as T;
}

export function migrateProject(input: any): Project {
  if (!input || typeof input !== 'object') return clone(DEFAULT_PROJECT);

  const migrated = deepMerge(DEFAULT_PROJECT, input);
  const requestedTemplate = input.templateType as TemplateType | undefined;
  migrated.templateType = requestedTemplate && TEMPLATE_TYPES.includes(requestedTemplate)
    ? requestedTemplate
    : 'scouting-report';

  if (!migrated.templates[migrated.templateType]) {
    migrated.templateType = 'scouting-report';
  }

  migrated.id = String(input.id || migrated.id || `project-${Date.now()}`);
  migrated.name = String(input.name || migrated.name || 'Untitled Graphic');
  migrated.createdAt = Number(input.createdAt) || migrated.createdAt || Date.now();
  migrated.updatedAt = Number(input.updatedAt) || migrated.updatedAt || Date.now();

  return migrated;
}

let migratedFromLocalStorage = false;
async function ensureMigrated() {
  if (migratedFromLocalStorage) return;

  const rawList = localStorage.getItem(STORAGE_KEY_LIST);
  if (rawList) {
    try {
      const list = JSON.parse(rawList);
      if (Array.isArray(list)) {
        for (const p of list) {
          if (!p?.id) continue;
          const count = await db.projects.where('id').equals(p.id).count();
          if (count === 0) {
            await db.projects.put(migrateProject(p));
          }
        }
      }
    } catch (error) {
      console.warn('Legacy project list migration failed.', error);
    }
  }

  const rawCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
  if (rawCurrent) {
    try {
      const p = JSON.parse(rawCurrent);
      if (p?.id) await db.settings.put({ id: 'current_project_id', data: p.id });
    } catch (error) {
      console.warn('Legacy current project migration failed.', error);
    }
  }

  const rawBrand = localStorage.getItem(STORAGE_KEY_BRAND);
  if (rawBrand) {
    try {
      await db.settings.put({ id: 'brand_settings', data: JSON.parse(rawBrand) });
    } catch (error) {
      console.warn('Legacy brand settings migration failed.', error);
    }
  }

  const rawRefs = localStorage.getItem(STORAGE_KEY_REFERENCES);
  if (rawRefs) {
    try {
      await db.settings.put({ id: 'design_references', data: JSON.parse(rawRefs) });
    } catch (error) {
      console.warn('Legacy design references migration failed.', error);
    }
  }

  migratedFromLocalStorage = true;
}

export async function loadCurrentProject(): Promise<Project> {
  await ensureMigrated();
  const currentIdObj = await db.settings.get('current_project_id');

  if (currentIdObj) {
    const proj = await db.projects.get(currentIdObj.data);
    if (proj) return migrateProject(proj);
  }

  const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
  if (projects.length > 0) return migrateProject(projects[0]);

  return clone(DEFAULT_PROJECT);
}

export async function saveCurrentProject(project: Project): Promise<void> {
  await ensureMigrated();
  const updated = migrateProject({ ...project, updatedAt: Date.now() });
  await db.projects.put(updated);
  await db.settings.put({ id: 'current_project_id', data: updated.id });
}

export async function loadProjectsList(): Promise<Project[]> {
  await ensureMigrated();
  const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
  if (projects.length === 0) {
    const initial = clone(DEFAULT_PROJECT);
    await db.projects.put(initial);
    return [initial];
  }
  return projects.map(migrateProject);
}

export async function updateProjectInList(project: Project): Promise<void> {
  await saveCurrentProject(project);
}

export async function createNewProjectFromBrand(
  brand: BrandSettings,
  templateType: TemplateType | string = 'scouting-report'
): Promise<Project> {
  const newId = `project-${Date.now()}`;
  const base = clone(DEFAULT_PROJECT);
  const safeTemplateType = TEMPLATE_TYPES.includes(templateType as TemplateType)
    ? templateType as TemplateType
    : 'scouting-report';

  const customTheme = {
    ...base.templates[safeTemplateType].theme,
    name: `${brand.brandName} Custom`,
    primaryAccent: brand.defaultPrimaryColor,
    secondaryAccent: brand.defaultSecondaryColor,
    bg1: brand.defaultBg1,
    bg2: brand.defaultBg2,
    mainText: brand.defaultMainText,
    mutedText: brand.defaultMutedText,
    textAccent: brand.defaultMainText,
  };

  for (const type of TEMPLATE_TYPES) {
    base.templates[type].theme = clone(customTheme);
  }

  base.sharedData.credits = {
    preparedFor: brand.defaultFooterLeft || base.sharedData.credits.preparedFor,
    visualBy: brand.defaultFooterRight || base.sharedData.credits.visualBy,
  };

  const newProject: Project = {
    ...base,
    id: newId,
    name: `New ${safeTemplateType.replace(/-/g, ' ').toUpperCase()} Graphic`,
    templateType: safeTemplateType,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.projects.put(newProject);
  await saveCurrentProject(newProject);
  return clone(newProject);
}

export async function duplicateProjectInList(id: string): Promise<Project | null> {
  const target = await db.projects.get(id);
  if (!target) return null;

  const copy = migrateProject({
    ...clone(target),
    id: `copy-${Date.now()}`,
    name: `${target.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  await db.projects.put(copy);
  await saveCurrentProject(copy);
  return clone(copy);
}

export async function deleteProjectFromList(id: string): Promise<Project[]> {
  await db.projects.delete(id);
  return loadProjectsList();
}

export function exportProjectToJson(project: Project): void {
  const jsonStr = JSON.stringify(migrateProject(project), null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const filename = `${(project.name || project.sharedData?.player?.name || 'graphic').trim().replace(/[^a-zA-Z0-9_-]/g, '_')}_bbo_card.json`;
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

export async function importProjectFromJson(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        const result = ProjectSchema.safeParse(parsed);
        if (!result.success) {
          throw new Error('Invalid project structure');
        }

        const migrated = migrateProject(result.data);
        migrated.id = `imported-${Date.now()}`;
        migrated.updatedAt = Date.now();
        await db.projects.put(migrated);
        await saveCurrentProject(migrated);
        resolve(clone(migrated));
      } catch (error) {
        console.error('Project import failed.', error);
        reject(new Error('Invalid project JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function loadBrandSettings(): Promise<BrandSettings> {
  await ensureMigrated();
  const obj = await db.settings.get('brand_settings');
  if (obj?.data) return { ...DEFAULT_BRAND_SETTINGS, ...obj.data };
  return { ...DEFAULT_BRAND_SETTINGS };
}

export async function saveBrandSettings(settings: BrandSettings): Promise<void> {
  await ensureMigrated();
  await db.settings.put({ id: 'brand_settings', data: settings });
}

export async function loadDesignReferences(): Promise<DesignReferenceItem[]> {
  await ensureMigrated();
  const obj = await db.settings.get('design_references');
  if (obj && Array.isArray(obj.data)) return obj.data;
  return clone(INITIAL_DESIGN_REFERENCES);
}

export async function saveDesignReferences(refs: DesignReferenceItem[]): Promise<void> {
  await ensureMigrated();
  await db.settings.put({ id: 'design_references', data: refs });
}
