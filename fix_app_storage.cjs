const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace synchronous initialization with useEffect
if (code.includes('useState<Project>(() => loadCurrentProject())')) {
  code = code.replace(
    'const [projectState, setProjectState] = useState<Project>(() => loadCurrentProject());',
    `const [projectState, setProjectState] = useState<Project | null>(null);
  
  useEffect(() => {
    async function init() {
      // Assuming loadCurrentProject becomes async
      const proj = await loadCurrentProject();
      setProjectState(proj);
    }
    init();
  }, []);`
  );
  
  // also wrap the entire return statement in a check
  code = code.replace('return (', 'if (!projectState) return <div className="flex h-screen items-center justify-center bg-black text-white">Loading Editor...</div>;\n\n  return (');
}

fs.writeFileSync(file, code);
