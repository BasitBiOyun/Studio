const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/updateLayout\(\{\s*\.\.\.advancedLayout,\s*grainOpacity:\s*parseInt\(e\.target\.value\)\s*\}\s*\}\)/g, 
  "updateLayout({ ...advancedLayout, grainOpacity: parseInt(e.target.value) })");
  
code = code.replace(/updateLayout\(\{\s*\.\.\.advancedLayout,\s*locked:\s*!advancedLayout\?\.locked\s*\}\s*\}\)/g, 
  "updateLayout({ ...advancedLayout, locked: !advancedLayout?.locked })");

code = code.replace(/updateLayout\(\{\s*\.\.\.advancedLayout,\s*fontDisplay:\s*f\.val\s*\}\s*\}\)/g, 
  "updateLayout({ ...advancedLayout, fontDisplay: f.val })");

// Wait, let's also fix the last curly braces issue at the end of the file.
// The file is missing closing tags because a div/aside was destroyed.
fs.writeFileSync(file, code);
