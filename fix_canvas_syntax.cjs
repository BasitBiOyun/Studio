const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'InteractiveCanvas.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync(file, code);
