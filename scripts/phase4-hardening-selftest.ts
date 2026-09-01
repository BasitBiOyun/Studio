import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROJECT } from '../src/constants/presets';
import {
  MAX_HISTORY,
  createHistoryState,
  currentHistoryProject,
  pushHistoryState,
  redoHistoryState,
  undoHistoryState,
} from '../src/services/historyState';

const root = path.resolve(process.cwd());
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const app = read('src/App.tsx');
const card = read('src/components/ScoutingCard.tsx');
const batch = read('src/components/BatchExportManager.tsx');
const topBar = read('src/components/TopBar.tsx');
const sidebar = read('src/components/EditorSidebarV3.tsx');
const clubSelector = read('src/components/ClubLogoSelector.tsx');
const cropModal = read('src/components/ImageCropModal.tsx');
const exporter = read('src/services/exporter.ts');
const storage = read('src/services/storage.ts');
const semanticLogos = read('src/components/design/SemanticLogosLayer.tsx');
const footer = read('src/components/design/EditorialFooter.tsx');

let state = createHistoryState(clone(DEFAULT_PROJECT));
const original = currentHistoryProject(state, DEFAULT_PROJECT);

const textEdit = clone(original);
textEdit.sharedData.player.name = 'Phase 4 History Player';
state = pushHistoryState(state, textEdit);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).sharedData.player.name, 'Phase 4 History Player');
state = undoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).sharedData.player.name, original.sharedData.player.name, 'text edit must undo');
state = redoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).sharedData.player.name, 'Phase 4 History Player', 'text edit must redo');

const templateSwitch = clone(currentHistoryProject(state, DEFAULT_PROJECT));
templateSwitch.templateType = 'transfer-graphic';
state = pushHistoryState(state, templateSwitch);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templateType, 'transfer-graphic');
state = undoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templateType, 'scouting-report', 'template switch must undo');
state = redoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templateType, 'transfer-graphic', 'template switch must redo');

const logoOne = clone(currentHistoryProject(state, DEFAULT_PROJECT));
logoOne.templates['transfer-graphic'].visuals.logos[0].src = 'https://example.test/arsenal.png';
logoOne.templates['transfer-graphic'].visuals.logos[0].visible = true;
state = pushHistoryState(state, logoOne);
const logoTwo = clone(currentHistoryProject(state, DEFAULT_PROJECT));
logoTwo.templates['transfer-graphic'].visuals.logos[1].src = 'https://example.test/fenerbahce.png';
logoTwo.templates['transfer-graphic'].visuals.logos[1].visible = true;
state = pushHistoryState(state, logoTwo);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['transfer-graphic'].visuals.logos[0].src, 'https://example.test/arsenal.png');
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['transfer-graphic'].visuals.logos[1].src, 'https://example.test/fenerbahce.png');
state = undoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['transfer-graphic'].visuals.logos[0].src, 'https://example.test/arsenal.png', 'changing slot 2 must not overwrite slot 1');
state = redoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['transfer-graphic'].visuals.logos[1].src, 'https://example.test/fenerbahce.png', 'semantic logo selection must redo');

const imageProject = clone(currentHistoryProject(state, DEFAULT_PROJECT));
imageProject.templateType = 'scouting-report';
imageProject.templates['scouting-report'].visuals.playerImageSrc = 'data:image/png;base64,phase4';
state = pushHistoryState(state, imageProject);
const removedImage = clone(currentHistoryProject(state, DEFAULT_PROJECT));
removedImage.templates['scouting-report'].visuals.playerImageSrc = '';
state = pushHistoryState(state, removedImage);
state = undoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['scouting-report'].visuals.playerImageSrc, 'data:image/png;base64,phase4', 'image removal must undo');
state = redoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['scouting-report'].visuals.playerImageSrc, '', 'image removal must redo');

const themeProject = clone(currentHistoryProject(state, DEFAULT_PROJECT));
themeProject.templates['scouting-report'].theme.primaryAccent = '#123456';
state = pushHistoryState(state, themeProject);
const layoutProject = clone(currentHistoryProject(state, DEFAULT_PROJECT));
layoutProject.templates['scouting-report'].layout.fontDisplay = "'Anton', sans-serif";
state = pushHistoryState(state, layoutProject);
state = undoHistoryState(state);
assert.notEqual(currentHistoryProject(state, DEFAULT_PROJECT).templates['scouting-report'].layout.fontDisplay, "'Anton', sans-serif", 'layout change must undo independently');
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['scouting-report'].theme.primaryAccent, '#123456', 'undoing layout must preserve previous theme change');
state = redoHistoryState(state);
assert.equal(currentHistoryProject(state, DEFAULT_PROJECT).templates['scouting-report'].layout.fontDisplay, "'Anton', sans-serif", 'layout change must redo');

state = undoHistoryState(state);
const branched = clone(currentHistoryProject(state, DEFAULT_PROJECT));
branched.sharedData.player.club = 'Branch Club';
state = pushHistoryState(state, branched);
assert.equal(state.currentIndex, state.history.length - 1, 'new edit after undo must discard redo branch');

let capped = createHistoryState(clone(DEFAULT_PROJECT));
for (let index = 0; index < MAX_HISTORY + 12; index += 1) {
  const next = clone(currentHistoryProject(capped, DEFAULT_PROJECT));
  next.name = `History ${index}`;
  capped = pushHistoryState(capped, next);
}
assert.equal(capped.history.length, MAX_HISTORY, 'history must remain capped');
assert.equal(capped.currentIndex, MAX_HISTORY - 1, 'history index must remain on newest state after trimming');

assert.ok(storage.includes("db.settings.get('current_project_id')") && storage.includes("db.settings.put({ id: 'current_project_id'"), 'local project persistence must retain current project identity');
assert.ok(storage.includes('migrateProject') && storage.includes('deepMerge'), 'reload path must migrate saved projects safely');
assert.ok(app.includes('saveCurrentProject(currentProject)') && app.includes('}, 400);'), 'editor must debounce local autosave');
assert.ok(app.includes('Collapse editor sidebar') && app.includes('Expand editor sidebar'), 'sidebar collapse/expand controls must remain wired');
assert.ok(sidebar.includes('SIDEBAR_WIDTH_KEY') && sidebar.includes("window.dispatchEvent(new Event('resize'))"), 'sidebar resize must persist and trigger canvas refit');
assert.ok(sidebar.includes('attachStudioLocalization(document.body, outputLanguage)'), 'TR/EN must localize the whole Studio UI');
assert.ok(topBar.includes("(['tr', 'en'] as const)") && card.includes("lang={outputLanguage === 'tr' ? 'tr-TR' : 'en'}"), 'TR/EN switching must cover both editor and graphic language');

assert.ok(exporter.includes("normalized === 'jpg' || normalized === 'jpeg'") && exporter.includes("mimeType: 'image/jpeg'"), 'JPG export path must stay available');
assert.ok(exporter.includes("mimeType: 'image/png'") && exporter.includes('scaleMultiplier: 1 | 2 | 4'), 'PNG export and 1x/2x/4x scale contract must stay available');
assert.ok(topBar.includes("([4, 2, 1] as const)") && topBar.includes("(['png', 'jpg', 'json']"), 'export UI must expose 1x/2x/4x PNG/JPG choices');
assert.ok(batch.includes("['1:1', '4:5', '16:9', '9:16']"), 'batch export must cover all four production ratios');

assert.ok(card.includes("id={interactive ? 'scouting-graphic-root' : undefined}"), 'only the interactive preview may own the legacy root id');
assert.ok(card.includes('data-graphic-root="true"') && card.includes('useId().replace'), 'all render surfaces need a stable marker and unique SVG id prefix');
assert.ok(card.includes('idPrefix={`${project.id}-${cardInstanceId}`}'), 'preview/export/batch SVG defs must not share ids');

for (const slot of ['from-club', 'to-club', 'home-team', 'away-team', 'primary-team', 'opponent-team', 'club', 'competition', 'player-1-club', 'player-2-club']) {
  assert.ok(semanticLogos.includes(`slot="${slot}"`), `semantic logo layer missing ${slot}`);
}
assert.ok(clubSelector.includes('searchLocalClubCatalogue') && clubSelector.includes('onManualUpload') && clubSelector.includes('handleRemove'), 'club selector must retain catalogue, manual upload and removal paths');
assert.ok(cropModal.includes('aria-label="Crop image"') && cropModal.includes('Apply Crop'), 'manual image/logo upload must pass through the crop editor');
assert.ok(sidebar.includes('updateFooterSocials') && sidebar.includes('Footer & Social Accounts'), 'social footer toggles must remain configurable');
assert.ok(footer.includes('alt="BasitBiOyun"') && footer.includes('visibleSocials'), 'BasitBiOyun logo and enabled social accounts must render in the footer');

assert.ok(!fs.existsSync(path.join(root, 'src/components/EditorSidebarV2.tsx')), 'dead EditorSidebarV2 must be removed once V3 is proven active');

console.log('Phase 4 hardening self-test passed: history, persistence, localization, export contracts, semantic logos, crop/upload paths, footer and duplicate-id safeguards are covered.');
