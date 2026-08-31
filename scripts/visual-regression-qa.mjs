import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.VISUAL_QA_URL || 'http://127.0.0.1:3000';
const OUT_DIR = process.env.VISUAL_QA_OUT || 'artifacts/visual-qa';

const viewports = [
  { name: 'phone-320', width: 320, height: 700 },
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'phone-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
];

const templates = [
  'Player Scouting Report',
  'Player Comparison',
  'Transfer Graphic',
  'Match Preview',
  'Match Analysis',
  'Tactical Analysis',
  'Stat Highlight',
  'Ranking / Top List',
  'Quote / Opinion Graphic',
  'Thread Cover',
  'Match Result',
  'Team Profile',
];

const slug = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

async function assertShell(page, viewport) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    artboards: document.querySelectorAll('[data-editor-artboard]').length,
  }));

  const overflow = Math.max(metrics.documentWidth, metrics.bodyWidth) - metrics.innerWidth;
  if (overflow > 2) throw new Error(`${viewport.name}: horizontal overflow detected (${overflow}px)`);
  if (metrics.artboards !== 1) throw new Error(`${viewport.name}: expected exactly one visible editor artboard, got ${metrics.artboards}`);

  if (viewport.width < 1024) {
    const menu = page.getByRole('button', { name: 'Open editor controls' });
    if (!(await menu.isVisible())) throw new Error(`${viewport.name}: mobile/tablet editor menu is not visible`);
  } else {
    const sidebarTemplates = page.getByRole('button', { name: /^Templates$/ });
    if (!(await sidebarTemplates.isVisible())) throw new Error(`${viewport.name}: desktop editor sidebar is not visible`);
  }
}

async function openTemplates(page, viewport) {
  if (viewport.width < 1024) {
    await page.getByRole('button', { name: 'Open editor controls' }).click();
    await page.getByRole('dialog', { name: 'Graphic editor controls' }).waitFor({ state: 'visible' });
  }
  await page.getByRole('button', { name: /^Templates$/ }).click();
}

async function closeTemplates(page, viewport) {
  if (viewport.width < 1024) {
    await page.getByRole('button', { name: 'Close editor controls' }).click();
    await page.getByRole('dialog', { name: 'Graphic editor controls' }).waitFor({ state: 'detached' });
  }
}

async function runPhase2Interactions(page) {
  // Sidebar drag-resize should change its actual rendered width without breaking the canvas.
  const sidebar = page.locator('.bbo-sidebar-v3').first();
  const separator = page.getByRole('separator', { name: 'Resize editor sidebar' }).first();
  const before = await sidebar.boundingBox();
  const grip = await separator.boundingBox();
  if (!before || !grip) throw new Error('Phase 2: resize handle/sidebar bounds unavailable.');
  await page.mouse.move(grip.x + grip.width / 2, grip.y + 80);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2 + 70, grip.y + 80, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(120);
  const after = await sidebar.boundingBox();
  if (!after || after.width < before.width + 40) throw new Error(`Phase 2: sidebar resize did not expand (${before.width} -> ${after?.width}).`);

  // Whole-Studio language toggle, not only the rendered card.
  await page.getByRole('button', { name: 'TR', exact: true }).click();
  await page.getByRole('button', { name: 'Şablonlar', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'Templates', exact: true }).waitFor({ state: 'visible' });

  // Real club selection must survive the update and appear as selected instead of being erased by stale state.
  await page.getByRole('button', { name: 'Templates', exact: true }).click();
  await page.getByRole('button', { name: 'Transfer Graphic', exact: false }).first().click();
  await page.getByRole('button', { name: 'Visuals', exact: true }).click();
  await page.getByRole('button', { name: 'Search Club Database', exact: true }).first().click();
  const searchInput = page.locator('input[placeholder="e.g. Liverpool, Fenerbahçe..."]').first();
  await searchInput.fill('Arsenal');
  await page.waitForTimeout(150);
  const arsenalResult = page.locator('button').filter({ hasText: /^Arsenal/ }).first();
  await arsenalResult.waitFor({ state: 'visible', timeout: 5_000 });
  await arsenalResult.click();
  await page.getByText('From Club Logo (Selected)', { exact: true }).waitFor({ state: 'visible', timeout: 5_000 });

  const selectedLogoCount = await page.locator('#scouting-graphic-root .moveable-target img').count();
  if (selectedLogoCount < 1) throw new Error('Phase 2: selected Arsenal logo did not reach the graphic canvas.');

  // Fixed brand logo must resolve to a real bundled image.
  const brandLogo = page.locator('#scouting-graphic-root img[alt="BasitBiOyun"]').first();
  await brandLogo.waitFor({ state: 'attached', timeout: 5_000 });
  const brandOk = await brandLogo.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0);
  if (!brandOk) throw new Error('Phase 2: bundled BasitBiOyun footer logo is broken.');

  // Social footer replaced the old Football Editorial Analytics attribution.
  const footerText = await page.locator('#scouting-graphic-root').innerText();
  if (footerText.includes('Football Editorial Analytics') || footerText.includes('Futbol Analizleri')) {
    throw new Error('Phase 2: legacy footer attribution is still visible.');
  }
  if (!footerText.includes('@BasitBiOyun')) throw new Error('Phase 2: social footer handles are missing.');

  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-1440__phase2-interactions.png'), fullPage: false });
}

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const failures = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();

      page.on('pageerror', (error) => failures.push(`${viewport.name}: page error: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error') failures.push(`${viewport.name}: console error: ${message.text()}`);
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.locator('[data-editor-artboard]').waitFor({ state: 'visible', timeout: 30_000 });
      await assertShell(page, viewport);

      for (const template of templates) {
        try {
          await openTemplates(page, viewport);
          const templateButton = page.getByRole('button', { name: template, exact: false }).first();
          await templateButton.scrollIntoViewIfNeeded();
          await templateButton.click();
          await closeTemplates(page, viewport);
          await page.waitForTimeout(120);
          await assertShell(page, viewport);

          const file = path.join(OUT_DIR, `${viewport.name}__${slug(template)}.png`);
          await page.screenshot({ path: file, fullPage: false });
        } catch (error) {
          failures.push(`${viewport.name} / ${template}: ${error instanceof Error ? error.message : String(error)}`);
          const failurePath = path.join(OUT_DIR, `${viewport.name}__${slug(template)}__FAILED.png`);
          await page.screenshot({ path: failurePath, fullPage: false }).catch(() => {});
          if (viewport.width < 1024) {
            const close = page.getByRole('button', { name: 'Close editor controls' });
            if (await close.isVisible().catch(() => false)) await close.click().catch(() => {});
          }
        }
      }

      if (viewport.name === 'desktop-1440') {
        try {
          await runPhase2Interactions(page);
        } catch (error) {
          failures.push(`desktop-1440 / phase-2 interactions: ${error instanceof Error ? error.message : String(error)}`);
          await page.screenshot({ path: path.join(OUT_DIR, 'desktop-1440__phase2-interactions__FAILED.png'), fullPage: false }).catch(() => {});
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(`Visual QA failed with ${failures.length} issue(s):`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Visual QA passed: ${viewports.length} viewports × ${templates.length} templates plus phase-2 interaction checks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});