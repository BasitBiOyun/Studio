const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'LogosLayer.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /data-moveable-id=\{\`logo-\$\{logo\.id \|\| index\}\`\} className="moveable-target/,
  "data-moveable-id={`logo-${logo.id || index}`} data-x={logo.x || 0} data-y={logo.y || 0} data-scale={1} className=\"moveable-target"
);

fs.writeFileSync(file, code);
