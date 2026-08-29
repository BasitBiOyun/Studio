const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

const injection = `
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { theme, layout: advancedLayout, visuals } = activeTemplate;
  const { logos, imageTransform, secondaryImageTransform, playerImageSrc, secondaryPlayerImageSrc } = visuals;
  const { player, credits } = project.sharedData;
  const { profile, stats, strengths, development, comparisonData, transferData, matchPreviewData, matchAnalysisData, tacticalData, statHighlightData, rankingData, quoteData, threadCoverData, matchResultData, teamProfileData } = activeTemplate.content;

  const updateVisuals = (updates: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, visuals: { ...activeTemplate.visuals, ...updates } } } });
  const updateContent = (updates: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, content: { ...activeTemplate.content, ...updates } } } });
  const updateShared = (updates: any) => onChange({ ...project, sharedData: { ...project.sharedData, ...updates } });
  const updateTheme = (theme: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, theme } } });
  const updateLayout = (layout: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, layout } } });
`;

code = code.replace(/const \[templateCategoryFilter, setTemplateCategoryFilter\] = useState<string>\('All'\);/g, 
  `const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('All');\n${injection}`);

fs.writeFileSync(file, code);
