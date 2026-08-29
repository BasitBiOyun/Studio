const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*development:\s*\[\.\.\.development,\s*'New Area to Improve'\]\s*\}\s*\}\)/g, 
  "updateContent({ development: [...development, 'New Area to Improve'] })");

// Let's also check locked
code = code.replace(/updateLayout\(\{\s*\.\.\.advancedLayout,\s*locked:\s*!advancedLayout\?\.locked\s*\}\s*\)\s*\}/g,
  "updateLayout({ ...advancedLayout, locked: !advancedLayout?.locked }) }");

// Check the other ones:
code = code.replace(/updateLayout\(\{\s*\.\.\.advancedLayout,\s*grainEnabled:\s*!advancedLayout\?\.grainEnabled\s*\)\s*\}/g,
  "updateLayout({ ...advancedLayout, grainEnabled: !advancedLayout?.grainEnabled }) }");

code = code.replace(/\}\s*\}\s*\)/g, '} })');
// No that's too broad.

fs.writeFileSync(file, code);
