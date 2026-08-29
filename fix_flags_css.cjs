const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'index.css');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('flag-icons.min.css')) {
  code = `@import 'flag-icons/css/flag-icons.min.css';\n` + code;
  fs.writeFileSync(file, code);
}
