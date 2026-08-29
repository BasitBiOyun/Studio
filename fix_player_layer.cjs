const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'PlayerPhotoLayer.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('data-moveable-id')) {
  code = code.replace(
    /className=\{\`relative w-full h-full flex items-end justify-center/,
    "data-moveable-id={isSecondary ? 'secondary-image' : 'primary-image'} className={`moveable-target relative w-full h-full flex items-end justify-center"
  );
  fs.writeFileSync(file, code);
}
