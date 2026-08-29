const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// The main issue is some onChange statements were left behind.
// Let's replace any `onChange({\s*\.\.\.project,` with appropriate update functions.

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*strengths:\s*\[\.\.\.strengths,\s*'New Player Strength'\]\s*\}\s*\}\)/g, 
  "updateContent({ strengths: [...strengths, 'New Player Strength'] })");
  
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*development:\s*\[\.\.\.development,\s*'New Development Area'\]\s*\}\s*\}\)/g, 
  "updateContent({ development: [...development, 'New Development Area'] })");

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*stats:\s*\[\s*\.\.\.stats,\s*\{\s*id:\s*`stat-\$\{Date\.now\(\)\}`,\s*value:\s*'0',\s*label:\s*'New Stat',\s*icon:\s*'target',\s*\}\s*\]\s*\}\s*\}\)/g, 
  "updateContent({ stats: [...stats, { id: `stat-${Date.now()}`, value: '0', label: 'New Stat', icon: 'target' }] })");

// comparisonData adding metric
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*comparisonData:\s*\{\s*\.\.\.comparisonData!,\s*metrics:\s*\[\s*\.\.\.comparisonData!\.metrics,\s*\{\s*id:\s*`m\$\{Date\.now\(\)\}`,\s*label:\s*'New Metric',\s*val1:\s*'0',\s*val2:\s*'0',\s*\}\s*\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ comparisonData: { ...comparisonData!, metrics: [...comparisonData!.metrics, { id: `m${Date.now()}`, label: 'New Metric', val1: '0', val2: '0' }] } })");

// matchAnalysisData adding key takeaways
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*matchAnalysisData:\s*\{\s*\.\.\.matchAnalysisData!,\s*keyTakeaways:\s*\[\.\.\.matchAnalysisData!\.keyTakeaways,\s*'New key takeaway\.\.\.'\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ matchAnalysisData: { ...matchAnalysisData!, keyTakeaways: [...matchAnalysisData!.keyTakeaways, 'New key takeaway...'] } })");

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*tacticalData:\s*\{\s*\.\.\.tacticalData!,\s*keyInstructions:\s*\[\.\.\.tacticalData!\.keyInstructions,\s*'New instruction\.\.\.'\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ tacticalData: { ...tacticalData!, keyInstructions: [...tacticalData!.keyInstructions, 'New instruction...'] } })");

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*teamProfileData:\s*\{\s*\.\.\.teamProfileData!,\s*strengths:\s*\[\.\.\.teamProfileData!\.strengths,\s*'New Team Strength'\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ teamProfileData: { ...teamProfileData!, strengths: [...teamProfileData!.strengths, 'New Team Strength'] } })");
code = code.replace(/onChange\(\{\s*\.\.\.project,\s*teamProfileData:\s*\{\s*\.\.\.teamProfileData!,\s*weaknesses:\s*\[\.\.\.teamProfileData!\.weaknesses,\s*'New Team Weakness'\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ teamProfileData: { ...teamProfileData!, weaknesses: [...teamProfileData!.weaknesses, 'New Team Weakness'] } })");

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*transferData:\s*\{\s*\.\.\.transferData!,\s*keyConditions:\s*\[\.\.\.transferData!\.keyConditions,\s*'New condition\.\.\.'\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ transferData: { ...transferData!, keyConditions: [...transferData!.keyConditions, 'New condition...'] } })");

code = code.replace(/onChange\(\{\s*\.\.\.project,\s*threadCoverData:\s*\{\s*\.\.\.threadCoverData!,\s*topicBullets:\s*\[\.\.\.threadCoverData!\.topicBullets,\s*'New bullet point\.\.\.'\]\s*\}\s*\}\s*\}\)/g, 
  "updateContent({ threadCoverData: { ...threadCoverData!, topicBullets: [...threadCoverData!.topicBullets, 'New bullet point...'] } })");

// fix layout toggle
code = code.replace(/updateLayout\(\{\s*\.\.\.advancedLayout,\s*locked:\s*!advancedLayout\?\.locked,\s*\}\s*\}\s*\)\s*\}/g,
  "updateLayout({ ...advancedLayout, locked: !advancedLayout?.locked }) }");

// And replace any remaining `onChange({ ...project, ` with `updateContent` if it is an array push or something?
// The above are the specific "Add item" buttons.

fs.writeFileSync(file, code);
