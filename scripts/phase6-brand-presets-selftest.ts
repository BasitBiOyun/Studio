import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT, TEMPLATE_METADATA } from '../src/constants/presets';
import {
  BRAND_PRESETS,
  applyBrandPreset,
  applySupportedLayoutPatch,
} from '../src/services/brandPresets';
import {
  createHistoryState,
  currentHistoryProject,
  pushHistoryState,
  redoHistoryState,
  undoHistoryState,
} from '../src/services/historyState';
import { Project } from '../src/types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function logoIdentity(project: Project) {
  return project.templates[project.templateType].visuals.logos.map((logo) => ({
    id: logo.id,
    name: logo.name,
    src: logo.src,
    visible: logo.visible,
    x: logo.x,
    y: logo.y,
    size: logo.size,
    presetPosition: logo.presetPosition,
  }));
}

assert.equal(BRAND_PRESETS.length, 5, 'Phase 6 must expose exactly five required brand presets.');
assert.equal(new Set(BRAND_PRESETS.map((preset) => preset.id)).size, 5, 'Brand preset ids must be unique.');
assert.deepEqual(
  BRAND_PRESETS.map((preset) => preset.label),
  ['BasitBiOyun Editorial', 'Fenerbahçe Analysis', 'Transfer News', 'Scouting', 'Matchday'],
  'Required preset labels changed.',
);

for (const template of TEMPLATE_METADATA) {
  for (const preset of BRAND_PRESETS) {
    const before = clone(DEFAULT_PROJECT) as Project;
    before.templateType = template.type;
    before.sharedData.player.name = `KEEP PLAYER ${template.type}`;
    before.sharedData.player.club = 'KEEP CLUB';
    before.sharedData.credits = {
      ...before.sharedData.credits,
      socials: {
        x: { visible: false, handle: '@CustomX' },
        youtube: { visible: true, handle: '@CustomYT' },
        tiktok: { visible: true, handle: '@CustomTT' },
        instagram: { visible: false, handle: '@CustomIG' },
      },
    } as any;

    const activeBefore = before.templates[template.type];
    activeBefore.visuals.playerImageSrc = `data:image/png;base64,PLAYER-${template.type}`;
    activeBefore.visuals.secondaryPlayerImageSrc = `data:image/png;base64,SECONDARY-${template.type}`;
    activeBefore.visuals.logos = activeBefore.visuals.logos.map((logo, index) => ({
      ...logo,
      id: `${template.type}-slot-${index}`,
      name: `semantic-slot-${index}`,
      src: `data:image/svg+xml;base64,LOGO-${template.type}-${index}`,
      visible: index !== 2,
      x: index * 7,
      y: index * 9,
      size: 70 + index * 11,
      opacity: 55 + index * 10,
    }));
    activeBefore.content.profile.summary = `KEEP CONTENT ${template.type}`;
    activeBefore.content.profile.tacticalProfile = `KEEP IMPORTED DATA ${template.type}`;

    const contentSnapshot = clone(activeBefore.content);
    const playerSnapshot = clone(before.sharedData.player);
    const logoSnapshot = logoIdentity(before);
    const otherTemplateSnapshots = Object.fromEntries(
      Object.entries(before.templates)
        .filter(([key]) => key !== template.type)
        .map(([key, value]) => [key, clone(value)]),
    );

    const applied = applyBrandPreset(before, preset.id);
    const activeAfter = applied.templates[template.type];

    assert.deepEqual(activeAfter.content, contentSnapshot, `${preset.label} changed ${template.type} content.`);
    assert.deepEqual(applied.sharedData.player, playerSnapshot, `${preset.label} changed shared player data.`);
    assert.equal(activeAfter.visuals.playerImageSrc, activeBefore.visuals.playerImageSrc, `${preset.label} changed player image.`);
    assert.equal(activeAfter.visuals.secondaryPlayerImageSrc, activeBefore.visuals.secondaryPlayerImageSrc, `${preset.label} changed secondary player image.`);
    assert.deepEqual(logoIdentity(applied), logoSnapshot, `${preset.label} changed semantic logo identity or slot geometry.`);

    for (const [key, snapshot] of Object.entries(otherTemplateSnapshots)) {
      assert.deepEqual((applied.templates as any)[key], snapshot, `${preset.label} modified inactive template ${key}.`);
    }

    const socials = (applied.sharedData.credits as any).socials;
    assert.equal(socials.x.handle, '@CustomX', `${preset.label} overwrote X handle.`);
    assert.equal(socials.youtube.handle, '@CustomYT', `${preset.label} overwrote YouTube handle.`);
    assert.equal(socials.tiktok.handle, '@CustomTT', `${preset.label} overwrote TikTok handle.`);
    assert.equal(socials.instagram.handle, '@CustomIG', `${preset.label} overwrote Instagram handle.`);

    const manualOverride = {
      ...applied,
      templates: {
        ...applied.templates,
        [template.type]: {
          ...activeAfter,
          theme: { ...activeAfter.theme, primaryAccent: '#123456' },
        },
      },
    };
    assert.equal(manualOverride.templates[template.type].theme.primaryAccent, '#123456', 'Manual visual override after preset failed.');
    assert.deepEqual(manualOverride.templates[template.type].content, contentSnapshot, 'Manual override changed content.');
  }
}

const unsupportedLayout = applySupportedLayoutPatch(
  clone(DEFAULT_PROJECT.templates['scouting-report'].layout),
  {
    fontDisplay: "'Anton', sans-serif",
    spacingScale: 'compact',
    templateSpecificUnknownField: 'must-be-ignored',
    content: 'must-never-enter-layout',
  },
);
assert.equal(unsupportedLayout.fontDisplay, "'Anton', sans-serif");
assert.equal(unsupportedLayout.spacingScale, 'compact');
assert.equal('templateSpecificUnknownField' in (unsupportedLayout as any), false, 'Unsupported layout property was not ignored.');
assert.equal('content' in (unsupportedLayout as any), false, 'Content leaked into visual layout state.');

const beforeHistory = clone(DEFAULT_PROJECT) as Project;
beforeHistory.templateType = 'transfer-graphic';
beforeHistory.templates['transfer-graphic'].content.transferData!.headline = 'KEEP THIS HEADLINE';
beforeHistory.templates['transfer-graphic'].visuals.playerImageSrc = 'data:image/png;base64,KEEP-PLAYER';
beforeHistory.templates['transfer-graphic'].visuals.logos[0].src = 'from-club.svg';
beforeHistory.templates['transfer-graphic'].visuals.logos[1].src = 'to-club.svg';
const afterPreset = applyBrandPreset(beforeHistory, 'transfer-news');
let history = createHistoryState(beforeHistory);
history = pushHistoryState(history, afterPreset);
history = undoHistoryState(history);
assert.deepEqual(currentHistoryProject(history, beforeHistory), beforeHistory, 'Undo did not restore pre-preset project state.');
history = redoHistoryState(history);
assert.deepEqual(currentHistoryProject(history, beforeHistory), afterPreset, 'Redo did not restore preset state.');
assert.equal(afterPreset.templates['transfer-graphic'].visuals.logos[0].src, 'from-club.svg', 'Transfer from logo swapped or changed.');
assert.equal(afterPreset.templates['transfer-graphic'].visuals.logos[1].src, 'to-club.svg', 'Transfer to logo swapped or changed.');
assert.equal(afterPreset.templates['transfer-graphic'].content.transferData!.headline, 'KEEP THIS HEADLINE', 'Transfer content changed during preset application.');

const selectorSource = fs.readFileSync('src/components/EditorSidebar.tsx', 'utf8');
assert.match(selectorSource, /BRAND_PRESETS\.map/, 'Brand preset selector UI is missing.');
assert.match(selectorSource, /onChange\(applyBrandPreset\(project, presetId\)\)/, 'Preset selector does not use the normal project onChange/history path.');
assert.doesNotMatch(selectorSource, /setOutputLanguage\(/, 'Brand preset selector must not alter TR/EN state.');

console.log('Phase 6 brand preset self-test passed.');
