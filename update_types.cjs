const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'types.ts');
let code = fs.readFileSync(file, 'utf8');

const statItemProv = `
export interface StatProvenance {
  source?: string;
  sourceUrl?: string;
  competition?: string;
  season?: string;
  sampleSize?: string;
  retrievedAt?: string;
  status: 'verified' | 'manual' | 'calculated' | 'missing';
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: StatIconType;
  subValue?: string;
  percentileRank?: string;
  provenance?: StatProvenance;
}
`;

code = code.replace(/export interface StatItem \{[\s\S]*?\n\}/, statItemProv.trim());

const playerPackStatsRegex = /stats\?: \{\s*label: string;\s*value: string \| number;\s*percentile\?: number;\s*\}\[\];/;
const playerPackStatsReplace = `stats?: {
    label: string;
    value: string | number;
    percentile?: number;
    provenance?: Partial<StatProvenance>;
  }[];`;

code = code.replace(playerPackStatsRegex, playerPackStatsReplace);

fs.writeFileSync(file, code);
