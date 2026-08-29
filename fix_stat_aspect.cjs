const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'StatHighlightView.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const isWide')) {
  code = code.replace(/const fontDisplay = advancedLayout\?\.fontDisplay \|\| "'Barlow Condensed', sans-serif";/, 
    "const fontDisplay = advancedLayout?.fontDisplay || \"'Barlow Condensed', sans-serif\";\n  const isWide = project.aspectRatio === '16:9';");
}

code = code.replace(/className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none"/, 
  "className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}");

fs.writeFileSync(file, code);
