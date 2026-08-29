const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'ProjectLibraryModal.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const brand = loadBrandSettings\(\);/g, 'const brand = await loadBrandSettings();');

fs.writeFileSync(file, code);
