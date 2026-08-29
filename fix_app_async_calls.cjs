const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/saveCurrentProject\(currentProject\);/g, 'saveCurrentProject(currentProject).catch(console.error);');
code = code.replace(/saveCurrentProject\(resetProj\);/g, 'saveCurrentProject(resetProj).catch(console.error);');
code = code.replace(/saveCurrentProject\(proj\);/g, 'saveCurrentProject(proj).catch(console.error);');

// The file import handler:
code = code.replace(/const importedProj = await importProjectFromJson\(file\);/g, 'const importedProj = await importProjectFromJson(file);');

fs.writeFileSync(file, code);
