import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const topbar = page.getByTestId('studio-topbar');
  const brandLogo = page.getByTestId('studio-brand-logo');
  await topbar.waitFor({ state: 'visible' });
  await brandLogo.waitFor({ state: 'visible' });
  assert.ok(await brandLogo.evaluate((node) => node instanceof HTMLImageElement && node.naturalWidth > 0), 'BasitBiOyun logo did not load in the top bar.');
  const topbarText = (await topbar.textContent()) || '';
  assert.ok(!topbarText.includes('BasitBiOyun Studio'), 'Legacy Studio title is still visible in the top bar.');

  const graphicTitle = ((await page.locator('#scouting-graphic-root h1').first().textContent()) || '').trim();
  if (graphicTitle) assert.notEqual(topbarText.includes(graphicTitle), true, 'Active player/graphic title leaked into the top bar.');

  const tools = page.getByTestId('studio-tools-panel');
  const sidebar = page.locator('.bbo-sidebar-v3');
  await tools.waitFor({ state: 'visible' });
  await sidebar.waitFor({ state: 'visible' });

  const positioning = await tools.evaluate((node) => getComputedStyle(node).position);
  assert.ok(positioning !== 'absolute' && positioning !== 'fixed', `Studio Tools is still floating with position:${positioning}.`);
  const sidebarBox = await sidebar.boundingBox();
  const toolsBox = await tools.boundingBox();
  assert.ok(sidebarBox && toolsBox, 'Could not measure sidebar/tool panel layout.');
  console.log('Phase 11 sidebar geometry:', JSON.stringify({ sidebarBox, toolsBox, positioning }));
  assert.ok(sidebarBox.bottom <= toolsBox.top + 2, 'Studio Tools overlaps the main sidebar instead of sitting below it.');

  for (const testId of ['entity-database-open', 'asset-library-open', 'template-variants-toggle', 'auto-layout-presets-toggle', 'template-data-export']) {
    await page.getByTestId(testId).waitFor({ state: 'visible' });
  }

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('template-data-export').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  assert.ok(downloadPath, 'Template data export did not produce a downloadable file.');
  const exported = JSON.parse(await fs.readFile(downloadPath, 'utf8'));
  assert.equal(exported.schemaVersion, 'player-pack-v1', 'Current Scouting export used the wrong schema version.');
  assert.equal(exported.templateType, 'scouting-report', 'Current Scouting export lost its template identity.');
  assert.equal(exported.visuals, undefined, 'Default data export unexpectedly included visual instructions.');

  await page.getByTestId('template-variants-toggle').click();
  await page.getByTestId('template-variant-scouting-data').waitFor({ state: 'visible' });
  await page.getByTestId('auto-layout-presets-toggle').click();
  await page.getByTestId('auto-layout-reset').waitFor({ state: 'visible' });

  assert.deepEqual(pageErrors, [], `Page errors occurred during Phase 11 browser QA: ${pageErrors.join(' | ')}`);
  console.log('Phase 11 smart-data & sidebar browser QA passed.');
} finally {
  await browser.close();
}
