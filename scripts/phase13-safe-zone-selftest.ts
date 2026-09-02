import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SOCIAL_SAFE_ZONE_GUIDES } from '../src/components/ScoutingCard';

for (const ratio of ['1:1', '4:5', '16:9', '9:16']) {
  const guide = SOCIAL_SAFE_ZONE_GUIDES[ratio];
  assert.ok(guide, `Missing social safe-zone guide for ${ratio}`);
  for (const edge of ['top', 'right', 'bottom', 'left'] as const) {
    assert.ok(guide[edge] >= 0 && guide[edge] < 30, `${ratio}/${edge} is outside the safe preview range.`);
  }
  assert.ok(guide.top + guide.bottom < 50, `${ratio} vertical safe zone collapsed.`);
  assert.ok(guide.left + guide.right < 40, `${ratio} horizontal safe zone collapsed.`);
}

const cardSource = fs.readFileSync('src/components/ScoutingCard.tsx', 'utf8');
assert.match(cardSource, /data-testid="social-safe-zone-toggle"/, 'Safe-zone toggle is missing.');
assert.match(cardSource, /data-testid="social-safe-zone-overlay"/, 'Safe-zone preview overlay is missing.');
assert.match(cardSource, /interactive && socialSafeZoneVisible/, 'Overlay is not restricted to interactive preview mode.');
assert.match(cardSource, /useState\(false\)/, 'Safe-zone preview should default off.');
assert.doesNotMatch(cardSource, /project\.\w+\s*=\s*socialSafeZoneVisible/, 'Preview state leaked into project state.');

const appSource = fs.readFileSync('src/App.tsx', 'utf8');
assert.match(appSource, /<ScoutingCard[\s\S]*interactive=\{false\}/, 'Export card is not explicitly non-interactive.');

console.log('Phase 13 social safe-zone self-test passed.');