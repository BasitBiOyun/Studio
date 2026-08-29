const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace:
// updateContent({ comparisonData: {
//    ...comparisonData!,
//    player2: { ...comparisonData!.player2, club: e.target.value },
//  })

code = code.replace(/updateContent\(\{\s*(comparisonData|transferData|matchPreviewData|matchAnalysisData|tacticalData|statHighlightData|rankingData|quoteData|threadCoverData|matchResultData|teamProfileData):\s*\{([^}]+)\}\s*\)/g, 'updateContent({ $1: {$2} })');
// Wait, player2: { ... } has its own closing brace.
// The regex `[^}]+` will stop at the first `}` which is the end of `player2: { ... }`.
// That's why the previous regex failed!

// Let's replace the specific error patterns:
// `})` preceded by a line with `},` that has matching indentation.
// Or just:
code = code.replace(/,\s*\}\)/g, ' } })');

fs.writeFileSync(file, code);
