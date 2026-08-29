const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, '..', 'src', 'components', 'EditorSidebar.tsx');
let source = fs.readFileSync(sidebarPath, 'utf8');
let changed = false;

function replaceOnce(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`EditorSidebar repair failed: ${label} target not found.`);
  }
  source = source.replace(search, replacement);
  changed = true;
}

// The previous AI Studio patch injected a Visuals button with IconWand but never imported it.
// Reuse IconSparkles, which is already part of the sidebar icon set.
if (source.includes('<IconWand size={14} />')) {
  source = source.replaceAll('<IconWand size={14} />', '<IconSparkles size={14} />');
  changed = true;
}

// Restore the crop modal import that the upload handlers already expect.
if (!source.includes("import { ImageCropModal } from './ImageCropModal';")) {
  replaceOnce(
    "import { ClubLogoSelector } from './ClubLogoSelector';",
    "import { ClubLogoSelector } from './ClubLogoSelector';\nimport { ImageCropModal } from './ImageCropModal';",
    'ImageCropModal import',
  );
}

// Restore the crop state that was referenced by handlers/rendering but never declared.
if (!source.includes('const [cropState, setCropState]')) {
  replaceOnce(
    "  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('All');",
    "  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('All');\n  const [cropState, setCropState] = useState<{ src: string; type: 'primary' | 'secondary' | number } | null>(null);",
    'crop state',
  );
}

// Keep optional/heavier image tooling out of the initial editor bundle.
const primaryCompression = "        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });";
if (source.includes(primaryCompression)) {
  source = source.replace(
    primaryCompression,
    "        const { default: imageCompression } = await import('browser-image-compression');\n        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });",
  );
  changed = true;
}

const logoCompression = "        const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });";
if (source.includes(logoCompression)) {
  source = source.replace(
    logoCompression,
    "        const { default: imageCompression } = await import('browser-image-compression');\n        const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true });",
  );
  changed = true;
}

// Guard against stale logo indexes instead of crashing the whole sidebar.
const unsafeLogoCrop = `      const newLogos = [...activeTemplate.visuals.logos];\n      newLogos[cropState.type].src = croppedDataUrl;\n      newLogos[cropState.type].visible = true;\n      updateVisuals({ logos: newLogos });`;
if (source.includes(unsafeLogoCrop)) {
  source = source.replace(
    unsafeLogoCrop,
    `      const newLogos = [...activeTemplate.visuals.logos];\n      const targetLogo = newLogos[cropState.type];\n      if (targetLogo) {\n        targetLogo.src = croppedDataUrl;\n        targetLogo.visible = true;\n        updateVisuals({ logos: newLogos });\n      }`,
  );
  changed = true;
}

// Replace the partially integrated Vibrant implementation with a lazy, browser-safe version.
const oldThemeExtractor = `  const extractThemeFromImage = async (src: string) => {\n    try {\n      const img = new Image();\n      img.crossOrigin = 'Anonymous';\n      img.src = src;\n      img.onload = async () => {\n        const v = new Vibrant(img);\n        const palette = await v.getPalette();\n        const primary = palette.Vibrant?.hex || '#ffffff';\n        const secondary = palette.LightVibrant?.hex || '#aaaaaa';\n        const bg1 = palette.DarkMuted?.hex || '#000000';\n        updateTheme({\n          primaryAccent: primary,\n          secondaryAccent: secondary,\n          bg1: bg1,\n          bg2: '#111111'\n        });\n      };\n    } catch(e) {\n      console.error(e);\n    }\n  };`;

if (source.includes(oldThemeExtractor)) {
  source = source.replace(
    oldThemeExtractor,
    `  const extractThemeFromImage = async (src: string) => {\n    if (!src) return;\n\n    try {\n      const { Vibrant } = await import('node-vibrant/browser');\n      const palette = await Vibrant.from(src).getPalette();\n      const primary = palette.Vibrant?.hex || theme.primaryAccent;\n      const secondary = palette.LightVibrant?.hex || palette.Muted?.hex || theme.secondaryAccent;\n      const bg1 = palette.DarkMuted?.hex || palette.DarkVibrant?.hex || theme.bg1;\n\n      if (!window.confirm('Apply the generated palette to this template?')) return;\n\n      updateTheme({\n        ...theme,\n        primaryAccent: primary,\n        secondaryAccent: secondary,\n        bg1,\n      });\n    } catch (error) {\n      console.error('Theme extraction failed', error);\n      window.alert('Could not generate a theme from this image. The current theme was kept.');\n    }\n  };`,
  );
  changed = true;
}

// Surface upload failures instead of failing silently in the console.
source = source.replaceAll(
  "      } catch (err) {\n        console.error(err);\n      }",
  "      } catch (err) {\n        console.error(err);\n        window.alert('Image processing failed. The existing visual was kept.');\n      }",
);

// Fail fast if any of the known broken partial-integration identifiers remain.
const forbidden = [
  '<IconWand',
  'new Vibrant(',
];
for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`EditorSidebar repair incomplete: ${token} still present.`);
  }
}

for (const required of [
  "import { ImageCropModal } from './ImageCropModal';",
  'const [cropState, setCropState]',
  "await import('browser-image-compression')",
  "await import('node-vibrant/browser')",
]) {
  if (!source.includes(required)) {
    throw new Error(`EditorSidebar repair incomplete: ${required} missing.`);
  }
}

if (changed) {
  fs.writeFileSync(sidebarPath, source);
  console.log('EditorSidebar runtime integrations repaired.');
} else {
  console.log('EditorSidebar runtime integrations already healthy.');
}
