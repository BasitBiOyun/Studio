const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'ScoutingReportView.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/text-\[11\.5px\]/g, "${isWide ? 'text-[10px]' : 'text-[11.5px]'}");
code = code.replace(/text-\[13\.5px\]/g, "${isWide ? 'text-[11px]' : 'text-[13.5px]'}");
code = code.replace(/text-\[12px\]/g, "${isWide ? 'text-[10px]' : 'text-[12px]'}");
code = code.replace(/text-\[15\.5px\]/g, "${isWide ? 'text-[13px]' : 'text-[15.5px]'}");

code = code.replace(/className="text-\[10px\]/g, 'className={`text-[10px]');
code = code.replace(/className="text-\[11\.5px\]/g, 'className={`text-[11.5px]');
code = code.replace(/className="text-\[13px\]/g, 'className={`text-[13px]');
code = code.replace(/className="text-\[15\.5px\]/g, 'className={`text-[15.5px]');

fs.writeFileSync(file, code);
