const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the destructuring line, usually something like:
  // const { player, profile, stats, strengths, development, theme, credits, advancedLayout, visualMode = 'editorial' } = project;
  
  content = content.replace(/const \{([^}]+)\} = project;/, (match, group) => {
    // group contains the variable names
    // we map them to sharedData or templates[project.templateType]
    const vars = group.split(',').map(s => s.trim()).filter(Boolean);
    
    // We will extract what we need from project
    return `const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { ${vars.filter(v => !['player', 'credits', 'theme', 'advancedLayout', "visualMode = 'editorial'", 'visualMode'].includes(v)).join(', ')} } = templateContent;
  const visualMode = project.visualMode || 'editorial';`;
  });

  fs.writeFileSync(filePath, content);
}

console.log('Views refactored');
