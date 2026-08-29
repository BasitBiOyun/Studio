const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'hooks', 'useHistory.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'export function useHistory(initialProject: Project) {',
  'export function useHistory(initialProject: Project | null) {'
);

code = code.replace(
  'const [history, setHistory] = useState<Project[]>([initialProject]);',
  'const [history, setHistory] = useState<Project[]>(initialProject ? [initialProject] : []);\n  const [initialized, setInitialized] = useState(!!initialProject);'
);

code = code.replace(
  'const currentProject = history[currentIndex] || initialProject;',
  'const currentProject = history[currentIndex] || initialProject || {} as Project;'
);

code = code.replace(
  /const pushState = useCallback\(\(newProject: Project, replaceCurrent = false\) => \{/,
  `useEffect(() => {
    if (initialProject && !initialized) {
      setHistory([initialProject]);
      setCurrentIndex(0);
      setInitialized(true);
    }
  }, [initialProject, initialized]);

  const pushState = useCallback((newProject: Project, replaceCurrent = false) => {`
);

fs.writeFileSync(file, code);
