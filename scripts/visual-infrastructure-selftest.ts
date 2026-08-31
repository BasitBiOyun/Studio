import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getTemplateVisualPolicy,
  usableLogoSrc,
  usablePlayerImageSrc,
} from '../src/services/templateVisualPolicy';

assert.equal(usablePlayerImageSrc('/initial-player.png'), '');
assert.equal(usablePlayerImageSrc(''), '');
assert.equal(usablePlayerImageSrc('data:image/png;base64,abc'), 'data:image/png;base64,abc');
assert.equal(usableLogoSrc('/gent-logo.svg'), '');
assert.equal(usableLogoSrc('/custom-club.svg'), '/custom-club.svg');

const scouting = getTemplateVisualPolicy('scouting-report');
assert.equal(scouting.allowPrimaryImage, true);
assert.equal(scouting.renderPrimaryAsGlobalLayer, true);
assert.equal(scouting.allowSecondaryImage, false);

const comparison = getTemplateVisualPolicy('player-comparison');
assert.equal(comparison.allowPrimaryImage, true);
assert.equal(comparison.allowSecondaryImage, true);
assert.equal(comparison.renderPrimaryAsGlobalLayer, false);
assert.equal(comparison.renderSecondaryAsGlobalLayer, false);

const tactical = getTemplateVisualPolicy('tactical-analysis');
assert.equal(tactical.allowPrimaryImage, true);
assert.equal(tactical.allowSecondaryImage, false);

const teamProfile = getTemplateVisualPolicy('team-profile');
assert.equal(teamProfile.allowPrimaryImage, false);
assert.equal(teamProfile.allowSecondaryImage, false);
assert.equal(teamProfile.backgroundLogoIndex, 0);

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

const scoutingCard = read('src/components/ScoutingCard.tsx');
assert.ok(scoutingCard.includes('BackgroundCrestLayer'));
assert.ok(scoutingCard.includes('visualPolicy.renderPrimaryAsGlobalLayer'));
assert.ok(scoutingCard.includes('usablePlayerImageSrc'));
assert.ok(scoutingCard.includes('usableLogoSrc'));

const playerLayer = read('src/components/design/PlayerPhotoLayer.tsx');
assert.ok(playerLayer.includes('absolute inset-x-0 bottom-0'));
assert.ok(playerLayer.includes('h-[28%]'));

const comparisonView = read('src/components/templates/PlayerComparisonView.tsx');
assert.ok(comparisonView.includes('PlayerAvatar'));
assert.ok(comparisonView.includes('secondaryPlayerImageSrc'));
assert.ok(comparisonView.includes('playerNameSize'));

const interactiveCanvas = read('src/components/InteractiveCanvas.tsx');
assert.ok(interactiveCanvas.includes('upscaleImage2x'));
assert.ok(interactiveCanvas.includes('P1 Foto'));
assert.ok(interactiveCanvas.includes('P2 Foto'));
assert.ok(interactiveCanvas.includes('P2 2×'));

const upscaler = read('src/services/clientUpscaler.ts');
assert.ok(!upscaler.includes('cdn.jsdelivr.net'), 'Enhancer must not hang on remote model/runtime downloads.');
assert.ok(upscaler.includes("imageSmoothingQuality = 'high'"));
assert.ok(upscaler.includes("toDataURL('image/png'"));
assert.ok(upscaler.includes('subtleSharpen'));
assert.ok(upscaler.includes('sourceWidth * 2'));

console.log('Visual infrastructure self-test passed.');
