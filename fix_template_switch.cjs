const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const handleTemplateSwitch = \(newType: TemplateType\) => \{[\s\S]*?\}\s*;\s*\/\/\s*Switch aspect ratio/m, 
`const handleTemplateSwitch = (newType: TemplateType) => {
    onChange({ ...project, templateType: newType });
  };

  // Switch aspect ratio`);

fs.writeFileSync(file, code);
