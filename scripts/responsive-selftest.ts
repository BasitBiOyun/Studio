import fs from 'node:fs';

function read(path: string): string {
  return fs.readFileSync(path, 'utf8');
}

function expectContains(source: string, needle: string, label: string) {
  if (!source.includes(needle)) {
    throw new Error(`Responsive self-test failed: ${label}`);
  }
}

const app = read('src/App.tsx');
const topBar = read('src/components/TopBar.tsx');
const drawer = read('src/components/MobileDrawer.tsx');
const css = read('src/index.css');
const pkg = JSON.parse(read('package.json'));

expectContains(app, 'h-[100dvh]', 'app must use dynamic viewport height');
expectContains(app, 'hidden lg:flex', 'desktop sidebar must wait until large screens');
expectContains(app, 'lg:hidden', 'mobile/tablet edit control must remain available below lg');
expectContains(app, 'responsive-bottom', 'floating controls must respect safe-area bottom inset');
expectContains(topBar, 'lg:hidden', 'top bar editor-menu button must remain available below lg');
expectContains(topBar, 'hidden sm:inline', 'mobile export button must collapse its text');
expectContains(topBar, 'hidden xl:flex', 'wide-only toolbar actions must not crowd tablet widths');
expectContains(drawer, 'lg:hidden', 'drawer must support phone and tablet widths');
expectContains(drawer, 'mobile-editor-sidebar', 'drawer must opt into mobile editor form rules');
expectContains(drawer, 'maxHeight: \'92dvh\'', 'drawer must use dynamic viewport units');
expectContains(css, '.responsive-bottom', 'safe-area floating control rule must exist');
expectContains(css, '.mobile-editor-sidebar', 'mobile editor responsive form rules must exist');
expectContains(css, '@media (max-width: 380px)', 'very narrow phone layout must be handled');

if (String(pkg.scripts?.prebuild || '').includes('sync-uefa-club-catalogue')) {
  throw new Error('Responsive self-test failed: production build must not depend on live club catalogue sync');
}

console.log('Responsive self-test passed: phone, tablet, desktop shell rules and deterministic prebuild are present.');
