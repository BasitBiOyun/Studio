import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error?.message || error)));

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByTestId('entity-database-open').click();
  await page.getByTestId('entity-database-modal').waitFor({ state: 'visible' });

  await page.getByTestId('entity-mode-club').click();
  await page.getByTestId('entity-search').fill('Fenerbahçe');
  const clubResult = page.locator('[data-entity-name]').first();
  await clubResult.waitFor({ state: 'visible' });
  const selectedClubName = await clubResult.getAttribute('data-entity-name');
  assert.ok(selectedClubName, 'Club catalogue result did not expose entity name.');
  await clubResult.click();
  await page.getByTestId('entity-applied-status').waitFor({ state: 'visible' });

  await page.getByTestId('entity-database-close').click();
  await page.waitForTimeout(700);
  assert.ok((await page.locator('main').getByText(selectedClubName, { exact: false }).count()) > 0, 'Explicit club selection did not update the safely mapped club identity text.');

  await page.reload({ waitUntil: 'networkidle' });
  assert.ok((await page.locator('main').getByText(selectedClubName, { exact: false }).count()) > 0, 'Club selection did not persist after reload.');

  await page.getByTestId('entity-database-open').click();
  await page.getByTestId('entity-mode-competition').click();
  await page.getByTestId('entity-search').fill('Champions League');
  const competitionResult = page.locator('[data-entity-id="uefa-champions-league"]');
  await competitionResult.waitFor({ state: 'visible' });
  await competitionResult.click();
  await page.getByTestId('entity-applied-status').waitFor({ state: 'visible' });
  await page.getByTestId('entity-database-close').click();
  await page.waitForTimeout(700);

  assert.ok((await page.locator('main img[src^="data:image/"]').count()) > 0, 'Competition selection did not materialize a stable logo/fallback into the semantic visual slot.');
  assert.deepEqual(pageErrors, [], `Phase 8 browser flow raised page errors: ${pageErrors.join(' | ')}`);

  console.log('Phase 8 club & competition database browser QA passed.');
} finally {
  await browser.close();
}
