# BasitBiOyun Studio — Template JSON Packs

Phase 11 makes every Studio template pack explicit, versioned and template-specific. The active template is always validated before import.

## Import contract

- Every canonical pack declares `schemaVersion` and `templateType`.
- A pack declared for another template is rejected instead of being applied to the wrong card.
- Missing data fields preserve current template defaults/current values.
- Arrays supplied by a pack replace the matching array. Nested objects are merged.
- Content-only imports do not change player images, logo slots, theme or layout.
- Visuals change only when an explicit top-level `visuals` object is present.
- Visual instructions use semantic identities such as `fromClub`, `toClub`, `homeTeam`, `awayTeam`, `club` and `competition`; there is no ambiguous generic logo field.
- Unknown data fields are preserved where practical and reported as warnings. Unknown visual identities are ignored with a warning.
- Legacy non-scouting `template-pack-v1`, unversioned packs and `<template>-pack-v0` envelopes migrate to the canonical v1 envelope where this can be done without guessing identity.
- Legacy Player Pack migration remains supported.

## Canonical schema versions

| Template | `templateType` | Canonical `schemaVersion` |
| --- | --- | --- |
| Scouting Report | `scouting-report` | `player-pack-v1` |
| Player Comparison | `player-comparison` | `player-comparison-pack-v1` |
| Transfer Graphic | `transfer-graphic` | `transfer-graphic-pack-v1` |
| Match Preview | `match-preview` | `match-preview-pack-v1` |
| Match Analysis | `match-analysis` | `match-analysis-pack-v1` |
| Tactical Analysis | `tactical-analysis` | `tactical-analysis-pack-v1` |
| Stat Highlight | `stat-highlight` | `stat-highlight-pack-v1` |
| Ranking / Top List | `ranking-top-list` | `ranking-top-list-pack-v1` |
| Quote / Opinion | `quote-opinion` | `quote-opinion-pack-v1` |
| Thread Cover | `thread-cover` | `thread-cover-pack-v1` |
| Match Result | `match-result` | `match-result-pack-v1` |
| Team Profile | `team-profile` | `team-profile-pack-v1` |

## Semantic visual identities

The optional `visuals` object maps identities to existing semantic logo slots. Import changes only logo source/visibility in the intended slot; slot ID, name, size and position are preserved.

String shorthand:

```json
"visuals": { "fromClub": "data:image/svg+xml,..." }
```

Object form:

```json
"visuals": { "fromClub": { "logoSrc": "data:image/svg+xml,...", "visible": true } }
```

| Template | Semantic visual keys |
| --- | --- |
| Scouting Report | `playerClub`, `competition` |
| Player Comparison | `player1Club`, `player2Club`, `competition` |
| Transfer Graphic | `fromClub`, `toClub`, `competition` |
| Match Preview | `homeTeam`, `awayTeam`, `competition` |
| Match Analysis | `homeTeam`, `awayTeam`, `competition` |
| Tactical Analysis | `club`, `opponent`, `competition` |
| Stat Highlight | `club`, `competition` |
| Ranking / Top List | `competition`, `highlightedClub` |
| Quote / Opinion | `authorClub`, `competition` |
| Thread Cover | `club`, `competition` |
| Match Result | `homeTeam`, `awayTeam`, `competition` |
| Team Profile | `club`, `competition` |

If `visuals` is omitted, current visual assets remain untouched.

## Export current template data

The sidebar exposes **Data JSON / Veri JSON**. It exports only the active template data using its canonical schema and excludes visual instructions by default. The pack service can also create an explicit visual-inclusive export for programmatic round trips.

## 1. Scouting Report

```json
{
  "schemaVersion": "player-pack-v1",
  "templateType": "scouting-report",
  "player": {
    "name": "Player Name",
    "age": 22,
    "nationality": "Türkiye",
    "countryCode": "tr",
    "club": "Fenerbahçe",
    "preferredFoot": "Right",
    "height": "185 cm",
    "positions": "AM / SS"
  },
  "stats": [],
  "scouting": {
    "summary": "...",
    "tacticalProfile": "...",
    "strengths": ["..."],
    "development": ["..."]
  }
}
```

## 2. Player Comparison

```json
{
  "schemaVersion": "player-comparison-pack-v1",
  "templateType": "player-comparison",
  "data": {
    "player1": { "name": "Player A", "club": "Club A" },
    "player2": { "name": "Player B", "club": "Club B" },
    "subtitle": "2026/27 comparison",
    "metrics": [{ "id": "duels", "label": "Duels Won %", "val1": "64%", "val2": "58%", "higherIsBetter": true }],
    "verdictTitle": "Analytical Verdict",
    "verdictText": "..."
  }
}
```

## 3. Transfer Graphic

```json
{
  "schemaVersion": "transfer-graphic-pack-v1",
  "templateType": "transfer-graphic",
  "data": {
    "player": { "name": "Player Name", "age": "22", "positions": "CB" },
    "headline": "AGREEMENT REACHED",
    "badgeText": "TRANSFER UPDATE",
    "transferFee": "€12M",
    "contractLength": "5-YEAR CONTRACT",
    "fromClub": "Nice",
    "toClub": "Fenerbahçe",
    "detailsSummary": "...",
    "keyConditions": ["..."]
  },
  "visuals": {
    "fromClub": { "logoSrc": "data:image/svg+xml,...", "visible": true },
    "toClub": { "logoSrc": "data:image/svg+xml,...", "visible": true }
  }
}
```

## 4. Match Preview

```json
{
  "schemaVersion": "match-preview-pack-v1",
  "templateType": "match-preview",
  "data": {
    "competition": "UEFA Champions League",
    "matchDate": "18 September 2026",
    "kickoffTime": "21:45 • Chobani Stadium",
    "team1": { "name": "Fenerbahçe", "form": ["W", "W", "D"], "manager": "...", "standing": "..." },
    "team2": { "name": "Liverpool", "form": ["W", "D", "W"], "manager": "...", "standing": "..." },
    "keyBattleTitle": "KEY TACTICAL BATTLE",
    "keyBattleDetails": "...",
    "tacticalKeys": ["...", "..."]
  },
  "visuals": {
    "homeTeam": "data:image/svg+xml,...",
    "awayTeam": "data:image/svg+xml,...",
    "competition": "data:image/svg+xml,..."
  }
}
```

## 5. Match Analysis

```json
{
  "schemaVersion": "match-analysis-pack-v1",
  "templateType": "match-analysis",
  "data": {
    "competition": "UEFA Champions League",
    "scoreline": { "team1": "Fenerbahçe", "score1": 2, "team2": "Liverpool", "score2": 1 },
    "scorersTeam1": ["..."],
    "scorersTeam2": ["..."],
    "stats": [{ "label": "Expected Goals (xG)", "val1": "1.84", "val2": "1.12", "val1Num": 1.84, "val2Num": 1.12 }],
    "tacticalSummary": "...",
    "keyTakeaways": ["..."],
    "performerTitle": "PLAYER OF THE MATCH",
    "performerName": "...",
    "performerNote": "..."
  }
}
```

## 6. Tactical Analysis

```json
{
  "schemaVersion": "tactical-analysis-pack-v1",
  "templateType": "tactical-analysis",
  "data": {
    "topic": "HIGH PRESSING STRUCTURE",
    "teamOrCoach": "FENERBAHÇE • HEAD COACH",
    "formation": "4-2-3-1",
    "phase": "Out of Possession",
    "corePrinciples": [{ "title": "First line pressure", "description": "..." }],
    "tacticalNote": "...",
    "keyInstructions": ["...", "..."]
  }
}
```

## 7. Stat Highlight

```json
{
  "schemaVersion": "stat-highlight-pack-v1",
  "templateType": "stat-highlight",
  "data": {
    "heroStat": "94.2%",
    "heroStatLabel": "Pass Completion Rate",
    "rankBadge": "#1 IN LEAGUE",
    "categoryTag": "STANDOUT STAT",
    "sampleSize": "2026/27 SEASON • MIN. 900 MINUTES",
    "contextMetrics": [],
    "editorialVerdict": "..."
  }
}
```

## 8. Ranking / Top List

```json
{
  "schemaVersion": "ranking-top-list-pack-v1",
  "templateType": "ranking-top-list",
  "data": {
    "categoryTitle": "TOP 5 CHANCE CREATORS",
    "subtitle": "U23 PLAYERS",
    "metricHeader": "Key Passes /90",
    "seasonFilter": "2026/27 SEASON",
    "items": [{ "id": "1", "rank": 1, "playerName": "Player", "club": "Club", "val": "3.4", "subVal": "900 mins" }],
    "footerNote": "..."
  }
}
```

## 9. Quote / Opinion

```json
{
  "schemaVersion": "quote-opinion-pack-v1",
  "templateType": "quote-opinion",
  "data": {
    "quote": "...",
    "authorName": "...",
    "authorRole": "Head Coach",
    "topicTag": "OPINION & INSIGHT",
    "sourceDate": "Press Conference • August 2026",
    "keyPunchline": "..."
  }
}
```

## 10. Thread Cover

```json
{
  "schemaVersion": "thread-cover-pack-v1",
  "templateType": "thread-cover",
  "data": {
    "headline": "...",
    "subtitle": "...",
    "badge": "EDITORIAL THREAD",
    "authorHandle": "Analysis by @BasitBiOyun",
    "topicBullets": ["...", "...", "..."]
  }
}
```

## 11. Match Result

```json
{
  "schemaVersion": "match-result-pack-v1",
  "templateType": "match-result",
  "data": {
    "competition": "UEFA Champions League",
    "stage": "League Phase",
    "team1": "Fenerbahçe",
    "team2": "Liverpool",
    "score1": 2,
    "score2": 1,
    "scorers1": ["..."],
    "scorers2": ["..."],
    "matchStats": [{ "label": "Possession %", "val1": "48%", "val2": "52%" }],
    "mvpPlayer": "...",
    "mvpStat": "...",
    "matchSummary": "..."
  }
}
```

## 12. Team Profile

```json
{
  "schemaVersion": "team-profile-pack-v1",
  "templateType": "team-profile",
  "data": {
    "teamName": "Fenerbahçe",
    "manager": "...",
    "league": "Süper Lig",
    "leagueRank": "1ST PLACE",
    "tacticalStyleTag": "High-Intensity Positional Play",
    "metrics": [],
    "strengths": ["..."],
    "weaknesses": ["..."],
    "tacticalSummary": "..."
  },
  "visuals": {
    "club": "data:image/svg+xml,...",
    "competition": "data:image/svg+xml,..."
  }
}
```

## Optional provenance metadata

Canonical non-scouting packs may include `context`, `sources`, `metadata` and `generatedAt` alongside `data`. These are stored as provenance and do not change visual design.

```json
{
  "schemaVersion": "match-preview-pack-v1",
  "templateType": "match-preview",
  "context": { "season": "2026/27" },
  "sources": [{ "source": "Manual" }],
  "metadata": { "author": "BasitBiOyun" },
  "data": { "competition": "UEFA Champions League" }
}
```
