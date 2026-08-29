const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'LogosLayer.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('data-moveable-id')) {
  code = code.replace(
    /className="flex items-center justify-center"/,
    "data-moveable-id={`logo-${logo.id || index}`} className=\"moveable-target flex items-center justify-center pointer-events-auto\""
  );
  fs.writeFileSync(file, code);
}
