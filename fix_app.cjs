const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/opacity: 0,/, '');

fs.writeFileSync(file, code);
