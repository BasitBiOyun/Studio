const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'templates', 'ScoutingReportView.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/max-w-\[550px\]/g, '');
code = code.replace(/max-w-\[700px\]/g, '');

fs.writeFileSync(file, code);
