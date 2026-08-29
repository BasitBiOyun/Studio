const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'EditorialStatCard.tsx');

let code = fs.readFileSync(file, 'utf8');

code = code.replace(/p-5 flex flex-col/, 'p-4 flex flex-col');
code = code.replace(/valLength > 6 \? '42px' : valLength > 4 \? '52px' : '62px'/, "valLength > 6 ? '38px' : valLength > 4 ? '46px' : '54px'");
code = code.replace(/w-10 h-10 rounded-xl/, 'w-8 h-8 rounded-lg');
code = code.replace(/size=\{22\}/, 'size={18}');
code = code.replace(/text-\[15px\]/, 'text-[13.5px]');

fs.writeFileSync(file, code);
