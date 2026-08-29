const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'TransferGraphicView.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const isWide')) {
  code = code.replace(/const fontDisplay = advancedLayout\?\.fontDisplay \|\| "'Barlow Condensed', sans-serif";/, 
    "const fontDisplay = advancedLayout?.fontDisplay || \"'Barlow Condensed', sans-serif\";\n  const isWide = project.aspectRatio === '16:9';");
}

code = code.replace(/className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none"/, 
  "className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}");

code = code.replace(/className="flex-1 my-6 flex flex-col justify-center max-w-\[650px\]"/, 
  "className={`flex-1 ${isWide ? 'my-2 max-w-[550px]' : 'my-6 max-w-[650px]'} flex flex-col justify-center`}");

code = code.replace(/className="rounded-2xl p-6 border backdrop-blur-md shadow-xl flex flex-col gap-4"/, 
  "className={`rounded-2xl ${isWide ? 'p-4 gap-2.5' : 'p-6 gap-4'} border backdrop-blur-md shadow-xl flex flex-col`}");

code = code.replace(/className="text-\[18px\] text-white font-medium"/,
  "className={`text-white font-medium ${isWide ? 'text-[15px]' : 'text-[18px]'}`}");

code = code.replace(/size=\{20\}/g, "size={isWide ? 16 : 20}");
code = code.replace(/size=\{18\}/g, "size={isWide ? 14 : 18}");

fs.writeFileSync(file, code);
