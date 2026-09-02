import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const toggle = page.getByTestId('social-safe-zone-toggle');
  await toggle.waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-pressed'), 'false', 'Safe-zone preview should default off.');
  assert.equal(await page.getByTestId('social-safe-zone-overlay').count(), 0, 'Overlay rendered before it was enabled.');

  const previewRoot = page.locator('#scouting-graphic-root');
  const exportRoot = page.locator('[data-graphic-root="true"]').filter({ hasNot: page.locator('#scouting-graphic-root') });
  await previewRoot.waitFor({ state: 'visible' });

  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true', 'Safe-zone toggle did not enable preview.');

  const overlay = page.getByTestId('social-safe-zone-overlay');
  await overlay.waitFor({ state: 'visible' });
  assert.equal(await overlay.getAttribute('data-social-safe-zone-overlay'), 'preview-only');
  assert.ok(['1:1', '4:5', '16:9', '9:16'].includes(await overlay.getAttribute('data-aspect-ratio')), 'Overlay reported an unsupported aspect ratio.');

  assert.equal(await previewRoot.locator('[data-social-safe-zone-overlay]').count(), 1, 'Preview root is missing its enabled overlay.');
  assert.equal(await page.locator('[aria-hidden="true"] [data-social-safe-zone-overlay]').count(), 0, 'Preview overlay leaked into hidden export DOM.');

  const frameBox = await page.getByTestId('social-safe-zone-frame').boundingBox();
  const previewBox = await previewRoot.boundingBox();
  assert.ok(frameBox && previewBox, 'Could not measure safe-zone frame.');
  assert.ok(frameBox.x > previewBox.x && frameBox.y > previewBox.y, 'Safe-zone frame does not inset from canvas edges.');
  assert.ok(frameBox.width < previewBox.width && frameBox.height < previewBox.height, 'Safe-zone frame exceeds canvas bounds.');

  await toggle.click();
  assert.equal(await page.getByTestId('social-safe-zone-overlay').count(), 0, 'Safe-zone overlay did not turn off cleanly.');

  assert.deepEqual(pageErrors, [], `Page errors occurred during Phase 13 browser QA: ${pageErrors.join(' | ')}`);
  console.log('Phase 13 social safe-zone browser QA passed.');
} finally {
  await browser.close();
}
