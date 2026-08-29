const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'types.ts');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('provenance?:')) {
  const replaceStr = `  id: string;
  label: string;
  value: string;
  subValue?: string;
  icon?: string;
  provenance?: {
    source?: string;
    sourceUrl?: string;
    competition?: string;
    season?: string;
    sampleSize?: string;
    retrievedAt?: string;
    verified?: boolean;
    type?: 'imported' | 'manual' | 'calculated';
  };`;

  code = code.replace(
    /id: string;\s*label: string;\s*value: string;\s*subValue\?: string;\s*icon\?: string;/,
    replaceStr
  );
  fs.writeFileSync(file, code);
}
