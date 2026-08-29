const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Fix applyThemePreset
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*theme:\s*\{\s*\.\.\.preset\s*\}\);\s*\}\s*;/g, 
  'updateTheme({ ...preset }); };');
// wait, the original might have been: onChange({ ...project, theme: { ...preset } }); 
// and my script made it `theme: { ...preset });`

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*theme:\s*\{\s*\.\.\.preset\s*\}\)\s*;/g, 'updateTheme({ ...preset });');

// Actually, I can just replace these entire functions because they are short.
code = code.replace(/const applyThemePreset = \(preset: ThemeColors\) => \{[\s\S]*?\};\s*const updateThemeField/m, 
`const applyThemePreset = (preset: ThemeColors) => {
    updateTheme(preset);
  };

  const updateThemeField`);

code = code.replace(/const updateThemeField = \(field: keyof ThemeColors, value: any\) => \{[\s\S]*?\};\s*\/\/ Image Transform Update/m,
`const updateThemeField = (field: keyof ThemeColors, value: any) => {
    updateTheme({ ...theme, [field]: value });
  };

  // Image Transform Update`);

code = code.replace(/const updateImageTransform = \(field: keyof Project\['imageTransform'\], value: any\) => \{[\s\S]*?\};\s*\/\/ Secondary Image Transform Update/m,
`const updateImageTransform = (field: keyof typeof imageTransform, value: any) => {
    updateVisuals({ imageTransform: { ...imageTransform, [field]: value } });
  };

  // Secondary Image Transform Update`);

code = code.replace(/const updateSecondaryImageTransform = \(field: keyof Project\['imageTransform'\], value: any\) => \{[\s\S]*?\};\s*\/\/ Logo Update/m,
`const updateSecondaryImageTransform = (field: keyof typeof imageTransform, value: any) => {
    const current = secondaryImageTransform || { ...imageTransform };
    updateVisuals({ secondaryImageTransform: { ...current, [field]: value } });
  };

  // Logo Update`);

fs.writeFileSync(file, code);
