const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('import { COUNTRIES }')) {
  code = code.replace(/import \{ CANVAS_DIMENSIONS \} from '\.\.\/constants\/presets';/, 
    "import { CANVAS_DIMENSIONS } from '../constants/presets';\nimport { COUNTRIES } from '../constants/countries';");
}

const target = `onChange={(e) =>
                            updateShared({ player: { ...player, nationality: e.target.value } })
                          }`;
const replacement = `onChange={(e) => {
                            const val = e.target.value;
                            const matched = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase());
                            updateShared({ 
                              player: { 
                                ...player, 
                                nationality: val, 
                                ...(matched ? { countryFlag: matched.flag } : {})
                              } 
                            });
                          }}`;
                          
code = code.replace(target, replacement);
fs.writeFileSync(file, code);
