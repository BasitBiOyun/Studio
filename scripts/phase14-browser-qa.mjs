import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.addInitScript(() => {
    const legacy = {
      id: 'phase14-legacy-project',
      name: 'PHASE 14 LEGACY PROJECT',
      templateType: 'transfer-graphic',
      aspectRatio: '1:1',
      createdAt: Date.now() - 100000,
      updatedAt: Date.now() - 50000,
      sharedData: {
        player: { name: 'Legacy Player', age: '', nationality: '', preferredFoot: '', height: '', positions: '', club: '' },
        credits: { preparedFor: 'Legacy', visualBy: 'Legacy' },
      },
      templates: {
        'transfer-graphic': {
          visuals: {
            playerImageSrc: '',
            imageTransform: { x: 0, y: 0, scale: 1, brightness: 100, contrast: 100, saturation: 100, opacity: 100, flipHorizontal: false, grayscale: false, shadow: false, edgeGlow: false, bottomFade: false },
            logos: [{ id: 'legacy-generic', name: 'Legacy Generic', src: 'data:image/svg+xml,AMBIGUOUS', visible: true, x: 0, y: 0, size: 100, opacity: 100 }],
          },
        },
      },
    };
    localStorage.setItem('bbo_projects_library', JSON.stringify([legacy]));
    localStorage.setItem('bbo_current_project', JSON.stringify(legacy));
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByTestId('studio-topbar').waitFor({ state: 'visible' });

  const bodyText = (await page.locator('body').textContent()) || '';
  assert.ok(!bodyText.includes('Editor failed to start'), 'Legacy saved project triggered the fatal error boundary.');

  await page.getByTitle('Projects Library').click();
  await page.getByText('PHASE 14 LEGACY PROJECT', { exact: true }).first().waitFor({ state: 'visible' });

  assert.deepEqual(pageErrors, [], `Legacy project caused browser errors: ${pageErrors.join(' | ')}`);
  console.log('Phase 14 legacy saved-project browser QA passed.');
} finally {
  await browser.close();
}
