import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const root = page.locator('#scouting-graphic-root');
  await root.waitFor({ state: 'visible' });
  assert.equal(await root.getAttribute('data-template-variant'), 'scouting-editorial', 'Scouting default variant is not editorial.');

  const originalTitle = (await root.locator('h1').first().textContent())?.trim();
  assert.ok(originalTitle, 'Could not read the original scouting title.');

  await page.getByTestId('template-variants-toggle').click();
  await page.getByTestId('template-variant-scouting-data').click();
  await page.waitForTimeout(450);
  assert.equal(await root.getAttribute('data-template-variant'), 'scouting-data', 'Data variant did not render through the real editor UI.');
  assert.equal((await root.locator('h1').first().textContent())?.trim(), originalTitle, 'Switching to Data changed template content.');

  await page.waitForTimeout(850);
  await page.reload({ waitUntil: 'networkidle' });
  const reloadedRoot = page.locator('#scouting-graphic-root');
  await reloadedRoot.waitFor({ state: 'visible' });
  assert.equal(await reloadedRoot.getAttribute('data-template-variant'), 'scouting-data', 'Selected variant did not survive project reload.');
  assert.equal((await reloadedRoot.locator('h1').first().textContent())?.trim(), originalTitle, 'Reload after variant selection lost content.');

  await page.getByTestId('template-variants-toggle').click();
  await page.getByTestId('template-variant-scouting-editorial').click();
  await page.waitForTimeout(450);
  assert.equal(await reloadedRoot.getAttribute('data-template-variant'), 'scouting-editorial', 'Switching back to Editorial failed.');
  assert.equal((await reloadedRoot.locator('h1').first().textContent())?.trim(), originalTitle, 'Reversible variant switching changed content.');
  assert.deepEqual(pageErrors, [], `Page errors occurred during variant switching: ${pageErrors.join(' | ')}`);

  console.log('Phase 9 browser template-variant QA passed.');
} finally {
  await browser.close();
}
