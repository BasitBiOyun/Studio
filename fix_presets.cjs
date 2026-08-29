const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'constants', 'presets.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/'Visual by @BasitBiOyun'/g, "'Visual by BasitBiOyun'");
code = code.replace(/'Prepared for @EmirScouts'/g, "'Prepared for @EmirScouts'");

fs.writeFileSync(file, code);
