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
  if (overflow > 2) {
    throw new Error(`${viewport.name}: horizontal overflow detected (${overflow}px)`);
  }
  if (metrics.artboards !== 1) {
    throw new Error(`${viewport.name}: expected exactly one visible editor artboard, got ${metrics.artboards}`);
  }

  if (viewport.width < 1024) {
    const menu = page.getByRole('button', { name: 'Open editor controls' });
    if (!(await menu.isVisible())) {
      throw new Error(`${viewport.name}: mobile/tablet editor menu is not visible`);
    }
  } else {
    const sidebarTemplates = page.getByRole('button', { name: /^Templates$/ });
    if (!(await sidebarTemplates.isVisible())) {
      throw new Error(`${viewport.name}: desktop editor sidebar is not visible`);
    }
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
          const templateButton = page.getByRole('button', { name: new RegExp(`^${template.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`) });
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

  console.log(`Visual QA passed: ${viewports.length} viewports × ${templates.length} templates = ${viewports.length * templates.length} screenshots.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
