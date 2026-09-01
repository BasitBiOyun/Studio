import { chromium } from 'playwright';

const BASE_URL = process.env.VISUAL_QA_URL || 'http://127.0.0.1:3000';
const TEST_PLAYER = 'Phase Four Persistence Player';
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8Dwn4GBgYGJAQoAHgQCAQ9fV1sAAAAASUVORK5CYII=',
  'base64',
);

async function root(page) {
  const node = page.locator('[data-editor-artboard] #scouting-graphic-root').first();
  await node.waitFor({ state: 'visible', timeout: 20_000 });
  return node;
}

async function assertNoDuplicateIds(page, stage) {
  const duplicates = await page.evaluate(() => {
    const counts = new Map();
    for (const element of document.querySelectorAll('[id]')) {
      if (!element.id) continue;
      counts.set(element.id, (counts.get(element.id) || 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  if (duplicates.length) {
    throw new Error(`${stage}: duplicate ids ${duplicates.map(([id, count]) => `${id}×${count}`).join(', ')}`);
  }
}

async function openTab(page, name) {
  await page.getByRole('button', { name, exact: true }).click();
}

async function openTemplate(page, name) {
  await openTab(page, 'Templates');
  const button = page.getByRole('button', { name, exact: false }).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
}

function logoCard(page, label) {
  return page.locator('.bbo-sidebar-v3:visible').first().getByText(label, { exact: true }).locator('xpath=../..');
}

async function clearLogo(page, label) {
  const selected = logoCard(page, label).locator('[data-club-logo-selected="true"]');
  if (await selected.count()) await selected.locator('button').click({ force: true });
}

async function chooseClub(page, label, query, resultPrefix = query) {
  await clearLogo(page, label);
  const card = logoCard(page, label);
  await card.getByRole('button', { name: 'Search Club Database', exact: true }).click();
  const input = card.locator('input[placeholder="e.g. Liverpool, Fenerbahçe..."]');
  await input.fill(query);
  const result = card.locator('button').filter({ hasText: new RegExp(`^${resultPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).first();
  await result.waitFor({ state: 'visible', timeout: 10_000 });
  await result.click();
  await card.locator('[data-club-logo-selected="true"]').waitFor({ state: 'visible', timeout: 5_000 });
}

async function applyCrop(page) {
  const dialog = page.getByRole('dialog', { name: 'Crop image' });
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  const apply = dialog.getByRole('button', { name: 'Apply Crop' });
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.includes('Apply Crop'));
    return Boolean(button && !button.disabled);
  }, null, { timeout: 10_000 });
  await apply.click();
  await dialog.waitFor({ state: 'detached', timeout: 15_000 });
}

async function testHistoryAndPersistence(page) {
  await openTab(page, 'Data & Text');
  const label = page.getByText('Full Name', { exact: true }).first();
  const input = label.locator('xpath=..').locator('input').first();
  const original = await input.inputValue();
  await input.fill(TEST_PLAYER);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  if ((await input.inputValue()) !== original) throw new Error('text undo failed');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  if ((await input.inputValue()) !== TEST_PLAYER) throw new Error('text redo failed');
  await page.waitForTimeout(850);
  await page.reload({ waitUntil: 'networkidle', timeout: 60_000 });
  await openTab(page, 'Data & Text');
  const reloaded = await page.getByText('Full Name', { exact: true }).first().locator('xpath=..').locator('input').first().inputValue();
  if (reloaded !== TEST_PLAYER) throw new Error(`local persistence failed: ${reloaded}`);
}

async function testSidebarAndLanguage(page) {
  const sidebar = page.locator('.bbo-sidebar-v3').first();
  const grip = page.getByRole('separator', { name: 'Resize editor sidebar' }).first();
  const before = await sidebar.boundingBox();
  const bounds = await grip.boundingBox();
  if (!before || !bounds) throw new Error('sidebar resize bounds unavailable');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 70);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 60, bounds.y + 70, { steps: 4 });
  await page.mouse.up();
  const after = await sidebar.boundingBox();
  if (!after || after.width < before.width + 35) throw new Error(`sidebar resize failed ${before.width} -> ${after?.width}`);
  await page.getByRole('button', { name: 'Collapse editor sidebar', exact: true }).click();
  await page.getByRole('button', { name: 'Expand editor sidebar', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Expand editor sidebar', exact: true }).click();

  await page.getByRole('button', { name: 'TR', exact: true }).click();
  await page.getByRole('button', { name: 'Şablonlar', exact: true }).waitFor({ state: 'visible' });
  if ((await (await root(page)).getAttribute('lang')) !== 'tr-TR') throw new Error('TR graphic language failed');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'Templates', exact: true }).waitFor({ state: 'visible' });
  if ((await (await root(page)).getAttribute('lang')) !== 'en') throw new Error('EN graphic language failed');
}

async function testPlayerUpload(page) {
  await openTemplate(page, 'Player Scouting Report');
  await openTab(page, 'Visuals');
  const upload = page.locator('label').filter({ hasText: /^\s*Upload\s*$/ }).first().locator('input[type="file"]');
  await upload.setInputFiles({ name: 'phase4-player.png', mimeType: 'image/png', buffer: TINY_PNG });
  await applyCrop(page);
  let artboard = await root(page);
  await artboard.getByAltText('Primary player visual').waitFor({ state: 'attached', timeout: 10_000 });
  await page.getByRole('button', { name: 'Remove player image', exact: true }).click();
  await artboard.getByAltText('Primary player visual').waitFor({ state: 'detached', timeout: 5_000 });
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  artboard = await root(page);
  await artboard.getByAltText('Primary player visual').waitFor({ state: 'attached', timeout: 5_000 });
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await artboard.getByAltText('Primary player visual').waitFor({ state: 'detached', timeout: 5_000 });
}

async function testFooter(page) {
  await openTab(page, 'Layout');
  const artboard = await root(page);
  const brand = artboard.getByAltText('BasitBiOyun');
  await brand.waitFor({ state: 'attached', timeout: 5_000 });
  const brandOk = await brand.evaluate((image) => image.complete && image.naturalWidth > 0);
  if (!brandOk) throw new Error('bundled footer logo is broken');

  const before = await artboard.getByText('@BasitBiOyun', { exact: true }).count();
  if (before !== 4) throw new Error(`expected 4 default social handles, got ${before}`);
  const panel = page.getByText('Footer & Social Accounts', { exact: true }).locator('xpath=..');
  await panel.getByRole('button', { name: 'X', exact: true }).click();
  await page.waitForTimeout(120);
  const after = await artboard.getByText('@BasitBiOyun', { exact: true }).count();
  if (after !== before - 1) throw new Error(`social toggle failed ${before} -> ${after}`);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.waitForTimeout(120);
  if ((await artboard.getByText('@BasitBiOyun', { exact: true }).count()) !== before) throw new Error('social toggle undo failed');
}

async function testSemanticLogos(page) {
  await openTemplate(page, 'Transfer Graphic');
  await openTab(page, 'Visuals');
  await chooseClub(page, 'From Club Logo', 'Arsenal');
  await chooseClub(page, 'To Club Logo', 'Fenerbahce');

  let artboard = await root(page);
  const from = artboard.locator('[data-semantic-logo-slot="from-club"] img').first();
  const to = artboard.locator('[data-semantic-logo-slot="to-club"] img').first();
  await from.waitFor({ state: 'attached', timeout: 10_000 });
  await to.waitFor({ state: 'attached', timeout: 10_000 });
  const arsenal = await from.getAttribute('src');
  const fener = await to.getAttribute('src');
  if (!arsenal || !fener || arsenal === fener) throw new Error('from/to logo isolation failed');

  await chooseClub(page, 'From Club Logo', 'Real Madrid');
  artboard = await root(page);
  const real = await artboard.locator('[data-semantic-logo-slot="from-club"] img').first().getAttribute('src');
  const toAfter = await artboard.locator('[data-semantic-logo-slot="to-club"] img').first().getAttribute('src');
  if (!real || real === arsenal) throw new Error('Real Madrid smoke selection failed');
  if (toAfter !== fener) throw new Error('changing from-club overwrote to-club');

  await page.waitForTimeout(850);
  await page.reload({ waitUntil: 'networkidle', timeout: 60_000 });
  artboard = await root(page);
  if ((await artboard.locator('[data-semantic-logo-slot="from-club"] img').first().getAttribute('src')) !== real) throw new Error('from-club persistence failed');
  if ((await artboard.locator('[data-semantic-logo-slot="to-club"] img').first().getAttribute('src')) !== fener) throw new Error('to-club persistence failed');

  await openTab(page, 'Visuals');
  const optional = logoCard(page, 'Optional Competition Logo');
  await clearLogo(page, 'Optional Competition Logo');
  await optional.locator('label').filter({ hasText: 'Manual Upload' }).locator('input[type="file"]').setInputFiles({
    name: 'phase4-logo.png', mimeType: 'image/png', buffer: TINY_PNG,
  });
  await applyCrop(page);
  await optional.locator('[data-club-logo-selected="true"]').waitFor({ state: 'visible', timeout: 5_000 });
  await optional.locator('[data-club-logo-selected="true"] button').click({ force: true });
  await optional.locator('[data-club-logo-selected="true"]').waitFor({ state: 'detached', timeout: 5_000 });
}

async function recordedDownloads(page) {
  return page.evaluate(() => Array.isArray(window.__phase4Downloads) ? [...window.__phase4Downloads] : []);
}

async function testExporterKernel(page) {
  const before = (await recordedDownloads(page)).length;
  await page.evaluate(async () => {
    const node = document.createElement('div');
    node.setAttribute('data-phase4-export-probe', 'true');
    node.style.width = '96px';
    node.style.height = '64px';
    node.style.display = 'flex';
    node.style.alignItems = 'center';
    node.style.justifyContent = 'center';
    node.style.background = '#101216';
    node.style.color = '#ffffff';
    node.style.fontFamily = 'Arial, sans-serif';
    node.style.fontSize = '12px';
    node.textContent = 'ÇĞİÖŞÜ Phase 4';
    document.body.appendChild(node);

    try {
      const { exportGraphic } = await import('/src/services/exporter.ts');
      const dimensions = { width: 96, height: 64, ratio: '1:1', label: 'Phase 4 QA' };
      await exportGraphic(node, { dimensions, scaleMultiplier: 1, format: 'png', filename: 'phase4-probe-1x.png' });
      await exportGraphic(node, { dimensions, scaleMultiplier: 2, format: 'jpg', filename: 'phase4-probe-2x.jpg' });
      await exportGraphic(node, { dimensions, scaleMultiplier: 4, format: 'png', filename: 'phase4-probe-4x.png' });
    } finally {
      node.remove();
    }
  });

  const files = (await recordedDownloads(page)).slice(before).map((name) => String(name).toLowerCase());
  for (const expected of ['phase4-probe-1x.png', 'phase4-probe-2x.jpg', 'phase4-probe-4x.png']) {
    if (!files.includes(expected)) throw new Error(`export kernel missing ${expected}: ${files.join(', ')}`);
  }
}

async function testExportUiContract(page) {
  await openTemplate(page, 'Player Scouting Report');
  await page.getByRole('button', { name: 'Change export settings', exact: true }).click();
  for (const format of ['png', 'jpg', 'json']) {
    if (!(await page.getByRole('button', { name: new RegExp(`^${format}$`, 'i') }).count())) throw new Error(`missing ${format.toUpperCase()} export option`);
  }
  for (const label of [/4× Ultra High-Res/, /2× High-Res/, /1× Native Resolution/]) {
    if (!(await page.getByRole('button', { name: label }).count())) throw new Error(`missing export scale ${label}`);
  }
  if (!(await page.getByRole('button', { name: 'Export All 4 Ratios', exact: true }).count())) throw new Error('missing four-ratio batch export action');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.__phase4Downloads = [];
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedAnchorClick() {
      if (this.download) window.__phase4Downloads.push(this.download);
      return originalClick.call(this);
    };
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
    await root(page);
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await assertNoDuplicateIds(page, 'initial');
    await testSidebarAndLanguage(page);
    await testHistoryAndPersistence(page);
    await testPlayerUpload(page);
    await testFooter(page);
    await testSemanticLogos(page);
    await assertNoDuplicateIds(page, 'after logo/persistence checks');
    await testExporterKernel(page);
    await testExportUiContract(page);
    await assertNoDuplicateIds(page, 'after exports');
    if (pageErrors.length) throw new Error(`page errors: ${pageErrors.join(' | ')}`);
    console.log('Phase 4 browser QA passed: history, persistence, sidebar, localization, crop/remove, footer/socials, Arsenal/Fenerbahce/Real Madrid semantic logos, manual logo upload, real SnapDOM PNG/JPG 1x/2x/4x export kernel, four-ratio batch UI contract and duplicate-id checks are green.');
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
