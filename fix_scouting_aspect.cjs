const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'ScoutingReportView.tsx');
let code = fs.readFileSync(file, 'utf8');

// Insert isWide definition
if (!code.includes('const isWide')) {
  code = code.replace(/const visualMode = project\.visualMode \|\| 'editorial';/, 
    "const visualMode = project.visualMode || 'editorial';\n  const isWide = project.aspectRatio === '16:9';");
}

// Replace spacing
code = code.replace(/p-10 md:p-12/g, "${isWide ? 'p-6' : 'p-10 md:p-12'}");
code = code.replace(/gap-6 my-3/g, "${isWide ? 'gap-3 my-1' : 'gap-6 my-3'}");
code = code.replace(/gap-3\.5 max-w-\[700px\]/g, "${isWide ? 'gap-2 max-w-[550px]' : 'gap-3.5 max-w-[700px]'}");
code = code.replace(/p-4/g, "${isWide ? 'p-2.5' : 'p-4'}");
code = code.replace(/text-\[13\.5px\]/g, "${isWide ? 'text-[11px]' : 'text-[13.5px]'}");
code = code.replace(/text-\[15\.5px\]/g, "${isWide ? 'text-[13px]' : 'text-[15.5px]'}");
code = code.replace(/text-\[12px\]/g, "${isWide ? 'text-[10px]' : 'text-[12px]'}");
code = code.replace(/text-\[11\.5px\]/g, "${isWide ? 'text-[10px]' : 'text-[11.5px]'}");
code = code.replace(/size=\{16\}/g, "size={isWide ? 14 : 16}");
code = code.replace(/size=\{15\}/g, "size={isWide ? 13 : 15}");

code = code.replace(/className="relative z-20/g, 'className={`relative z-20');
code = code.replace(/select-none">/g, 'select-none`}>');

code = code.replace(/className="flex-1/g, 'className={`flex-1');
code = code.replace(/items-center">/g, 'items-center`}>');

code = code.replace(/className="\$\{leftColSpan\} flex flex-col/g, 'className={`${leftColSpan} flex flex-col');
code = code.replace(/max-w-\[700px\]\}/, "max-w-[700px]'}`}"); // we already replaced it so this regex is messy. Let's do it safer.

fs.writeFileSync(file, code);
