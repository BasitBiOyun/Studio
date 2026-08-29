const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'constants', 'presets.ts');
let code = fs.readFileSync(file, 'utf8');

// Update DEFAULT_CREDITS in presets
code = code.replace(
  "visualBy: 'Visual by @BasitBiOyun',",
  "visualBy: '@EmirScouts | BasitBiOyun',"
);
code = code.replace(
  "preparedFor: 'Scouting Department',",
  "preparedFor: 'Football Editorial Analytics',"
);

fs.writeFileSync(file, code);

const typesFile = path.join(__dirname, 'src', 'types.ts');
let types = fs.readFileSync(typesFile, 'utf8');
types = types.replace(
  "visualBy: 'Visual by @BasitBiOyun'",
  "visualBy: '@EmirScouts | BasitBiOyun'"
);
fs.writeFileSync(typesFile, types);
