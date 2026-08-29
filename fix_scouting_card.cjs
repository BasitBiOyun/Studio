const fs = require('fs');
const path = require('path');

const cardPath = path.join(__dirname, 'src', 'components', 'ScoutingCard.tsx');
let content = fs.readFileSync(cardPath, 'utf8');

// Replace the destructuring of project inside ScoutingCard
content = content.replace(/const \{\s*templateType = 'scouting-report',\s*aspectRatio = '1:1',\s*theme,\s*playerImageSrc,\s*secondaryPlayerImageSrc,\s*imageTransform,\s*secondaryImageTransform,\s*logos,\s*advancedLayout,\s*\} = project;/g, `
    const { templateType = 'scouting-report', aspectRatio = '1:1', visualMode = 'editorial' } = project;
    const activeTemplate = project.templates[templateType] || project.templates['scouting-report'];
    const { theme, layout: advancedLayout, visuals: { playerImageSrc, secondaryPlayerImageSrc, imageTransform, secondaryImageTransform, logos } } = activeTemplate;
`);

fs.writeFileSync(cardPath, content);
console.log('ScoutingCard refactored');
