import fs from 'node:fs';
import {
  scaledTemplateFontSize,
  templateTypographyScale,
} from '../src/services/templateTypography';

function expect(condition: boolean, message: string) {
  if (!condition) throw new Error(`Phase 3 acceptance self-test failed: ${message}`);
}

const templateFiles = [
  'ScoutingReportView.tsx',
  'PlayerComparisonView.tsx',
  'TransferGraphicView.tsx',
  'MatchPreviewView.tsx',
  'MatchAnalysisView.tsx',
  'TacticalAnalysisView.tsx',
  'StatHighlightView.tsx',
  'RankingTopListView.tsx',
  'QuoteOpinionView.tsx',
  'ThreadCoverView.tsx',
  'MatchResultView.tsx',
  'TeamProfileView.tsx',
];

for (const file of templateFiles) {
  const source = fs.readFileSync(`src/components/templates/${file}`, 'utf8');
  expect(source.includes('scaledTemplateFontSize'), `${file} must use template-aware typography scaling`);
}

expect(templateTypographyScale({ typography: { headline: 0.1 } }, 'headline') === 0.75, 'headline scale must clamp at 75%');
expect(templateTypographyScale({ typography: { headline: 5 } }, 'headline') === 1.25, 'headline scale must clamp at 125%');
expect(scaledTemplateFontSize(40, { typography: { verdict: 1.25 } }, 'verdict') === '50.0px', 'verdict scaling must be independent');
expect(scaledTemplateFontSize(40, { typography: { stat: 0.75 } }, 'stat') === '30.0px', 'stat scaling must be independent');

const sidebar = fs.readFileSync('src/components/EditorSidebar.tsx', 'utf8');
expect(sidebar.includes("'9:16'"), '9:16 vertical format must be registered');
expect(sidebar.includes('min="0.75"') && sidebar.includes('max="1.25"'), 'safe typography slider range must be exposed');
expect(sidebar.includes("role: 'headline'") && sidebar.includes("role: 'subtitle'") && sidebar.includes("role: 'body'") && sidebar.includes("role: 'verdict'") && sidebar.includes("role: 'stat'"), 'all required typography roles must have separate controls');

const transfer = fs.readFileSync('src/components/templates/TransferGraphicView.tsx', 'utf8');
const preview = fs.readFileSync('src/components/templates/MatchPreviewView.tsx', 'utf8');
const analysis = fs.readFileSync('src/components/templates/MatchAnalysisView.tsx', 'utf8');
const result = fs.readFileSync('src/components/templates/MatchResultView.tsx', 'utf8');
const semantic = fs.readFileSync('src/components/design/SemanticLogosLayer.tsx', 'utf8');

expect(transfer.includes('data-semantic-logo-slot={side}') && transfer.includes("'from-club'") && transfer.includes("'to-club'"), 'transfer logos must remain mapped to from/to clubs');
expect(preview.includes("'home-team'") && preview.includes("'away-team'"), 'match preview must keep home/away logo mapping');
expect(analysis.includes('data-semantic-logo-slot="home-team"') && analysis.includes('data-semantic-logo-slot="away-team"'), 'match analysis must keep home/away logo mapping');
expect(result.includes('data-semantic-logo-slot="home-team"') && result.includes('data-semantic-logo-slot="away-team"'), 'match result must keep logos attached to score identities');
expect(semantic.includes('slot="primary-team"') && semantic.includes('slot="opponent-team"'), 'tactical analysis must support one/two-team semantic logos');
expect(semantic.includes('slot="club"') && semantic.includes('slot="competition"'), 'team profile must separate club and competition logos');
expect(semantic.includes('slot="player-1-club"') && semantic.includes('slot="player-2-club"'), 'player comparison must keep both club identities distinct');

console.log('Phase 3 acceptance self-test passed: all 12 templates use role-aware typography, 9:16 is available, and semantic logo mappings remain explicit.');
