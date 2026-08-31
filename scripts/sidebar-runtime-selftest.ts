import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const sidebarPath = path.join(process.cwd(), 'src', 'components', 'EditorSidebarV3.tsx');
const source = fs.readFileSync(sidebarPath, 'utf8');

assert.ok(!source.includes('<IconWand'), 'Visuals tab must not reference an undefined IconWand.');
assert.ok(source.includes("import { ImageCropModal } from './ImageCropModal';"), 'Crop modal must be wired into the template-aware sidebar.');
assert.ok(source.includes('const [cropState, setCropState]'), 'Crop state must be declared.');
assert.ok(source.includes("await import('browser-image-compression')"), 'Image compression must load lazily.');
assert.ok(source.includes("await import('node-vibrant/browser')"), 'Optional palette extraction must stay lazy-loaded.');
assert.ok(source.includes('Apply the generated palette to this template?'), 'Palette extraction must require confirmation.');
assert.ok(source.includes('getTemplateVisualPolicy'), 'Visual controls must follow the active template visual policy.');
assert.ok(source.includes('templatePackLabel(project.templateType)'), 'JSON import label must follow the active template.');
assert.ok(source.includes('parseTemplatePack'), 'Sidebar JSON import must use the generic template pack parser.');
assert.ok(source.includes('upscaleImage2x'), 'Free local 2x enhancement must remain available in visual controls.');
assert.ok(source.includes('<ImageCropModal'), 'Crop modal must render when cropState is active.');
assert.ok(source.includes("project.templateType === 'player-comparison'"), 'Player comparison must have its own data form.');
assert.ok(source.includes("project.templateType === 'transfer-graphic'"), 'Transfer graphic must have its own data form.');
assert.ok(source.includes('<TemplateForms project={project} onChange={onChange} />'), 'Other templates must use their template-specific forms.');
assert.ok(source.includes("updateLogo(index, { src: logoUrl, visible: true })"), 'Club logo selection must update src and visibility atomically.');
assert.ok(source.includes('preset.primaryAccent') && source.includes('preset.secondaryAccent'), 'Editorial theme buttons must show color swatches.');
assert.ok(source.includes('attachStudioLocalization(document.body, outputLanguage)'), 'TR/EN must localize the whole Studio UI.');
assert.ok(source.includes('Footer & Social Accounts') && source.includes('updateFooterSocials'), 'Footer social accounts must be configurable.');
assert.ok(source.includes('DISPLAY_FONTS') && source.includes('Bebas Neue') && source.includes('Titillium Web'), 'Sports display font library must be expanded.');
assert.ok(source.includes('Resize editor sidebar') && source.includes('--bbo-sidebar-width'), 'Desktop editor sidebar must be drag-resizable.');

console.log('Sidebar runtime self-test passed: phase-2 template-aware editor controls are wired.');
