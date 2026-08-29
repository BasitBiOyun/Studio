const fs = require('fs');
const path = require('path');

let file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/keyof Project\['logos'\]\[0\]/g, "keyof typeof logos[0]");
fs.writeFileSync(file, code);

file = path.join(__dirname, 'src', 'App.tsx');
code = fs.readFileSync(file, 'utf8');
code = code.replace(/proj\.player\?\.name/g, 'proj.sharedData?.player?.name');
code = code.replace(/currentProject\.player\?\.name/g, 'currentProject.sharedData?.player?.name');
code = code.replace(/currentProject\.player\.name/g, 'currentProject.sharedData?.player?.name');
fs.writeFileSync(file, code);

file = path.join(__dirname, 'src', 'components', 'ProjectLibraryModal.tsx');
code = fs.readFileSync(file, 'utf8');
code = code.replace(/p\.player\?\.name/g, 'p.sharedData?.player?.name');
code = code.replace(/p\.player\.name/g, 'p.sharedData?.player?.name');
fs.writeFileSync(file, code);
