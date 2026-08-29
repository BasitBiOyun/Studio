const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'services', 'storage.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/function migrateProject\(p: any\): Project \{[\s\S]*?return \{ \.\.\.DEFAULT_PROJECT, id: p\.id \|\| DEFAULT_PROJECT\.id \};\n\}/m, 
`function migrateProject(p: any): Project {
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
}`);

fs.writeFileSync(file, code);
console.log('migrateProject fixed');
