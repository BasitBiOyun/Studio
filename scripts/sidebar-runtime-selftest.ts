import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const sidebarPath = path.join(process.cwd(), 'src', 'components', 'EditorSidebar.tsx');
const source = fs.readFileSync(sidebarPath, 'utf8');

assert.ok(!source.includes('<IconWand'), 'Visuals tab must not reference an undefined IconWand.');
assert.ok(source.includes("import { ImageCropModal } from './ImageCropModal';"), 'Crop modal must be wired into EditorSidebar.');
assert.ok(source.includes('const [cropState, setCropState]'), 'Crop state must be declared.');
assert.ok(source.includes("await import('browser-image-compression')"), 'Image compression must load lazily.');
assert.ok(source.includes("await import('node-vibrant/browser')"), 'Vibrant browser bundle must load lazily.');
assert.ok(source.includes('...theme,'), 'Generated palettes must preserve the existing theme shape.');
assert.ok(source.includes('Apply the generated palette to this template?'), 'Theme generation must require confirmation.');
assert.ok(source.includes('<ImageCropModal'), 'Crop modal must render when cropState is active.');

console.log('Sidebar runtime self-test passed: visuals integrations are wired and guarded.');
