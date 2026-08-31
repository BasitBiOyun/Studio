import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const sidebarPath = path.join(process.cwd(), 'src', 'components', 'EditorSidebarV2.tsx');
const source = fs.readFileSync(sidebarPath, 'utf8');

assert.ok(!source.includes('<IconWand'), 'Visuals tab must not reference an undefined IconWand.');
assert.ok(source.includes("import { ImageCropModal } from './ImageCropModal';"), 'Crop modal must be wired into the template-aware sidebar.');
assert.ok(source.includes('const [cropState, setCropState]'), 'Crop state must be declared.');
assert.ok(source.includes("await import('browser-image-compression')"), 'Image compression must load lazily.');
assert.ok(source.includes('getTemplateVisualPolicy'), 'Visual controls must follow the active template visual policy.');
assert.ok(source.includes('templatePackLabel(project.templateType)'), 'JSON import label must follow the active template.');
assert.ok(source.includes('parseTemplatePack'), 'Sidebar JSON import must use the generic template pack parser.');
assert.ok(source.includes('upscaleImage2x'), 'Free client-side 2x upscale must remain available in visual controls.');
assert.ok(source.includes('<ImageCropModal'), 'Crop modal must render when cropState is active.');
assert.ok(source.includes("project.templateType === 'player-comparison'"), 'Player comparison must have its own data form.');
assert.ok(source.includes("project.templateType === 'transfer-graphic'"), 'Transfer graphic must have its own data form.');
assert.ok(source.includes('<TemplateForms project={project} onChange={onChange} />'), 'Other templates must use their template-specific forms.');

console.log('Sidebar runtime self-test passed: template-aware data, visuals, crop and upscale controls are wired.');
