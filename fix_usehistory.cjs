const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'hooks', 'useHistory.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'export function useHistory(initialState: Project)',
  'export function useHistory(initialState: Project | null)'
);

code = code.replace(
  'const [past, setPast] = useState<Project[]>([]);',
  'const [past, setPast] = useState<Project[]>([]);\n  const [initialized, setInitialized] = useState(false);'
);

code = code.replace(
  'const [current, setCurrent] = useState<Project>(initialState);',
  'const [current, setCurrent] = useState<Project | null>(initialState);'
);

code = code.replace(
  /useEffect\(\(\) => \{\n\s*setCurrent\(initialState\);\n\s*\}, \[initialState\]\);/,
  `useEffect(() => {
    if (initialState && !initialized) {
      setCurrent(initialState);
      setInitialized(true);
    }
  }, [initialState, initialized]);`
);

code = code.replace(
  'return {\n    currentProject: current,',
  'return {\n    currentProject: current as Project,' // assume it will not be accessed before load
);

fs.writeFileSync(file, code);
