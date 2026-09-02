export type TemplateType =
  | 'scouting-report'
  | 'player-comparison'
  | 'transfer-graphic'
  | 'match-preview'
  | 'match-analysis'
  | 'tactical-analysis'
  | 'stat-highlight'
  | 'ranking-top-list'
  | 'quote-opinion'
  | 'thread-cover'
  | 'match-result'
  | 'team-profile';

export type CanvasAspectRatio = '1:1' | '4:5' | '16:9' | 'x-landscape';

export type VisualMode = 'editorial' | 'data' | 'poster';

export interface CanvasDimensions {
  width: number;
  height: number;
  label: string;
  ratio: CanvasAspectRatio;
  desc: string;
}

export type StatIconType =
  | 'target'
  | 'route'
  | 'run'
  | 'football'
  | 'award'
  | 'adjustments'
  | 'tactics'
  | 'bolt'
  | 'sparkles'
  | 'shield'
  | 'trophy'
  | 'star'
  | 'chart'
  | 'flame'
  | 'heartbeat'
  | 'percentage'
  | 'clock'
  | 'whistle';

export interface StatProvenance {
  source?: string;
  sourceUrl?: string;
  competition?: string;
  season?: string;
  sampleSize?: string;
  retrievedAt?: string;
  status: 'verified' | 'manual' | 'calculated' | 'missing';
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: StatIconType;
  subValue?: string;
  percentileRank?: string;
  provenance?: StatProvenance;
}

export interface PlayerInfo {
  name: string;
  age: string;
  nationality: string;
  countryFlag?: string;
  preferredFoot: string;
  height: string;
  positions: string;
  club: string;
}

export interface PlayerProfile {
  summary: string;
  tacticalProfile: string;
}

export interface ImageTransform {
  x: number; // percentage offset
  y: number;
  scale: number; // 0.5 to 3.0 (1.0 default)
  brightness: number; // 50 to 150 (100 default)
  contrast: number; // 50 to 150 (100 default)
  saturation: number; // 0 to 200 (100 default)
  opacity: number; // 0 to 100
  flipHorizontal: boolean;
  grayscale: boolean;
  shadow: boolean;
  edgeGlow: boolean;
  bottomFade: boolean;
}

export interface LogoConfig {
  id: string;
  name: string;
  src: string;
  visible: boolean;
  x: number;
  y: number;
  size: number; // in px
  opacity: number; // 0 to 100
  presetPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'header-center';
}

export type BgPatternType =
  | 'subtle-grid'
  | 'tactical-lines'
  | 'radial-glow'
  | 'stadium-spotlight'
  | 'clean-minimal'
  | 'pitch-half'
  | 'diagonal-speed-lines'
  | 'layered-geometric'
  | 'pitch-grid'
  | 'tactical-board'
  | 'halftone'
  | 'broadcast-data'
  | 'editorial-magazine'
  | 'matchday-poster'
  | 'dark-spotlight'
  | 'angular-shards'
  | 'motion-streaks'
  | 'subtle-wave'
  | 'blueprint'
  | 'minimal-data'
  | 'dramatic-poster'
  | 'split-tone'
  | 'radial-spotlight'
  | 'abstract-field-lines'
  | 'none';

export interface ThemeColors {
  name: string;
  primaryAccent: string;
  secondaryAccent: string;
  bg1: string;
  bg2: string;
  mainText: string;
  mutedText: string;
  textAccent: string;
  pattern: BgPatternType;
  gradientAngle: number;
}

export interface Credits {
  preparedFor: string;
  visualBy: string;
}

export interface AdvancedLayoutConfig {
  locked: boolean; // safe mode vs unlocked
  spacingScale: 'compact' | 'normal' | 'generous';
  borderRadius: 'sharp' | 'subtle' | 'rounded';
  fontDisplay: string;
  fontBody: string;
  visibleBlocks: Record<string, boolean>;
  headerAlignment: 'left' | 'center' | 'split';
  customTitleScale?: number;
  grainEnabled?: boolean;
  grainOpacity?: number;
}

// ------------------------------------
// Specific Template Content Interfaces
// ------------------------------------

export interface ComparisonMetric {
  id: string;
  label: string;
  val1: string;
  val2: string;
  unit?: string;
  higherIsBetter?: boolean;
  percentile1?: string | number;
  percentile2?: string | number;
}

export interface PlayerComparisonData {
  player1: PlayerInfo;
  player2: PlayerInfo;
  subtitle: string;
  metrics: ComparisonMetric[];
  verdictTitle: string;
  verdictText: string;
}

export interface TransferGraphicData {
  player: PlayerInfo;
  headline: string; // e.g. "HERE WE GO!" / "DONE DEAL" / "AGREEMENT REACHED"
  badgeText: string; // e.g. "OFFICIAL ANNOUNCEMENT" / "TRANSFER SCOOP"
  transferFee: string; // e.g. "€45M + €10M ADD-ONS"
  contractLength: string; // e.g. "5-YEAR CONTRACT UNTIL 2031"
  fromClub: string;
  toClub: string;
  detailsSummary: string;
  keyConditions: string[];
}

export interface MatchPreviewData {
  competition: string; // e.g. "UEFA CHAMPIONS LEAGUE • ROUND OF 16"
  matchDate: string; // e.g. "TUESDAY, 18 FEBRUARY 2026"
  kickoffTime: string; // e.g. "21:00 CET • SANTIAGO BERNABÉU"
  team1: {
    name: string;
    form: string[]; // ['W', 'W', 'D', 'W', 'L']
    manager: string;
    standing: string;
  };
  team2: {
    name: string;
    form: string[];
    manager: string;
    standing: string;
  };
  keyBattleTitle: string;
  keyBattleDetails: string;
  tacticalKeys: string[];
}

export interface MatchAnalysisData {
  competition: string;
  scoreline: {
    team1: string;
    score1: number;
    team2: string;
    score2: number;
  };
  scorersTeam1: string[];
  scorersTeam2: string[];
  stats: {
    label: string;
    val1: string;
    val2: string;
    val1Num?: number;
    val2Num?: number;
  }[];
  tacticalSummary: string;
  keyTakeaways: string[];
  performerTitle: string;
  performerName: string;
  performerNote: string;
}

export interface TacticalAnalysisData {
  topic: string; // e.g. "HIGH PRESSING TRIGGER MECHANISM"
  teamOrCoach: string; // e.g. "ARSENAL FC • MIKEL ARTETA"
  formation: string; // e.g. "4-3-3 IN POSSESSION / 4-4-2 MID-BLOCK"
  phase: 'In Possession' | 'Out of Possession' | 'Defensive Transition' | 'Attacking Transition';
  corePrinciples: {
    title: string;
    description: string;
  }[];
  tacticalNote: string;
  keyInstructions: string[];
}

export interface StatHighlightData {
  heroStat: string; // e.g. "94.2%"
  heroStatLabel: string; // e.g. "Pass Completion Rate in Final Third"
  rankBadge: string; // e.g. "#1 IN PREMIER LEAGUE"
  categoryTag: string; // e.g. "CREATIVE EFFICIENCY"
  sampleSize: string; // e.g. "MIN. 900 MINUTES PLAYED • 2025/26 SEASON"
  contextMetrics: StatItem[];
  editorialVerdict: string;
}

export interface RankingTopItem {
  id: string;
  rank: number;
  playerName: string;
  club: string;
  val: string;
  subVal?: string;
  highlighted?: boolean;
}

export interface RankingTopListData {
  categoryTitle: string; // e.g. "TOP 5 CHANCE CREATORS"
  subtitle: string; // e.g. "U21 PLAYERS IN EUROPE'S TOP 5 LEAGUES"
  metricHeader: string; // e.g. "Key Passes /90"
  seasonFilter: string; // e.g. "2025/26 SEASON (MIN 800 MINS)"
  items: RankingTopItem[];
  footerNote: string;
}

export interface QuoteOpinionData {
  quote: string;
  authorName: string;
  authorRole: string; // e.g. "Head Coach, Bayer Leverkusen"
  topicTag: string; // e.g. "MATCHDAY REACTION"
  sourceDate: string; // e.g. "Post-Match Press Conference • Feb 2026"
  keyPunchline: string; // highlighted callout
}

export interface ThreadCoverData {
  headline: string; // e.g. "THE TACTICAL EVOLUTION OF XABI ALONSO"
  subtitle: string; // e.g. "How Leverkusen Built Europe's Most Dynamic Rest-Defense System"
  badge: string; // e.g. "TACTICAL DEEP DIVE • 12-PART THREAD"
  authorHandle: string; // e.g. "Analysis by @BasitBiOyun"
  topicBullets: string[];
}

export interface MatchResultData {
  competition: string;
  stage: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  scorers1: string[];
  scorers2: string[];
  matchStats: {
    label: string;
    val1: string;
    val2: string;
  }[];
  mvpPlayer: string;
  mvpStat: string;
  matchSummary: string;
}

export interface TeamProfileData {
  teamName: string;
  manager: string;
  league: string;
  leagueRank: string;
  tacticalStyleTag: string; // e.g. "High-Intensity Positional Play"
  metrics: StatItem[];
  strengths: string[];
  weaknesses: string[];
  tacticalSummary: string;
}

// ------------------------------------
// Unified Project Root Interface
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

export type ExportResolution = 2400 | 4800 | 9600;
export type ExportFormat = 'png' | 'transparent-png' | 'jpg';

export interface BrandSettings {
  brandName: string;
  xHandle: string;
  primaryFont: string;
  secondaryFont: string;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
  defaultBg1: string;
  defaultBg2: string;
  defaultMainText: string;
  defaultMutedText: string;
  defaultFooterLeft: string;
  defaultFooterRight: string;
  brandLogoSrc: string;
}

export interface DesignReferenceItem {
  id: string;
  title: string;
  category: 'typography' | 'spacing' | 'data-presentation' | 'image-placement' | 'color-balance' | 'general';
  imageSrc: string;
  notes: string;
  isDoNotUse: boolean;
  createdAt: number;
}

export interface QualityIssue {
  id: string;
  type: 'error' | 'warning' | 'tip';
  title: string;
  description: string;
  field?: string;
}

// ------------------------------------
// Player Pack JSON Schema
// ------------------------------------
export interface PlayerPackV1 {
  schemaVersion: 'player-pack-v1';
  player: {
    name: string;
    nationality?: string;
    countryCode?: string;
    age?: string | number;
    height?: string;
    preferredFoot?: string;
    positions?: string;
    club?: string;
  };
  context?: {
    season?: string;
    league?: string;
  };
  stats?: {
    label: string;
    value: string | number;
    percentile?: number;
    provenance?: Partial<StatProvenance>;
  }[];
  scoutingSummary?: string;
  tacticalProfile?: string;
  strengths?: string[];
  developmentAreas?: string[];
  metadata?: {
    source?: string;
    date?: string;
    author?: string;
  };
  unknownFields?: Record<string, any>;
}
