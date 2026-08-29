const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'design', 'EditorialHeader.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /metaBadges\?: \{ label: string; value: string \}\[\];/,
  'metaBadges?: { label: string; value: React.ReactNode }[];'
);

fs.writeFileSync(file, code);

const scoutingViewFile = path.join(__dirname, 'src', 'components', 'templates', 'ScoutingReportView.tsx');
let scoutingView = fs.readFileSync(scoutingViewFile, 'utf8');

scoutingView = scoutingView.replace(
  /\{ label: 'Nat', value: player\.countryFlag \? \`\$\{player\.countryFlag\} \$\{player\.nationality\}\` : player\.nationality \}/,
  "{ label: 'Nat', value: player.countryFlag ? <span className=\"flex items-center gap-1.5\"><span className={`fi fi-${player.countryFlag.toLowerCase()} text-[1.1em] drop-shadow-sm`}></span>{player.nationality}</span> : player.nationality }"
);

fs.writeFileSync(scoutingViewFile, scoutingView);
