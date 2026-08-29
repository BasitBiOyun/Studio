const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'TemplateForms.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const data = project\.([a-zA-Z]+);/g, "const data = project.templates[project.templateType]?.content.$1;");

fs.writeFileSync(file, code);
console.log('TemplateForms fixed');
