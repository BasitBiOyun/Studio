const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/className = '' \} \}\) => \{/g, "className = ''\n}) => {");
code = code.replace(/credits: credits \} \}\);/g, 'credits });');
code = code.replace(/templateType: newType \} \}\);/g, 'templateType: newType });');
code = code.replace(/aspectRatio: ratio \} \}\);/g, 'aspectRatio: ratio });');

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*secondaryImageSrc:\s*result\s*\}\s*\}\);/g, 'updateVisuals({ secondaryPlayerImageSrc: result });');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*playerImageSrc:\s*result\s*\}\s*\}\);/g, 'updateVisuals({ playerImageSrc: result });');

fs.writeFileSync(file, code);
