const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'EditorialHeader.tsx');
let code = fs.readFileSync(file, 'utf8');

// Change padding in pills
// old: py-1.5 px-3 or py-1 px-2.5 
// let's search for the badges rendering
code = code.replace(
  /className=\{(?:\s*)\`(?:\s*)flex items-center gap-1\.5 px-3 py-1\.5/g,
  "className={`flex items-center gap-2 px-4 py-2"
);

code = code.replace(
  /className=\{(?:\s*)\`(?:\s*)flex items-center gap-1\.5 px-2\.5 py-1/g,
  "className={`flex items-center gap-2 px-3 py-1.5"
);

// If there's a text-xs, we might make it slightly larger or just increase tracking
code = code.replace(
  /text-\[11px\] font-bold/g,
  "text-[12px] font-bold"
);

fs.writeFileSync(file, code);
