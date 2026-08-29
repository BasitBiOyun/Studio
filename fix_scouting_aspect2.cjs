const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'ScoutingReportView.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/className="relative z-20 w-full h-full flex flex-col justify-between p-10 md:p-12 select-none"/, 
  "className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-5' : 'p-10 md:p-12'} select-none`}");
  
code = code.replace(/className="flex-1 grid grid-cols-12 gap-6 my-3 items-center"/, 
  "className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-3 my-1' : 'gap-6 my-3'} items-center`}");
  
code = code.replace(/className=\{\`\$\{leftColSpan\} flex flex-col gap-3\.5 max-w-\[700px\]\`\}/, 
  "className={`${leftColSpan} flex flex-col ${isWide ? 'gap-2 max-w-[550px]' : 'gap-3.5 max-w-[700px]'}`}");
  
code = code.replace(/className="rounded-2xl p-4 border backdrop-blur-md shadow-xl"/, 
  "className={`rounded-2xl ${isWide ? 'p-2.5' : 'p-4'} border backdrop-blur-md shadow-xl`}");

code = code.replace(/className="rounded-2xl p-4 border backdrop-blur-md grid grid-cols-2 gap-4 shadow-2xl"/, 
  "className={`rounded-2xl ${isWide ? 'p-2.5 gap-2' : 'p-4 gap-4'} border backdrop-blur-md grid grid-cols-2 shadow-2xl`}");

code = code.replace(/className="rounded-2xl p-4 border backdrop-blur-md relative overflow-hidden shadow-2xl"/, 
  "className={`rounded-2xl ${isWide ? 'p-2.5' : 'p-4'} border backdrop-blur-md relative overflow-hidden shadow-2xl`}");

fs.writeFileSync(file, code);
