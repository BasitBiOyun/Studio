import {
  Project,
  ThemeColors,
  BrandSettings,
  CanvasDimensions,
  CanvasAspectRatio,
  TemplateType,
  DesignReferenceItem,
} from '../types';

export const CANVAS_DIMENSIONS: Record<CanvasAspectRatio, CanvasDimensions> = {
  '1:1': {
    ratio: '1:1',
    width: 1200,
    height: 1200,
    label: '1:1 Square',
    desc: '1200 × 1200 (Export up to 4800×4800) • Instagram & X Square Feed',
  },
  '4:5': {
    ratio: '4:5',
    width: 1200,
    height: 1500,
    label: '4:5 Portrait',
    desc: '1200 × 1500 (Export up to 4800×6000) • High-Impact Mobile Feed',
  },
  '16:9': {
    ratio: '16:9',
    width: 1600,
    height: 900,
    label: '16:9 Widescreen',
    desc: '1600 × 900 (Export up to 6400×3600) • Landscape & Video/Banner',
  },
  'x-landscape': {
    ratio: 'x-landscape',
    width: 1200,
    height: 675,
    label: 'X Landscape',
    desc: '1200 × 675 (Export up to 4800×2700) • Optimal Single-Image X/Twitter Post',
  },
};

export const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  brandName: 'BasitBiOyun',
  xHandle: '@BasitBiOyun',
  primaryFont: "'Barlow Condensed', sans-serif",
  secondaryFont: "'Plus Jakarta Sans', sans-serif",
  defaultPrimaryColor: '#00d2ff',
  defaultSecondaryColor: '#1e40af',
  defaultBg1: '#070e20',
  defaultBg2: '#02040a',
  defaultMainText: '#ffffff',
  defaultMutedText: '#94a3b8',
  defaultFooterLeft: 'Prepared for @EmirScouts',
  defaultFooterRight: 'Visual by BasitBiOyun',
  brandLogoSrc: '/gent-logo.svg',
};

export const THEME_PRESETS: ThemeColors[] = [
  { name: 'KAA Gent', primaryAccent: '#00d2ff', secondaryAccent: '#1e40af', bg1: '#070e20', bg2: '#02040a', mainText: '#ffffff', mutedText: '#94a3b8', textAccent: '#ffffff', pattern: 'tactical-lines', gradientAngle: 135 },
  { name: 'Fenerbahçe', primaryAccent: '#fde000', secondaryAccent: '#001a5b', bg1: '#010515', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'stadium-spotlight', gradientAngle: 135 },
  { name: 'Galatasaray', primaryAccent: '#fdb912', secondaryAccent: '#a32638', bg1: '#110508', bg2: '#020101', mainText: '#ffffff', mutedText: '#d4d4d8', textAccent: '#ffffff', pattern: 'subtle-grid', gradientAngle: 135 },
  { name: 'Beşiktaş', primaryAccent: '#ffffff', secondaryAccent: '#333333', bg1: '#0f0f0f', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#000000', pattern: 'radial-glow', gradientAngle: 135 },
  { name: 'Real Madrid', primaryAccent: '#fefefe', secondaryAccent: '#00529f', bg1: '#0a0f18', bg2: '#000205', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#000000', pattern: 'clean-minimal', gradientAngle: 135 },
  { name: 'Barcelona', primaryAccent: '#edb112', secondaryAccent: '#a50044', bg1: '#0b0205', bg2: '#000105', mainText: '#ffffff', mutedText: '#d4d4d8', textAccent: '#ffffff', pattern: 'tactical-lines', gradientAngle: 135 },
  { name: 'Liverpool', primaryAccent: '#c8102e', secondaryAccent: '#f6eb61', bg1: '#0f0203', bg2: '#020000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'stadium-spotlight', gradientAngle: 135 },
  { name: 'Manchester Utd', primaryAccent: '#da291c', secondaryAccent: '#fbe122', bg1: '#140302', bg2: '#030000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'subtle-grid', gradientAngle: 135 },
  { name: 'Manchester City', primaryAccent: '#6caddf', secondaryAccent: '#00285e', bg1: '#020a14', bg2: '#000103', mainText: '#ffffff', mutedText: '#9ca3af', textAccent: '#ffffff', pattern: 'clean-minimal', gradientAngle: 135 },
  { name: 'Arsenal', primaryAccent: '#ef0107', secondaryAccent: '#9c824a', bg1: '#110202', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'tactical-lines', gradientAngle: 135 },
  { name: 'Chelsea', primaryAccent: '#034694', secondaryAccent: '#dba111', bg1: '#030714', bg2: '#000103', mainText: '#ffffff', mutedText: '#9ca3af', textAccent: '#ffffff', pattern: 'radial-glow', gradientAngle: 135 },
  { name: 'Bayern Munich', primaryAccent: '#dc052d', secondaryAccent: '#0066b2', bg1: '#100104', bg2: '#020001', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'stadium-spotlight', gradientAngle: 135 },
  { name: 'Borussia Dortmund', primaryAccent: '#fde100', secondaryAccent: '#000000', bg1: '#0a0a00', bg2: '#000000', mainText: '#ffffff', mutedText: '#d4d4d8', textAccent: '#000000', pattern: 'pitch-half', gradientAngle: 135 },
  { name: 'Juventus', primaryAccent: '#ffffff', secondaryAccent: '#231f20', bg1: '#0a0a0a', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#000000', pattern: 'subtle-grid', gradientAngle: 135 },
  { name: 'Inter Milan', primaryAccent: '#0058ab', secondaryAccent: '#000000', bg1: '#01050f', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'clean-minimal', gradientAngle: 135 },
  { name: 'AC Milan', primaryAccent: '#fb090b', secondaryAccent: '#000000', bg1: '#0f0001', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'stadium-spotlight', gradientAngle: 135 },
  { name: 'PSG', primaryAccent: '#004170', secondaryAccent: '#da291c', bg1: '#01060f', bg2: '#000103', mainText: '#ffffff', mutedText: '#9ca3af', textAccent: '#ffffff', pattern: 'subtle-grid', gradientAngle: 135 },
  { name: 'Atlético Madrid', primaryAccent: '#cb3524', secondaryAccent: '#272e61', bg1: '#0a0203', bg2: '#020000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'tactical-lines', gradientAngle: 135 },
  { name: 'Napoli', primaryAccent: '#12a0d7', secondaryAccent: '#003c82', bg1: '#020a12', bg2: '#000205', mainText: '#ffffff', mutedText: '#9ca3af', textAccent: '#ffffff', pattern: 'clean-minimal', gradientAngle: 135 },
  { name: 'Roma', primaryAccent: '#8e1f2f', secondaryAccent: '#f0b51c', bg1: '#0f0204', bg2: '#030001', mainText: '#ffffff', mutedText: '#d4d4d8', textAccent: '#ffffff', pattern: 'radial-glow', gradientAngle: 135 },
  { name: 'Benfica', primaryAccent: '#e30613', secondaryAccent: '#ffffff', bg1: '#110202', bg2: '#020000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'stadium-spotlight', gradientAngle: 135 },
  { name: 'Porto', primaryAccent: '#00428c', secondaryAccent: '#ffffff', bg1: '#02050c', bg2: '#000103', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'subtle-grid', gradientAngle: 135 },
  { name: 'Ajax', primaryAccent: '#d2122e', secondaryAccent: '#ffffff', bg1: '#0c0203', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'tactical-lines', gradientAngle: 135 },
  { name: 'Black / Gold', primaryAccent: '#d4af37', secondaryAccent: '#8c7323', bg1: '#080808', bg2: '#000000', mainText: '#ffffff', mutedText: '#a1a1aa', textAccent: '#ffffff', pattern: 'stadium-spotlight', gradientAngle: 135 },
  { name: 'Neutral Dark', primaryAccent: '#f8fafc', secondaryAccent: '#475569', bg1: '#0c0f17', bg2: '#020408', mainText: '#ffffff', mutedText: '#94a3b8', textAccent: '#000000', pattern: 'subtle-grid', gradientAngle: 140 }
];

export const TEMPLATE_METADATA: {
  type: TemplateType;
  label: string;
  category: 'Scouting & Player' | 'Matchday & Team' | 'Editorial & News';
  description: string;
  badge: string;
}[] = [
  {
    type: 'scouting-report',
    label: 'Player Scouting Report',
    category: 'Scouting & Player',
    description: 'Comprehensive single player report with 4 core metrics, strengths, and tactical summary.',
    badge: 'Flagship',
  },
  {
    type: 'player-comparison',
    label: 'Player Comparison',
    category: 'Scouting & Player',
    description: 'Direct head-to-head metrics comparison between two players with winner indicators.',
    badge: 'Dual Photo',
  },
  {
    type: 'transfer-graphic',
    label: 'Transfer Graphic',
    category: 'Editorial & News',
    description: 'Official announcement & Done Deal visual with clubs, transfer fee, and key details.',
    badge: 'Breaking',
  },
  {
    type: 'match-preview',
    label: 'Match Preview',
    category: 'Matchday & Team',
    description: 'Matchday clash visual with kickoff time, stadium, form guide, and tactical keys.',
    badge: 'Matchday',
  },
  {
    type: 'match-analysis',
    label: 'Match Analysis',
    category: 'Matchday & Team',
    description: 'Post-match tactical breakdown with scoreline, xG flow, match stats, and key takeaways.',
    badge: 'Analytics',
  },
  {
    type: 'tactical-analysis',
    label: 'Tactical Analysis',
    category: 'Matchday & Team',
    description: 'Deep dive tactical breakdown of phases of play, tactical principles, and shape.',
    badge: 'Tactics',
  },
  {
    type: 'stat-highlight',
    label: 'Stat Highlight',
    category: 'Editorial & News',
    description: 'Hero metric showcase focusing on one world-class statistic with context breakdown.',
    badge: 'Hero Data',
  },
  {
    type: 'ranking-top-list',
    label: 'Ranking / Top List',
    category: 'Editorial & News',
    description: 'Top 5 / Top 10 leaderboards for player metrics with highlighted rank positions.',
    badge: 'Leaderboard',
  },
  {
    type: 'quote-opinion',
    label: 'Quote / Opinion Graphic',
    category: 'Editorial & News',
    description: 'Editorial statement or post-match coach/player quotes with author spotlight.',
    badge: 'Editorial',
  },
  {
    type: 'thread-cover',
    label: 'Thread Cover',
    category: 'Editorial & News',
    description: 'High-impact editorial cover image designed specifically for multi-post X threads.',
    badge: 'Thread',
  },
  {
    type: 'match-result',
    label: 'Match Result',
    category: 'Matchday & Team',
    description: 'Full-time score graphic with goal scorers, minutes, key stats, and MVP spotlight.',
    badge: 'Full Time',
  },
  {
    type: 'team-profile',
    label: 'Team Profile',
    category: 'Matchday & Team',
    description: 'Club identity card with playing style tag, 4 team metrics, strengths, and manager note.',
    badge: 'Team',
  },
];

export const INITIAL_DESIGN_REFERENCES: DesignReferenceItem[] = [
  {
    id: 'ref-1',
    title: 'Opta / The Athletic Editorial Grid Balance',
    category: 'data-presentation',
    imageSrc: '',
    notes: 'Keep stats prominent with large condensed typography and distinct 2-line labels. Use 60-70% contrast on metric labels.',
    isDoNotUse: false,
    createdAt: Date.now() - 100000,
  },
  {
    id: 'ref-2',
    title: 'Matchday Broadcast Title Hierarchy',
    category: 'typography',
    imageSrc: '',
    notes: 'Player names in ultra-bold condensed uppercase with tight tracking. Secondary labels in clean geometric sans-serif.',
    isDoNotUse: false,
    createdAt: Date.now() - 90000,
  },
  {
    id: 'ref-3',
    title: 'Cutout Torso Multi-Stop Bottom Fade',
    category: 'image-placement',
    imageSrc: '',
    notes: 'Always blend waist/torso cuts into the dark background using a 4-stop linear gradient from transparent to background color.',
    isDoNotUse: false,
    createdAt: Date.now() - 80000,
  },
  {
    id: 'ref-dnu-1',
    title: 'AI Cliché: Rainbow Gradients & Glowing Blobs',
    category: 'color-balance',
    imageSrc: '',
    notes: 'STRICTLY AVOID: Arbitrary neon purple-to-cyan glowing dropshadows, rainbow borders, and meaningless decorative 3D balls.',
    isDoNotUse: true,
    createdAt: Date.now() - 70000,
  },
  {
    id: 'ref-dnu-2',
    title: 'Generic SaaS Dashboard & Tiny Overcrowded Tables',
    category: 'spacing',
    imageSrc: '',
    notes: 'STRICTLY AVOID: Cramming 20 stats in tiny 10px fonts. Football editorial graphics must communicate core takeaways in 1 second.',
    isDoNotUse: true,
    createdAt: Date.now() - 60000,
  },
];

const baseLayout = {
  locked: true,
  spacingScale: 'normal' as const,
  borderRadius: 'subtle' as const,
  fontDisplay: "'Barlow Condensed', sans-serif",
  fontBody: "'Plus Jakarta Sans', sans-serif",
  visibleBlocks: {
    header: true,
    playerPhoto: true,
    stats: true,
    summary: true,
    strengths: true,
    development: true,
    tacticalProfile: true,
    logos: true,
    footer: true,
  },
  headerAlignment: 'left' as const,
  grainEnabled: true,
  grainOpacity: 15,
};

const baseVisuals = {
  playerImageSrc: '/initial-player.png',
  imageTransform: { x: 20, y: 2, scale: 1.05, brightness: 100, contrast: 105, saturation: 102, opacity: 100, flipHorizontal: false, grayscale: false, shadow: true, edgeGlow: false, bottomFade: true },
  secondaryPlayerImageSrc: '',
  secondaryImageTransform: { x: -24, y: 4, scale: 1.0, brightness: 100, contrast: 105, saturation: 102, opacity: 100, flipHorizontal: true, grayscale: false, shadow: true, edgeGlow: false, bottomFade: true },
  logos: [
    { id: 'logo-1', name: 'Club Badge 1', src: '/gent-logo.svg', visible: true, x: 0, y: 0, size: 90, opacity: 100 },
    { id: 'logo-2', name: 'Club / League Badge 2', src: '', visible: false, x: 0, y: 0, size: 80, opacity: 90 },
    { id: 'logo-3', name: 'BasitBiOyun Brand Badge', src: '', visible: false, x: 0, y: 0, size: 70, opacity: 100 },
  ],
};

const baseContent = {
  profile: {
    summary: 'Explosive transition winger who attacks space, carries the ball forward and creates chances from wide areas.',
    tacticalProfile: 'Most dangerous when attacking open space from wide areas. Can play on either flank, drive inside with speed and turn carries into chances. Better in transition than in slower, crowded attacking phases.',
  },
  stats: [
    { id: 'stat-1', value: '0.39', label: 'xA /90', icon: 'target' as const, subValue: '96th %tile' },
    { id: 'stat-2', value: '2.21', label: 'Key Passes /90', icon: 'route' as const, subValue: '92nd %tile' },
    { id: 'stat-3', value: '3.32', label: 'Progressive Carries /90', icon: 'run' as const, subValue: '98th %tile' },
    { id: 'stat-4', value: '1.99', label: 'Shots /90', icon: 'football' as const, subValue: '85th %tile' },
  ],
  strengths: ['Acceleration & open-field threat', '1v1 attacking ability', 'Progressive carrying', 'Chance creation'],
  development: ['Final decision-making', 'Dribble efficiency', 'End product consistency'],
  
  comparisonData: {
    player1: { name: 'MOMODOU SONKO', age: '19', nationality: 'Sweden 🇸🇪', preferredFoot: 'Right', height: '185 cm', positions: 'Winger', club: 'KAA GENT' },
    player2: { name: 'ERNEST NUAMAH', age: '20', nationality: 'Ghana 🇬🇭', preferredFoot: 'Left', height: '178 cm', positions: 'Winger', club: 'OLYMPIQUE LYON' },
    subtitle: 'U21 WINGERS • METRIC PER 90 BREAKDOWN',
    metrics: [
      { id: 'm1', label: 'Expected Assists (xA)', val1: '0.39', val2: '0.24', higherIsBetter: true },
      { id: 'm2', label: 'Key Passes /90', val1: '2.21', val2: '1.85', higherIsBetter: true },
      { id: 'm3', label: 'Progressive Carries /90', val1: '3.32', val2: '3.91', higherIsBetter: true },
      { id: 'm4', label: 'Successful Take-Ons %', val1: '54.2%', val2: '48.9%', higherIsBetter: true },
      { id: 'm5', label: 'Touches in Opp. Box /90', val1: '4.88', val2: '5.12', higherIsBetter: true },
    ],
    verdictTitle: 'ANALYTICAL VERDICT',
    verdictText: 'Sonko generates significantly more passing volume and creative expected threat, while Nuamah excels in isolated 1v1 touch volume and penalty box entries.',
  },

  transferData: {
    player: { name: 'VIKTOR GYÖKERES', age: '26', nationality: 'Sweden 🇸🇪', preferredFoot: 'Right', height: '187 cm', positions: 'Center Forward', club: 'ARSENAL FC' },
    headline: 'HERE WE GO!',
    badgeText: 'TRANSFER AGREEMENT',
    transferFee: '€75,000,000 + ADD-ONS',
    contractLength: '5-YEAR CONTRACT (UNTIL 2031)',
    fromClub: 'SPORTING CP',
    toClub: 'ARSENAL FC',
    detailsSummary: 'Total agreement reached between clubs. Player completed medical tests and signed long-term contract.',
    keyConditions: ['€75M fixed fee payable in 3 installments', '€10M performance & Champions League add-ons', '10% future sell-on clause included'],
  },

  matchPreviewData: {
    competition: 'UEFA CHAMPIONS LEAGUE • QUARTER FINAL',
    matchDate: 'WEDNESDAY, 11 MARCH 2026',
    kickoffTime: '21:00 CET • SANTIAGO BERNABÉU',
    team1: { name: 'REAL MADRID', form: ['W', 'W', 'W', 'D', 'W'], manager: 'Carlo Ancelotti', standing: '1st in La Liga' },
    team2: { name: 'MANCHESTER CITY', form: ['W', 'W', 'D', 'W', 'W'], manager: 'Pep Guardiola', standing: '1st in Premier League' },
    keyBattleTitle: 'KEY TACTICAL BATTLE',
    keyBattleDetails: 'Vinicius Jr vs Kyle Walker / Rest-Defense Transition vs High Positional Circulation',
    tacticalKeys: ['Rest-defense management against Madrid transitions', 'Central midfield overloading through Rodri & De Bruyne', 'Attacking the half-spaces behind full-backs'],
  },

  matchAnalysisData: {
    competition: 'PREMIER LEAGUE • MATCHDAY 28',
    scoreline: { team1: 'ARSENAL', score1: 2, team2: 'MAN CITY', score2: 1 },
    scorersTeam1: ['Saka 34\'', 'Havertz 78\''],
    scorersTeam2: ['Haaland 51\''],
    stats: [
      { label: 'Expected Goals (xG)', val1: '2.14', val2: '1.08', val1Num: 2.14, val2Num: 1.08 },
      { label: 'Possession %', val1: '48%', val2: '52%', val1Num: 48, val2Num: 52 },
      { label: 'Shots on Target', val1: '6', val2: '3', val1Num: 6, val2Num: 3 },
      { label: 'Field Tilt %', val1: '56%', val2: '44%', val1Num: 56, val2Num: 44 },
    ],
    tacticalSummary: 'Arsenal suffocated City with an aggressive 4-4-2 mid-block and punished defensive transitions through Saka on the right flank.',
    keyTakeaways: ['High press forced 14 defensive turnovers in opponent half', 'Saka 1v1 dominance created 4 key chances from wide channels', 'Saliba & Gabriel eliminated box delivery to Haaland'],
    performerTitle: 'MAN OF THE MATCH',
    performerName: 'BUKAYO SAKA',
    performerNote: '1 Goal • 4 Key Passes • 5 Progressive Carries • 8.9 Match Rating',
  },

  tacticalData: {
    topic: 'CENTRAL OVERLOAD & HALF-SPACE DYNAMICS',
    teamOrCoach: 'BAYER LEVERKUSEN • XABI ALONSO',
    formation: '3-4-2-1 / 3-2-4-1 IN POSSESSION',
    phase: 'In Possession',
    corePrinciples: [
      { title: 'Inverted Pocket Receivers', description: 'Dual number 10s sit directly behind opposing midfield line to draw central defenders out of shape.' },
      { title: 'Wide Wing-Back Isolations', description: 'Maximum pitch width created by wing-backs holding touchline until deep third penetration.' },
      { title: 'Rest-Defense 3+2 Shape', description: '3 central defenders plus 2 holding midfielders maintain structural stability during sustained pressure.' },
    ],
    tacticalNote: 'Extreme patience in circulation until vertical passing lanes into half-spaces open up.',
    keyInstructions: ['Quick 1-2 touch combinations in central third', 'Trigger counter-press within 3 seconds of possession loss', 'Overload left half-space to isolate right wing-back 1v1'],
  },

  statHighlightData: {
    heroStat: '94.2%',
    heroStatLabel: 'Pass Accuracy Under High Pressure in Final Third',
    rankBadge: '#1 IN EUROPE',
    categoryTag: 'CREATIVE EFFICIENCY',
    sampleSize: 'MIN. 1200 MINUTES PLAYED • 2025/26 TOP 5 LEAGUES',
    contextMetrics: [
      { id: 'cm1', value: '4.82', label: 'Passes into Box /90', icon: 'route' as const, subValue: '99th %tile' },
      { id: 'cm2', value: '0.44', label: 'Expected Assists /90', icon: 'target' as const, subValue: '97th %tile' },
      { id: 'cm3', value: '88.4%', label: 'Long Ball Accuracy', icon: 'award' as const, subValue: '94th %tile' },
      { id: 'cm4', value: '3.1', label: 'Shot-Creating Actions /90', icon: 'sparkles' as const, subValue: '95th %tile' },
    ],
    editorialVerdict: 'Unrivaled press resistance and passing precision under congested penalty box pressure makes him the most reliable progressive playmaker in the modern game.',
  },

  rankingData: {
    categoryTitle: 'TOP 5 CHANCE CREATORS',
    subtitle: 'U21 PLAYERS IN EUROPE\'S TOP 5 LEAGUES',
    metricHeader: 'Expected Assists (xA) /90',
    seasonFilter: '2025/26 SEASON • MIN 900 MINUTES',
    items: [
      { id: 'r1', rank: 1, playerName: 'MOMODOU SONKO', club: 'KAA Gent', val: '0.39', subVal: '2.21 Key Passes', highlighted: true },
      { id: 'r2', rank: 2, playerName: 'LAMINE YAMAL', club: 'FC Barcelona', val: '0.36', subVal: '2.45 Key Passes' },
      { id: 'r3', rank: 3, playerName: 'SAVINHO', club: 'Manchester City', val: '0.32', subVal: '2.10 Key Passes' },
      { id: 'r4', rank: 4, playerName: 'DESIRE DOUE', club: 'Paris SG', val: '0.29', subVal: '1.95 Key Passes' },
      { id: 'r5', rank: 5, playerName: 'JAMIE GITTENS', club: 'Borussia Dortmund', val: '0.28', subVal: '1.88 Key Passes' },
    ],
    footerNote: 'Source: Opta & StatsBomb data indexed across Europe top leagues.',
  },

  quoteData: {
    quote: 'In football, simplicity is the most difficult thing. When you control space, you control the tempo, and when you control tempo, the opponent plays your game.',
    authorName: 'PEP GUARDIOLA',
    authorRole: 'Manager, Manchester City FC',
    topicTag: 'TACTICAL PHILOSOPHY',
    sourceDate: 'Champions League Press Conference • February 2026',
    keyPunchline: 'When you control space, you control the tempo.',
  },

  threadCoverData: {
    headline: 'THE TACTICAL EVOLUTION OF REST-DEFENSE',
    subtitle: 'How Elite European Teams Engineered Counter-Pressing Dominance In 2026',
    badge: 'EDITORIAL TACTICAL SERIES • 8-PART BREAKDOWN',
    authorHandle: 'Tactical Analysis by @BasitBiOyun',
    topicBullets: ['The 3-2 and 2-3 rest defense architectures', 'Counter-pressing triggers and 3-second recovery rules', 'Preventing central transition channels'],
  },

  matchResultData: {
    competition: 'UEFA CHAMPIONS LEAGUE • ROUND OF 16',
    stage: '2ND LEG (AGG: 4-2)',
    team1: 'REAL MADRID',
    team2: 'BAYERN MUNICH',
    score1: 3,
    score2: 1,
    scorers1: ['Vinicius Jr 21\'', 'Bellingham 54\'', 'Mbappe 89\''],
    scorers2: ['Kane 73\' (P)'],
    matchStats: [
      { label: 'Expected Goals (xG)', val1: '2.84', val2: '1.22' },
      { label: 'Total Shots (on target)', val1: '16 (8)', val2: '9 (3)' },
      { label: 'Possession %', val1: '53%', val2: '47%' },
      { label: 'Big Chances Created', val1: '5', val2: '1' },
    ],
    mvpPlayer: 'VINICIUS JUNIOR',
    mvpStat: '1 Goal • 1 Assist • 7 Successful Dribbles',
    matchSummary: 'Devastating transition execution in the final third sent Real Madrid through to the quarter-finals.',
  },

  teamProfileData: {
    teamName: 'BAYER LEVERKUSEN',
    manager: 'XABI ALONSO',
    league: 'BUNDESLIGA',
    leagueRank: '1ST PLACE • 64 PTS',
    tacticalStyleTag: 'Dynamic Rest-Defense & Positional Half-Space Play',
    metrics: [
      { id: 'tm1', value: '2.34', label: 'xG Created /90', icon: 'football' as const, subValue: '1st in League' },
      { id: 'tm2', value: '0.78', label: 'xGA Conceded /90', icon: 'shield' as const, subValue: '1st in League' },
      { id: 'tm3', value: '8.4', label: 'PPDA (Pressing Intensity)', icon: 'bolt' as const, subValue: '2nd in League' },
      { id: 'tm4', value: '68.2%', label: 'Field Tilt % (Territory)', icon: 'chart' as const, subValue: '1st in League' },
    ],
    strengths: ['Sustained final third territory and field tilt', 'Elite rest-defense and counter-pressing recovery', 'Dual number 10 interplay in half-spaces'],
    weaknesses: ['Vulnerability against direct aerial switches behind wing-backs', 'High line vulnerability on rare breakdown of counter-press'],
    tacticalSummary: 'The most tactically cohesive side in Europe, dominating territory through rigorous rest-defense and fluid half-space rotations.',
  },
};

const makeTemplate = () => ({
  visuals: JSON.parse(JSON.stringify(baseVisuals)),
  layout: JSON.parse(JSON.stringify(baseLayout)),
  theme: JSON.parse(JSON.stringify(THEME_PRESETS[0])),
  content: JSON.parse(JSON.stringify(baseContent)),
});

export const DEFAULT_PROJECT: Project = {
  id: 'sonko-kaa-gent',
  name: 'Momodou Sonko - Scouting Report',
  templateType: 'scouting-report',
  aspectRatio: '1:1',
  visualMode: 'editorial',
  createdAt: Date.now(),
  updatedAt: Date.now(),

  sharedData: {
    player: {
      name: 'Momodou Sonko',
      age: '21',
      nationality: 'Sweden',
      countryFlag: '🇸🇪',
      preferredFoot: 'Right Foot',
      height: '176 cm',
      positions: 'LW / RW',
      club: 'KAA Gent',
    },
    credits: {
      preparedFor: 'Prepared for @EmirScouts',
      visualBy: 'Visual by BasitBiOyun',
    },
  },

  templates: {
    'scouting-report': makeTemplate(),
    'player-comparison': makeTemplate(),
    'transfer-graphic': makeTemplate(),
    'match-preview': makeTemplate(),
    'match-analysis': makeTemplate(),
    'tactical-analysis': makeTemplate(),
    'stat-highlight': makeTemplate(),
    'ranking-top-list': makeTemplate(),
    'quote-opinion': makeTemplate(),
    'thread-cover': makeTemplate(),
    'match-result': makeTemplate(),
    'team-profile': makeTemplate(),
  }
};

export const DEFAULT_PROJECTS: Record<TemplateType, Project> = {
  'scouting-report': { ...DEFAULT_PROJECT, templateType: 'scouting-report' },
  'player-comparison': {
    ...DEFAULT_PROJECT,
    templateType: 'player-comparison',
    name: 'Sonko vs Nuamah - Comparison',
  },
  'transfer-graphic': {
    ...DEFAULT_PROJECT,
    templateType: 'transfer-graphic',
    name: 'Gyökeres to Arsenal - Done Deal',
  },
  'match-preview': {
    ...DEFAULT_PROJECT,
    templateType: 'match-preview',
    name: 'Real Madrid vs Man City - Preview',
  },
  'match-analysis': {
    ...DEFAULT_PROJECT,
    templateType: 'match-analysis',
    name: 'Arsenal 2-1 Man City - Analysis',
  },
  'tactical-analysis': {
    ...DEFAULT_PROJECT,
    templateType: 'tactical-analysis',
    name: 'Xabi Alonso Half-Space Dynamics',
  },
  'stat-highlight': {
    ...DEFAULT_PROJECT,
    templateType: 'stat-highlight',
    name: 'Hero Stat Showcase',
  },
  'ranking-top-list': {
    ...DEFAULT_PROJECT,
    templateType: 'ranking-top-list',
    name: 'Top 5 Chance Creators',
  },
  'quote-opinion': {
    ...DEFAULT_PROJECT,
    templateType: 'quote-opinion',
    name: 'Pep Guardiola Tactical Quote',
  },
  'thread-cover': {
    ...DEFAULT_PROJECT,
    templateType: 'thread-cover',
    name: 'Rest Defense Tactical Cover',
  },
  'match-result': {
    ...DEFAULT_PROJECT,
    templateType: 'match-result',
    name: 'Real Madrid 3-1 Bayern - Result',
  },
  'team-profile': {
    ...DEFAULT_PROJECT,
    templateType: 'team-profile',
    name: 'Bayer Leverkusen Team Profile',
  },
};
