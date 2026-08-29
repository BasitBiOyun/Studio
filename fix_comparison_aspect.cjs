const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'PlayerComparisonView.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const isWide')) {
  code = code.replace(/const fontDisplay = advancedLayout\?\.fontDisplay \|\| "'Barlow Condensed', sans-serif";/, 
    "const fontDisplay = advancedLayout?.fontDisplay || \"'Barlow Condensed', sans-serif\";\n  const isWide = project.aspectRatio === '16:9';");
}

code = code.replace(/className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none"/, 
  "className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}");

code = code.replace(/className="flex-1 my-6 flex flex-col justify-center gap-6 max-w-\[2000px\] mx-auto w-full"/, 
  "className={`flex-1 ${isWide ? 'my-3 gap-3' : 'my-6 gap-6'} flex flex-col justify-center max-w-[2000px] mx-auto w-full`}");

code = code.replace(/className="grid grid-cols-12 gap-8 items-center"/, 
  "className={`grid grid-cols-12 ${isWide ? 'gap-4' : 'gap-8'} items-center`}");

code = code.replace(/className="col-span-5 rounded-2xl p-6 border backdrop-blur-md shadow-xl flex items-center justify-between"/g, 
  "className={`col-span-5 rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl flex items-center justify-between`}");

code = code.replace(/className="rounded-2xl p-6 border backdrop-blur-md flex flex-col gap-4 shadow-2xl"/, 
  "className={`rounded-2xl ${isWide ? 'p-4 gap-2' : 'p-6 gap-4'} border backdrop-blur-md flex flex-col shadow-2xl`}");

code = code.replace(/className="grid grid-cols-12 gap-4 items-center py-2\.5 border-b border-neutral-800\/60 last:border-0"/g, 
  "className={`grid grid-cols-12 ${isWide ? 'gap-2 py-1.5' : 'gap-4 py-2.5'} items-center border-b border-neutral-800/60 last:border-0`}");

fs.writeFileSync(file, code);
