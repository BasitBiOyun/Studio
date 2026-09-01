import { chromium } from 'playwright';

const BASE_URL = process.env.VISUAL_QA_URL || 'http://127.0.0.1:3000';
const TEST_PLAYER = 'Phase Four Persistence Player';
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8Dwn4GBgYGJAQoAHgQCAQ9fV1sAAAAASUVORK5CYII=',
  'base64',
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function artboardRoot(page) {
  const root = page.locator('[data-editor-artboard] #scouting-graphic-root').first();
  await root.waitFor({ state: 'visible', timeout: 20_000 });
  return root;
}

async function assertNoDuplicateIds(page, stage) {
  const duplicates = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach((element) => {
      const id = element.id;
      if (!id) return;
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  if (duplicates.length) {
    throw new Error(`${stage}: duplicate DOM ids found: ${duplicates.map(([id, count]) => `${id}×${count}`).join(', ')}`);
  }
}

async function openTemplate(page, name) {
  await page.getByRole('button', { name: 'Templates', exact: true }).click();
  const button = page.getByRole('button', { name, exact: false }).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
}

async function openTab(page, name) {
  await page.getByRole('button', { name, exact: true }).click();
}

function logoCard(page, label) {
  return page.getByText(label, { exact: true }).locator('xpath=../..');
}

async function removeLogoIfSelected(page, label) {
  const card = logoCard(page, label);
  const selected = card.locator('[data-club-logo-selected="true"]');
  if (await selected.count()) {
    await selected.locator('button').click();
  }
}

async function selectClub(page, label, clubName) {
  await removeLogoIfSelected(page, label);
  const card = logoCard(page, label);
  await card.getByRole('button', { name: 'Search Club Database', exact: true }).click();
  const input = card.locator('input[placeholder="e.g. Liverpool, Fenerbahçe..."]');
  await input.fill(clubName);
  const result = card.locator('button').filter({ hasText: new RegExp(`^${escapeRegExp(clubName)}`) }).first();
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

async function uploadPlayerImage(page) {
  await openTemplate(page, 'Player Scouting Report');
  await openTab(page, 'Visuals');
  const uploadLabel = page.locator('label').filter({ hasText: /^\s*Upload\s*$/ }).first();
  const input = uploadLabel.locator('input[type="file"]');
  await input.setInputFiles({ name: 'phase4-player.png', mimeType: 'image/png', buffer: TINY_PNG });
  await applyCrop(page);
  const root = await artboardRoot(page);
  const player = root.getByAltText('Primary player visual');
  await player.waitFor({ state: 'attached', timeout: 10_000 });
  const ok = await player.evaluate((image) => image.complete && image.naturalWidth > 0);
  if (!ok) throw new Error('manual player image upload/crop produced a broken image');

  await page.getByRole('button', { name: 'Remove player image', exact: true }).click();
  await player.waitFor({ state: 'detached', timeout: 5_000 });
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await root.getByAltText('Primary player visual').waitFor({ state: 'attached', timeout: 5_000 });
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await root.getByAltText('Primary player visual').waitFor({ state: 'detached', timeout: 5_000 });
}

async function testFooterSocialToggle(page) {
  await openTab(page, 'Layout');
  const root = await artboardRoot(page);
  const before = await root.getByText('@BasitBiOyun', { exact: true }).count();
  if (before < 1) throw new Error('footer social handles are missing before toggle test');
  const hide = page.getByRole('button', { name: 'Hide', exact: true }).first();
  await hide.click();
  await page.waitForTimeout(120);
  const after = await root.getByText('@BasitBiOyun', { exact: true }).count();
  if (after >= before) throw new Error(`social footer toggle did not hide an account (${before} -> ${after})`);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.waitForTimeout(120);
  const restored = await root.getByText('@BasitBiOyun', { exact: true }).count();
  if (restored !== before) throw new Error(`undo did not restore social footer state (${before} -> ${restored})`);

  const brand = root.getByAltText('BasitBiOyun');
  await brand.waitFor({ state: 'attached', timeout: 5_000 });
  const brandOk = await brand.evaluate((image) => image.complete && image.naturalWidth > 0);
  if (!brandOk) throw new Error('BasitBiOyun footer logo is broken in preview');
}

async function testSemanticLogos(page) {
  await openTemplate(page, 'Transfer Graphic');
  await openTab(page, 'Visuals');
  await selectClub(page, 'From Club Logo', 'Arsenal');
  await selectClub(page, 'To Club Logo', 'Fenerbahçe');

  let root = await artboardRoot(page);
  const from = root.locator('[data-semantic-logo-slot="from-club"] img').first();
  const to = root.locator('[data-semantic-logo-slot="to-club"] img').first();
  await from.waitFor({ state: 'attached', timeout: 10_000 });
  await to.waitFor({ state: 'attached', timeout: 10_000 });
  const arsenalSrc = await from.getAttribute('src');
  const fenerSrc = await to.getAttribute('src');
  if (!arsenalSrc || !fenerSrc || arsenalSrc === fenerSrc) throw new Error('from/to semantic logo slots are not independent');

  await selectClub(page, 'From Club Logo', 'Real Madrid');
  root = await artboardRoot(page);
  const realSrc = await root.locator('[data-semantic-logo-slot="from-club"] img').first().getAttribute('src');
  const toAfter = await root.locator('[data-semantic-logo-slot="to-club"] img').first().getAttribute('src');
  if (!realSrc || realSrc === arsenalSrc) throw new Error('Real Madrid smoke selection did not replace only the from-club slot');
  if (toAfter !== fenerSrc) throw new Error('changing from-club overwrote the to-club semantic slot');

  await page.waitForTimeout(850);
  await page.reload({ waitUntil: 'networkidle', timeout: 60_000 });
  root = await artboardRoot(page);
  const persistedFrom = await root.locator('[data-semantic-logo-slot="from-club"] img').first().getAttribute('src');
  const persistedTo = await root.locator('[data-semantic-logo-slot="to-club"] img').first().getAttribute('src');
  if (persistedFrom !== realSrc || persistedTo !== fenerSrc) throw new Error('semantic logo slots did not survive local persistence/reload');

  await openTab(page, 'Visuals');
  const optional = logoCard(page, 'Optional Competition Logo');
  await removeLogoIfSelected(page, 'Optional Competition Logo');
  const manual = optional.locator('label').filter({ hasText: 'Manual Upload' }).locator('input[type="file"]');
  await manual.setInputFiles({ name: 'phase4-logo.png', mimeType: 'image/png', buffer: TINY_PNG });
  await applyCrop(page);
  await optional.locator('[data-club-logo-selected="true"]').waitFor({ state: 'visible', timeout: 5_000 });
  await optional.locator('[data-club-logo-selected="true"] button').click();
  await optional.locator('[data-club-logo-selected="true"]').waitFor({ state: 'detached', timeout: 5_000 });
}

async function configureExport(page, format, scale) {
  await page.getByRole('button', { name: 'Change export settings', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`^${format}$`, 'i') }).click();
  const scaleLabel = scale === 4 ? /4× Ultra High-Res/ : scale === 2 ? /2× High-Res/ : /1× Native Resolution/;
  await page.getByRole('button', { name: scaleLabel }).click();
}

async function exportOne(page, format, scale) {
  await configureExport(page, format, scale);
  const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
  await page.getByRole('button', { name: /Export \d+px image/ }).click({ force: true });
  const download = await downloadPromise;
  const suggested = download.suggestedFilename().toLowerCase();
  const expectedExtension = format === 'jpg' ? '.jpg' : '.png';
  if (!suggested.endsWith(expectedExtension)) throw new Error(`${format} ${scale}x export produced unexpected filename: ${suggested}`);
  await page.getByText(/Exported .* graphic successfully!/).waitFor({ state: 'visible', timeout: 120_000 }).catch(() => {});
}

async function testExports(page) {
  await openTemplate(page, 'Player Scouting Report');
  await exportOne(page, 'png', 1);
  await exportOne(page, 'jpg', 2);
  await exportOne(page, 'png', 4);

  await configureExport(page, 'png', 1);
  const downloads = [];
  const listener = (download) => downloads.push(download.suggestedFilename());
  page.on('download', listener);
  await page.getByRole('button', { name: 'Export All 4 Ratios', exact: true }).click({ force: true });
  await page.getByText('Exported all 4 aspect ratios.', { exact: true }).waitFor({ state: 'visible', timeout: 180_000 });
  page.off('download', listener);
  const requiredRatios = ['1:1', '4:5', '16:9', '9:16'];
  for (const ratio of requiredRatios) {
    if (!downloads.some((name) => name.includes(`_${ratio}_`))) {
      throw new Error(`batch export did not download ${ratio}; downloads: ${downloads.join(', ')}`);
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
    await artboardRoot(page);
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await assertNoDuplicateIds(page, 'initial render');

    const sidebar = page.locator('.bbo-sidebar-v3').first();
    const resize = page.getByRole('separator', { name: 'Resize editor sidebar' }).first();
    const before = await sidebar.boundingBox();
    const grip = await resize.boundingBox();
    if (!before || !grip) throw new Error('sidebar resize bounds unavailable');
    await page.mouse.move(grip.x + grip.width / 2, grip.y + 80);
    await page.mouse.down();
    await page.mouse.move(grip.x + grip.width / 2 + 60, grip.y + 80, { steps: 4 });
    await page.mouse.up();
    const after = await sidebar.boundingBox();
    if (!after || after.width < before.width + 35) throw new Error(`sidebar resize failed (${before.width} -> ${after?.width})`);
    await page.getByRole('button', { name: 'Collapse editor sidebar', exact: true }).click();
    await page.getByRole('button', { name: 'Expand editor sidebar', exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Expand editor sidebar', exact: true }).click();
    await page.getByRole('button', { name: 'Collapse editor sidebar', exact: true }).waitFor({ state: 'visible' });

    await openTab(page, 'Data & Text');
    const fullNameLabel = page.getByText('Full Name', { exact: true }).first();
    const fullNameInput = fullNameLabel.locator('xpath=..').locator('input').first();
    const originalName = await fullNameInput.inputValue();
    await fullNameInput.fill(TEST_PLAYER);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    if ((await fullNameInput.inputValue()) !== originalName) throw new Error('undo did not restore text edit');
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    if ((await fullNameInput.inputValue()) !== TEST_PLAYER) throw new Error('redo did not restore text edit');
    await page.waitForTimeout(850);
    await page.reload({ waitUntil: 'networkidle', timeout: 60_000 });
    await openTab(page, 'Data & Text');
    const reloadedName = await page.getByText('Full Name', { exact: true }).first().locator('xpath=..').locator('input').first().inputValue();
    if (reloadedName !== TEST_PLAYER) throw new Error(`local project persistence failed: ${reloadedName}`);

    await page.getByRole('button', { name: 'TR', exact: true }).click();
    await page.getByRole('button', { name: 'Şablonlar', exact: true }).waitFor({ state: 'visible' });
    if ((await (await artboardRoot(page)).getAttribute('lang')) !== 'tr-TR') throw new Error('graphic language did not switch to tr-TR');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await page.getByRole('button', { name: 'Templates', exact: true }).waitFor({ state: 'visible' });
    if ((await (await artboardRoot(page)).getAttribute('lang')) !== 'en') throw new Error('graphic language did not switch back to en');

    await uploadPlayerImage(page);
    await testFooterSocialToggle(page);
    await testSemanticLogos(page);
    await assertNoDuplicateIds(page, 'after semantic logo and reload checks');
    await testExports(page);
    await assertNoDuplicateIds(page, 'after export checks');

    if (pageErrors.length) throw new Error(`page errors detected: ${pageErrors.join(' | ')}`);
    console.log('Phase 4 browser QA passed: history, persistence, sidebar, localization, upload/crop/remove, social/footer, club catalogue, semantic logo isolation, exports and duplicate-id checks are green.');
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
