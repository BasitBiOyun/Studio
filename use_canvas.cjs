const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('InteractiveCanvas')) {
  code = code.replace("import { ScoutingCard } from './components/ScoutingCard';", "import { ScoutingCard } from './components/ScoutingCard';\nimport { InteractiveCanvas } from './components/InteractiveCanvas';");
  
  // Wrap ScoutingCard
  // <ScoutingCard project={currentProject} />
  code = code.replace(
    /<ScoutingCard\s+project=\{currentProject\}\s*\/>/g, 
    `<InteractiveCanvas project={currentProject} onUpdateProject={pushState} interactive={true}>
                  <ScoutingCard project={currentProject} />
                </InteractiveCanvas>`
  );
  fs.writeFileSync(file, code);
}
