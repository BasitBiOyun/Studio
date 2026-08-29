const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace: updateShared({ player: { ...project.sharedData.player, name: e.target.value })
// With:    updateShared({ player: { ...project.sharedData.player, name: e.target.value } })

code = code.replace(/updateShared\(\{\s*player:\s*\{([^}]+)\}\s*\)/g, 'updateShared({ player: {$1} })');
code = code.replace(/updateShared\(\{\s*credits:\s*\{([^}]+)\}\s*\)/g, 'updateShared({ credits: {$1} })');
code = code.replace(/updateContent\(\{\s*profile:\s*\{([^}]+)\}\s*\)/g, 'updateContent({ profile: {$1} })');
code = code.replace(/updateContent\(\{\s*comparisonData:\s*\{([^}]+)\}\s*\)/g, 'updateContent({ comparisonData: {$1} })');
code = code.replace(/updateContent\(\{\s*transferData:\s*\{([^}]+)\}\s*\)/g, 'updateContent({ transferData: {$1} })');

// Check updateTheme
code = code.replace(/updateTheme\(\{\s*\.\.\.project\.theme,\s*([^\}]+)\}\)/g, 'updateTheme({ ...theme, $1})');

fs.writeFileSync(file, code);
