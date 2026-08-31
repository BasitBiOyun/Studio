import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import { resolveCountryFlag, turkishUppercase } from '../src/services/footballLocale';
import { translateCardText } from '../src/services/outputLanguage';
import { applyPlayerPackToProject, parsePlayerPack } from '../src/services/playerPack';

assert.equal(resolveCountryFlag('England', 'ENG'), 'gb-eng');
assert.equal(translateCardText('England', 'tr'), 'İngiltere');
assert.equal(translateCardText('Attacking Midfielder / Right Winger', 'tr'), 'Ofansif Orta Saha / Sağ Kanat');
assert.equal(translateCardText('Left', 'tr'), 'Sol');
assert.equal(translateCardText('HERE WE GO!', 'tr'), 'TRANSFER');
assert.equal(translateCardText('TRANSFER AGREEMENT', 'tr'), 'TRANSFER');
assert.equal(translateCardText('5-YEAR CONTRACT (UNTIL 2031)', 'tr'), "5 YILLIK SÖZLEŞME (2031'E KADAR)");
assert.equal(turkishUppercase('envanteri'), 'ENVANTERİ');

const packJson = JSON.stringify({
  schemaVersion: 'studio-pack-v1',
  templateType: 'player-scouting',
  context: { season: '2024/25 + 2025/26', scope: 'Senior club football' },
  data: {
    player: {
      name: 'Ethan Nwaneri',
      age: 19,
      nationality: { name: 'England', code: 'ENG' },
      nationalityCode: 'ENG',
      heightCm: 176,
      preferredFoot: 'Left',
      positions: ['Attacking Midfielder', 'Right Winger'],
      club: { name: 'Arsenal', country: 'England' }
    },
    headline: 'SOL AYAĞIYLA DAR ALANDA FARK YARATAN YARATICI HÜCUMCU',
    summary: 'Scout değerlendirmesi.',
    tacticalProfile: 'Rol ve taktik profil.',
    strengths: ['Bir', 'İki', 'Üç', 'Dört', 'Beş'],
    development: ['A', 'B', 'C'],
    stats: Array.from({ length: 6 }, (_, index) => ({ key: `s${index}`, label: `Veri ${index}`, value: index }))
  }
});

const parsed = parsePlayerPack(packJson);
assert.equal(parsed.error, null);
assert.ok(parsed.data);
const project = applyPlayerPackToProject(JSON.parse(JSON.stringify(DEFAULT_PROJECT)), parsed.data!);
assert.equal(project.sharedData.player.countryFlag, 'gb-eng');
assert.equal(project.sharedData.player.positions, 'Attacking Midfielder / Right Winger');
assert.equal((project.templates['scouting-report'].content as any).scoutingHeadline, 'SOL AYAĞIYLA DAR ALANDA FARK YARATAN YARATICI HÜCUMCU');
assert.equal(project.templates['scouting-report'].content.stats.length, 6);
assert.equal(project.templates['scouting-report'].content.strengths.length, 5);

const root = path.resolve(process.cwd());
const transferAutocomplete = fs.readFileSync(path.join(root, 'src/services/transferClubAutocomplete.ts'), 'utf8');
assert.ok(transferAutocomplete.includes("if (label.textContent !== desiredLabel)"));
assert.ok(transferAutocomplete.includes('requestAnimationFrame'));
assert.ok(transferAutocomplete.includes('if (frameId !== null) return'));

console.log('Turkish output regression tests passed.');
