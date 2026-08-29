
import { ProjectSchema } from './schema';
import { Project, BrandSettings, DesignReferenceItem } from '../types';
import { DEFAULT_PROJECT, DEFAULT_BRAND_SETTINGS, INITIAL_DESIGN_REFERENCES, THEME_PRESETS } from '../constants/presets';
import { db } from './db';

const STORAGE_KEY_CURRENT = 'bbo_current_project';
const STORAGE_KEY_LIST = 'bbo_projects_library';
const STORAGE_KEY_BRAND = 'bbo_brand_settings';
const STORAGE_KEY_REFERENCES = 'bbo_design_references';

export function migrateProject(p: any): Project {
  if (p && p.sharedData && p.templates) {
    return { 
      ...DEFAULT_PROJECT, 
      ...p,
      sharedData: {
        ...DEFAULT_PROJECT.sharedData,
        ...p.sharedData,
        player: { ...DEFAULT_PROJECT.sharedData.player, ...(p.sharedData.player || {}) },
        credits: { ...DEFAULT_PROJECT.sharedData.credits, ...(p.sharedData.credits || {}) }
      },
      templates: {
        ...DEFAULT_PROJECT.templates,
        ...p.templates
      }
    };
  }
  return { ...DEFAULT_PROJECT, id: p?.id || DEFAULT_PROJECT.id };
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
          const count = await db.projects.where('id').equals(p.id).count();
          if (count === 0) {
            await db.projects.put(migrateProject(p));
          }
        }
      }
    } catch(e) {}
  }
  
  const rawCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
  if (rawCurrent) {
    try {
      const p = JSON.parse(rawCurrent);
      await db.settings.put({ id: 'current_project_id', data: p.id });
    } catch(e) {}
  }

  const rawBrand = localStorage.getItem(STORAGE_KEY_BRAND);
  if (rawBrand) {
    try {
      await db.settings.put({ id: 'brand_settings', data: JSON.parse(rawBrand) });
    } catch(e) {}
  }

  const rawRefs = localStorage.getItem(STORAGE_KEY_REFERENCES);
  if (rawRefs) {
    try {
      await db.settings.put({ id: 'design_references', data: JSON.parse(rawRefs) });
    } catch(e) {}
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
  
  // if no current, get latest
  const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
  if (projects.length > 0) return migrateProject(projects[0]);

  return { ...DEFAULT_PROJECT };
}

export async function saveCurrentProject(project: Project): Promise<void> {
  await ensureMigrated();
  const updated = { ...project, updatedAt: Date.now() };
  await db.projects.put(updated);
  await db.settings.put({ id: 'current_project_id', data: updated.id });
}

export async function loadProjectsList(): Promise<Project[]> {
  await ensureMigrated();
  const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
  if (projects.length === 0) {
    const initial = [{ ...DEFAULT_PROJECT }];
    await db.projects.put(initial[0]);
    return initial;
  }
  return projects.map(migrateProject);
}

export async function updateProjectInList(project: Project): Promise<void> {
  await saveCurrentProject(project);
}

export async function createNewProjectFromBrand(brand: BrandSettings, templateType = 'scouting-report'): Promise<Project> {
  const newId = `project-${Date.now()}`;
  const base = { ...DEFAULT_PROJECT };
  const customTheme = {
    name: `${brand.brandName} Custom`,
    primaryAccent: brand.defaultPrimaryColor,
    secondaryAccent: brand.defaultSecondaryColor,
    bg1: brand.defaultBg1,
    bg2: brand.defaultBg2,
    mainText: brand.defaultMainText,
    mutedText: brand.defaultMutedText,
    textAccent: brand.defaultMainText,
    pattern: 'tactical-lines' as const,
    gradientAngle: 135,
  };
  const newProject: Project = {
    ...base,
    id: newId,
    name: `New ${templateType.replace('-', ' ').toUpperCase()} Graphic`,
    templateType: templateType as any,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.projects.put(newProject);
  await saveCurrentProject(newProject);
  return newProject;
}

export async function duplicateProjectInList(id: string): Promise<Project | null> {
  const target = await db.projects.get(id);
  if (!target) return null;
  const copy: Project = {
    ...JSON.parse(JSON.stringify(target)),
    id: `copy-${Date.now()}`,
    name: `${target.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.projects.put(copy);
  await saveCurrentProject(copy);
  return copy;
}

export async function deleteProjectFromList(id: string): Promise<Project[]> {
  await db.projects.delete(id);
  return await loadProjectsList();
}

export function exportProjectToJson(project: Project): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const filename = `${(project.sharedData?.player?.name || project.name || 'graphic').trim().replace(/[^a-zA-Z0-9_-]/g, '_')}_bbo_card.json`;
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
          throw new Error("Invalid project structure");
        }
        
        const migrated = migrateProject(result.data);
        migrated.id = `imported-${Date.now()}`;
        migrated.updatedAt = Date.now();
        await db.projects.put(migrated);
        await saveCurrentProject(migrated);
        resolve(migrated);
      } catch (err) {
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
  if (obj && obj.data) return { ...DEFAULT_BRAND_SETTINGS, ...obj.data };
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
  return INITIAL_DESIGN_REFERENCES;
}

export async function saveDesignReferences(refs: DesignReferenceItem[]): Promise<void> {
  await ensureMigrated();
  await db.settings.put({ id: 'design_references', data: refs });
}
