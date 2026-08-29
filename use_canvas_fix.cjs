const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<ScoutingCard\n\s+ref=\{cardElementRef\}\n\s+project=\{currentProject\}\n\s+onUpdateTransform=\{handleCanvasTransform\}\n\s+interactive=\{true\}\n\s+\/>/g,
  `<InteractiveCanvas project={currentProject} onUpdateProject={pushState} interactive={true}>
                <ScoutingCard
                  ref={cardElementRef}
                  project={currentProject}
                  onUpdateTransform={handleCanvasTransform}
                  interactive={true}
                />
              </InteractiveCanvas>`
);

fs.writeFileSync(file, code);
