const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'EditorialFooter.tsx');
let code = fs.readFileSync(file, 'utf8');

// Remove uppercase from left side
code = code.replace(
  /className="text-\[15px\] font-bold tracking-wider text-neutral-400 uppercase"/,
  'className="text-[15px] font-bold tracking-wider text-neutral-400"'
);

// Remove uppercase from right side
code = code.replace(
  /className="text-\[15px\] font-black tracking-widest text-neutral-300 uppercase"/,
  'className="text-[15px] font-black tracking-widest text-neutral-300"'
);

// Remove the BBO badge block completely
code = code.replace(
  /\s*<div\s*className="px-2\.5 py-0\.5 rounded text-\[11px\] font-black uppercase tracking-widest text-black shadow-md font-mono"[\s\S]*?>\s*BBO\s*<\/div>/,
  ''
);

fs.writeFileSync(file, code);
