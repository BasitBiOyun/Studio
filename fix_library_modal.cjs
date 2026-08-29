const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'ProjectLibraryModal.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const [projects, setProjects] = useState<Project[]>([]);',
  'const [projects, setProjects] = useState<Project[]>([]);\n  useEffect(() => {\n    loadProjectsList().then(setProjects);\n  }, []);'
);

// We need to fix calls to loadProjectsList inside ProjectLibraryModal
// There are multiple setProjects(loadProjectsList()) calls
code = code.replace(/setProjects\(loadProjectsList\(\)\);/g, 'loadProjectsList().then(setProjects);');

// Fix deleteProjectFromList and duplicateProjectInList
code = code.replace(/setProjects\(deleteProjectFromList\(id\)\);/g, 'deleteProjectFromList(id).then(setProjects);');
code = code.replace(/const newProj = duplicateProjectInList\(id\);/g, 'const newProj = await duplicateProjectInList(id);');
code = code.replace(/onSelectProject\(newProj\);/g, 'if (newProj) onSelectProject(newProj);');

// The duplicate handler might not be async
code = code.replace(/const handleDuplicate = \(id: string\) => \{/g, 'const handleDuplicate = async (id: string) => {');

// The delete handler
code = code.replace(/const handleDelete = \(id: string\) => \{/g, 'const handleDelete = async (id: string) => {');

// check create new project
code = code.replace(/const handleCreateNew = \(\) => \{/g, 'const handleCreateNew = async () => {');
code = code.replace(/const newProj = createNewProjectFromBrand\(brand, templateType\);/g, 'const newProj = await createNewProjectFromBrand(brand, templateType);');


fs.writeFileSync(file, code);
