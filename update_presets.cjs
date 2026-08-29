const fs = require('fs');
const path = require('path');

const presetsPath = path.join(__dirname, 'src', 'constants', 'presets.ts');
let content = fs.readFileSync(presetsPath, 'utf8');

// I will just construct a new DEFAULT_PROJECT and replace the old one.
// Let's read the current file and just do string replacements.

const replacement = `export const DEFAULT_PROJECT: Project = {
  id: 'sonko-kaa-gent',
  name: 'Momodou Sonko - Scouting Report',
  templateType: 'scouting-report',
  aspectRatio: '1:1',
  visualMode: 'editorial',
  createdAt: Date.now(),
  updatedAt: Date.now(),

  sharedData: {
    player: {
      name: 'Momodou Sonko',
      age: '21',
      nationality: 'Sweden',
      countryFlag: '🇸🇪',
      preferredFoot: 'Right Foot',
      height: '176 cm',
      positions: 'LW / RW',
      club: 'KAA Gent',
    },
    credits: {
      preparedFor: 'Prepared for @EmirScouts',
      visualBy: 'Visual by @BasitBiOyun',
    },
  },

  templates: {
    // We will initialize all 12 templates
  }
};
`;

// Wait, I can build this dynamically in JS using the old DEFAULT_PROJECT.
