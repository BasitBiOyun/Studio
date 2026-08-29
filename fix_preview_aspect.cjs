const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'MatchPreviewView.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const isWide')) {
  code = code.replace(/const fontDisplay = advancedLayout\?\.fontDisplay \|\| "'Barlow Condensed', sans-serif";/, 
    "const fontDisplay = advancedLayout?.fontDisplay || \"'Barlow Condensed', sans-serif\";\n  const isWide = project.aspectRatio === '16:9';");
}

code = code.replace(/className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none"/, 
  "className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}");

code = code.replace(/className="flex-1 my-6 flex flex-col justify-center gap-6 max-w-\[1900px\]"/, 
  "className={`flex-1 ${isWide ? 'my-3 gap-3' : 'my-6 gap-6'} flex flex-col justify-center max-w-[1900px]`}");

code = code.replace(/className="grid grid-cols-2 gap-8"/, 
  "className={`grid ${isWide ? 'grid-cols-2 gap-4' : 'grid-cols-2 gap-8'}`}");

code = code.replace(/className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"/g, 
  "className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}");

fs.writeFileSync(file, code);
