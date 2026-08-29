const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'EditorialStatCard.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace("const valFontSize = valLength > 6 ? '38px' : valLength > 4 ? '46px' : '54px';", "const valFontSize = valLength > 6 ? '34px' : valLength > 4 ? '40px' : '48px';");
code = code.replace("rounded-2xl p-4 flex", "rounded-2xl p-3 flex");
code = code.replace("mb-4", "mb-2");
code = code.replace("w-8 h-8", "w-7 h-7");
code = code.replace("size={18}", "size={16}");
code = code.replace("text-[13.5px]", "text-[12px]");

fs.writeFileSync(file, code);
