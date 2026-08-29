const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'services', 'storage.ts');
let code = fs.readFileSync(file, 'utf8');

// Replace migrateProject
code = code.replace(/function migrateProject\(p: any\): Project \{[\s\S]*?return merged;\n\}/m, 
`function migrateProject(p: any): Project {
  if (p && p.sharedData && p.templates) {
    return { ...DEFAULT_PROJECT, ...p };
  }
  return { ...DEFAULT_PROJECT, id: p.id || DEFAULT_PROJECT.id };
}`);

// Fix exportProjectToJson
code = code.replace(/project\.player\.name/g, 'project.sharedData.player.name');

// In createNewProjectFromBrand
code = code.replace(/theme: customTheme,/g, '');
code = code.replace(/credits: \{[\s\S]*?\},/m, '');
code = code.replace(/advancedLayout: \{[\s\S]*?\},/m, '');

fs.writeFileSync(file, code);
console.log('storage fixed');
