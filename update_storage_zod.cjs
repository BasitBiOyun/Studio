const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'services', 'storage.ts');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { ProjectSchema }")) {
  code = code.replace("import {", "import { ProjectSchema } from './schema';\nimport {");
}

code = code.replace(
  /export async function importProjectFromJson\(file: File\): Promise<Project> \{[\s\S]*?\}\);\n\}/,
  `export async function importProjectFromJson(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Zod validation
        const result = ProjectSchema.safeParse(parsed);
        if (!result.success) {
          throw new Error("Invalid project structure");
        }
        
        const migrated = migrateProject(result.data);
        migrated.id = \`imported-\${Date.now()}\`;
        migrated.updatedAt = Date.now();
        updateProjectInList(migrated);
        saveCurrentProject(migrated);
        resolve(migrated);
      } catch (err) {
        reject(new Error('Invalid project JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}`
);

fs.writeFileSync(file, code);
