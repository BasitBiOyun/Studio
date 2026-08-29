const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Inject the active template helpers
code = code.replace('const handleLogoChange =', `
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { theme, layout: advancedLayout, visuals } = activeTemplate;
  const { logos, imageTransform, secondaryImageTransform, playerImageSrc, secondaryPlayerImageSrc } = visuals;
  const { player, credits } = project.sharedData;
  const { profile, stats, strengths, development, comparisonData, transferData } = activeTemplate.content;

  const updateVisuals = (updates) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, visuals: { ...activeTemplate.visuals, ...updates } } } });
  const updateContent = (updates) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, content: { ...activeTemplate.content, ...updates } } } });
  const updateShared = (updates) => onChange({ ...project, sharedData: { ...project.sharedData, ...updates } });
  const updateTheme = (theme) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, theme } } });
  const updateLayout = (layout) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, layout } } });

  const handleLogoChange =`);

// Replace handlers at the top
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*theme: t,\s*\}\)/g, 'updateTheme(t)');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*playerImageSrc: src,\s*\}\)/g, 'updateVisuals({ playerImageSrc: src })');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*secondaryPlayerImageSrc: src,\s*\}\)/g, 'updateVisuals({ secondaryPlayerImageSrc: src })');

// function handleImageTransform
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*imageTransform: \{\s*\.\.\.project\.imageTransform,\s*\[key\]: value,\s*\},\s*\}\);/g, 
  'updateVisuals({ imageTransform: { ...imageTransform, [key]: value } });');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*secondaryImageTransform: \{\s*\.\.\.current,\s*\[key\]: value,\s*\},\s*\}\);/g,
  'updateVisuals({ secondaryImageTransform: { ...current, [key]: value } });');

// function handleLogoChange
code = code.replace(/onChange\(\{ \.\.\.project, logos: nextLogos \}\);/g, 'updateVisuals({ logos: nextLogos });');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*logos:\s*\[\s*\.\.\.project\.logos,\s*\{\s*\.\.\.DEFAULT_LOGO,/g,
  'updateVisuals({ logos: [...logos, { ...DEFAULT_LOGO,');

// Replace standard reads:
code = code.replace(/project\.playerImageSrc/g, 'playerImageSrc');
code = code.replace(/project\.secondaryPlayerImageSrc/g, 'secondaryPlayerImageSrc');
code = code.replace(/project\.imageTransform/g, 'imageTransform');
code = code.replace(/project\.secondaryImageTransform/g, 'secondaryImageTransform');
code = code.replace(/project\.logos/g, 'logos');
code = code.replace(/project\.theme/g, 'theme');
code = code.replace(/project\.advancedLayout/g, 'advancedLayout');
code = code.replace(/project\.player/g, 'player');
code = code.replace(/project\.credits/g, 'credits');
code = code.replace(/project\.profile/g, 'profile');
code = code.replace(/project\.stats/g, 'stats');
code = code.replace(/project\.strengths/g, 'strengths');
code = code.replace(/project\.development/g, 'development');
code = code.replace(/project\.comparisonData/g, 'comparisonData');
code = code.replace(/project\.transferData/g, 'transferData');

// Fix onChange calls for player
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*player: \{/g, 'updateShared({ player: {');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*credits: \{/g, 'updateShared({ credits: {');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*profile: \{/g, 'updateContent({ profile: {');

// Fix onChange for layout
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*advancedLayout: \{/g, 'updateLayout({');

// Fix onChange for content arrays
code = code.replace(/onChange\(\{ \.\.\.project, stats: next \}\)/g, 'updateContent({ stats: next })');
code = code.replace(/onChange\(\{ \.\.\.project, strengths: next \}\)/g, 'updateContent({ strengths: next })');
code = code.replace(/onChange\(\{ \.\.\.project, development: next \}\)/g, 'updateContent({ development: next })');

// comparisonData and transferData nested changes are tricky. 
// e.g. onChange({ ...project, comparisonData: { ...comparisonData!, metrics: next } });
code = code.replace(/onChange\(\{ \.\.\.project, comparisonData: \{ \.\.\.comparisonData!?, metrics: next \} \}\)/g, 'updateContent({ comparisonData: { ...comparisonData!, metrics: next } })');

// For specific nested changes like transferData headline:
// onChange({ ...project, transferData: { ...transferData!, headline: e.target.value } })
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*transferData: \{/g, 'updateContent({ transferData: {');
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*comparisonData: \{/g, 'updateContent({ comparisonData: {');

// Template switch
// onChange({ ...project, templateType: t.type }) -> This stays the same because templateType is on root project.
// We should check `onChange({ ...project, templateType:` and revert if replaced wrongly.
// But wait, the `onChange({ ...project, templateType: t.type })` doesn't match above regex.

// Let's write back
fs.writeFileSync(file, code);
console.log('Sidebar updated');
