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
  const launcher = page.getByTestId('batch-content-generator');
  const button = page.getByTestId('batch-content-generate');
  await launcher.waitFor({ state: 'visible' });
  await button.waitFor({ state: 'visible' });

  const tools = page.getByTestId('studio-tools-panel');
  assert.equal(await launcher.evaluate((node, panel) => panel.contains(node), await tools.elementHandle()), true, 'Batch generator must live inside Studio Tools instead of floating over the editor.');

  await button.click();
  const result = page.getByTestId('batch-content-result');
  await result.waitFor({ state: 'visible' });
  assert.match((await result.textContent()) || '', /output saved to Projects Library/);

  const generated = await page.evaluate(async () => {
    const request = indexedDB.open('FootballStudioDB');
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = db.transaction('projects', 'readonly');
    const store = transaction.objectStore('projects');
    const allRequest = store.getAll();
    const projects = await new Promise((resolve, reject) => {
      allRequest.onsuccess = () => resolve(allRequest.result);
      allRequest.onerror = () => reject(allRequest.error);
    });
    db.close();
    return projects.filter((project) => String(project.id || '').startsWith('batch-'));
  });

  assert.ok(generated.length >= 2, 'Batch generation did not persist independently editable projects.');
  const main = generated.find((project) => / - Main$/.test(project.name || ''));
  const story = generated.find((project) => / - Story$/.test(project.name || ''));
  assert.ok(main, 'Main graphic output missing from project library.');
  assert.ok(story, 'Story output missing from project library.');
  assert.notEqual(main.id, story.id, 'Generated outputs are not independent projects.');
  assert.equal(story.aspectRatio, '9:16', 'Story output is not vertical.');
  assert.equal(main.templates[main.templateType].theme.name, story.templates[story.templateType].theme.name, 'Brand preset was not reused across coordinated outputs.');

  const mainLogos = main.templates[main.templateType].visuals.logos || [];
  const storyLogos = story.templates[story.templateType].visuals.logos || [];
  assert.deepEqual(storyLogos.map(({ id, name, src }) => ({ id, name, src })), mainLogos.map(({ id, name, src }) => ({ id, name, src })), 'Semantic logo identities changed between main and vertical outputs.');

  assert.deepEqual(pageErrors, [], `Page errors occurred during Phase 12 browser QA: ${pageErrors.join(' | ')}`);
  console.log('Phase 12 batch content generator browser QA passed.');
} finally {
  await browser.close();
}
