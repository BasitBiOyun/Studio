const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'PlayerPhotoLayer.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /data-moveable-id=\{isSecondary \? 'secondary-image' : 'primary-image'\} className=\{\`moveable-target/,
  "data-moveable-id={isSecondary ? 'secondary-image' : 'primary-image'} data-x={transform.x} data-y={transform.y} data-scale={transform.scale} className={`moveable-target"
);

fs.writeFileSync(file, code);
