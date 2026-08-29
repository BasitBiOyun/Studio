const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/IconShieldCheck,/, 'IconShieldCheck,\n  IconInfoCircle,\n  IconShieldX,\n  IconUserEdit,\n  IconAlertCircle,');

fs.writeFileSync(file, code);
