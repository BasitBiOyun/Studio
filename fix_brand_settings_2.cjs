const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'ProjectLibraryModal.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const created = createNewProjectFromBrand\(brand, 'scouting-report'\);/g, "const created = await createNewProjectFromBrand(brand, 'scouting-report');");

fs.writeFileSync(file, code);
