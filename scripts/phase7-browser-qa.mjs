import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByTestId('asset-library-open').click();
  await page.getByTestId('asset-library-modal').waitFor({ state: 'visible' });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#11aacc"/><circle cx="40" cy="40" r="24" fill="#ffffff"/></svg>`;
  await page.getByTestId('asset-library-upload-input').setInputFiles({
    name: 'phase7-persist.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(svg),
  });

  const initialCard = page.locator('[data-asset-name="phase7-persist"]');
  await initialCard.waitFor({ state: 'visible' });

  await page.getByTestId('asset-library-search').fill('phase7-persist');
  assert.equal(await initialCard.count(), 1, 'Search did not find the uploaded asset by name.');
  await page.getByTestId('asset-library-search').fill('');

  page.once('dialog', (dialog) => dialog.accept('phase7-renamed'));
  await initialCard.locator('[data-action="rename"]').click();
  const renamedCard = page.locator('[data-asset-name="phase7-renamed"]');
  await renamedCard.waitFor({ state: 'visible' });

  await page.getByTestId('asset-library-close').click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('asset-library-open').click();
  await page.locator('[data-asset-name="phase7-renamed"]').waitFor({ state: 'visible' });

  const persistedCard = page.locator('[data-asset-name="phase7-renamed"]');
  await persistedCard.locator('[data-action="apply"]').click();
  await page.waitForTimeout(650);
  await page.getByTestId('asset-library-close').click();

  await page.reload({ waitUntil: 'networkidle' });
  const appliedImages = page.locator('main img[src^="data:image/svg+xml"]');
  assert.ok((await appliedImages.count()) > 0, 'Applied library asset did not persist in project state after reload.');

  await page.getByTestId('asset-library-open').click();
  const deletionCard = page.locator('[data-asset-name="phase7-renamed"]');
  await deletionCard.waitFor({ state: 'visible' });
  page.once('dialog', (dialog) => dialog.accept());
  await deletionCard.locator('[data-action="remove"]').click();
  await deletionCard.waitFor({ state: 'detached' });
  await page.getByTestId('asset-library-close').click();
  await page.waitForTimeout(650);

  await page.reload({ waitUntil: 'networkidle' });
  assert.ok((await page.locator('main img[src^="data:image/svg+xml"]').count()) > 0, 'Removing a library asset corrupted the project copy.');

  await page.getByTestId('asset-library-open').click();
  assert.equal(await page.locator('[data-asset-name="phase7-renamed"]').count(), 0, 'Deleted asset returned after reload.');

  console.log('Phase 7 browser asset-library QA passed.');
} finally {
  await browser.close();
}
