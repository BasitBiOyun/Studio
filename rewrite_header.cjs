const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'EditorialHeader.tsx');

let code = fs.readFileSync(file, 'utf8');

// The pills currently have:
// className="flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md shadow-md"
// span 1: text-[11px] font-black uppercase tracking-wider text-neutral-400
// span 2: text-[13.5px] font-bold text-white tracking-wide

const pillWrapperRegex = /className="flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md shadow-md"/g;
code = code.replace(pillWrapperRegex, 'className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border backdrop-blur-md shadow-md"');

const pillLabelRegex = /text-\[11px\] font-black uppercase tracking-wider text-neutral-400/g;
code = code.replace(pillLabelRegex, 'text-[11.5px] font-black uppercase tracking-wider text-neutral-400');

const pillValueRegex = /text-\[13\.5px\] font-bold text-white tracking-wide/g;
code = code.replace(pillValueRegex, 'text-[14.5px] font-bold text-white tracking-wide whitespace-nowrap');

fs.writeFileSync(file, code);
