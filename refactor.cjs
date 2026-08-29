const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'src', 'types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

// Replace the unified project root interface
const unifiedRootRegex = /\/\/ Unified Project Root Interface[\s\S]*?(?=export type ExportResolution)/;
const newProjectTypes = `// Unified Project Root Interface
// ------------------------------------

export interface TemplateVisuals {
  playerImageSrc: string;
  imageTransform: ImageTransform;
  secondaryPlayerImageSrc?: string;
  secondaryImageTransform?: ImageTransform;
  logos: LogoConfig[];
}

export interface TemplateContent {
  profile: PlayerProfile;
  stats: StatItem[];
  strengths: string[];
  development: string[];

  comparisonData?: PlayerComparisonData;
  transferData?: TransferGraphicData;
  matchPreviewData?: MatchPreviewData;
  matchAnalysisData?: MatchAnalysisData;
  tacticalData?: TacticalAnalysisData;
  statHighlightData?: StatHighlightData;
  rankingData?: RankingTopListData;
  quoteData?: QuoteOpinionData;
  threadCoverData?: ThreadCoverData;
  matchResultData?: MatchResultData;
  teamProfileData?: TeamProfileData;
}

export interface TemplateState {
  visuals: TemplateVisuals;
  content: TemplateContent;
  layout: AdvancedLayoutConfig;
  theme: ThemeColors;
}

export interface SharedData {
  player: PlayerInfo;
  credits: Credits;
}

export interface Project {
  id: string;
  name: string;
  templateType: TemplateType;
  aspectRatio: CanvasAspectRatio;
  visualMode?: VisualMode;
  createdAt: number;
  updatedAt: number;

  sharedData: SharedData;
  templates: Record<TemplateType, TemplateState>;
}

`;

typesContent = typesContent.replace(unifiedRootRegex, newProjectTypes);
fs.writeFileSync(typesPath, typesContent);
console.log('Updated types.ts');
