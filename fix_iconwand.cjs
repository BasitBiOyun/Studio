const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('IconWand,')) {
  code = code.replace(
    "IconPalette,",
    "IconPalette,\n  IconWand,"
  );
  fs.writeFileSync(file, code);
}
