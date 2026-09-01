import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const root = page.locator('#scouting-graphic-root');
  await root.waitFor({ state: 'visible' });
  const originalTitle = (await root.locator('h1').first().textContent())?.trim();
  assert.ok(originalTitle, 'Default graphic title did not render.');

  await page.getByTestId('auto-layout-presets-toggle').click();
  await page.getByTestId('auto-layout-preset-no-subject-full-content').click();
  await page.waitForTimeout(250);
  assert.equal(await root.getAttribute('data-auto-layout-preset'), 'no-subject-full-content', 'No-subject preset did not become active.');
  assert.ok((await root.locator('[data-layout-content="full"]').count()) > 0, 'No-subject preset did not expand supported content to full width.');
  assert.equal((await root.locator('h1').first().textContent())?.trim(), originalTitle, 'Auto-layout switch changed core template content.');

  await page.getByTestId('auto-layout-reset').click();
  await page.waitForTimeout(250);
  assert.equal(await root.getAttribute('data-auto-layout-preset'), 'player-right', 'Reset did not restore the safe default preset.');
  assert.ok((await root.locator('[data-layout-content="left"]').count()) > 0, 'Reset did not restore the default content side.');
  assert.equal((await root.locator('h1').first().textContent())?.trim(), originalTitle, 'Reset changed template content.');

  await page.getByTestId('auto-layout-preset-player-left').click();
  await page.waitForTimeout(250);
  assert.equal(await root.getAttribute('data-auto-layout-preset'), 'player-left', 'Player-left preset did not become active.');
  assert.ok((await root.locator('[data-layout-content="right"]').count()) > 0, 'Player-left preset did not move content into the safe opposite column.');
  assert.equal((await root.locator('h1').first().textContent())?.trim(), originalTitle, 'Player-left preset changed template content.');

  console.log('Phase 10 auto-layout browser QA passed.');
} finally {
  await browser.close();
}
