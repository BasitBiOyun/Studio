# BasitBiOyun Studio — Template JSON Packs

Every active template can import its own JSON file from the Studio top bar.

Import rules:

- JSON updates only the active template's data/content.
- Theme, layout, uploaded player images and logos are preserved.
- Arrays in the imported payload replace the corresponding array.
- Nested objects are merged with the existing template data.
- If `templateType` is present and does not match the active template, import is rejected.
- For non-scouting templates, `schemaVersion` may be either `template-pack-v1` or `<template-type>-pack-v1`.
- `data: { ... }` is optional. The template fields may also be placed directly at the JSON root.

## 1. Scouting Report

Uses the existing `player-pack-v1` format.

```json
{
  "schemaVersion": "player-pack-v1",
  "player": {
    "name": "Player Name",
    "age": 22,
    "nationality": "Türkiye",
    "club": "Fenerbahçe",
    "preferredFoot": "Right",
    "height": "185 cm",
    "positions": "CB"
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
  "player1": { "name": "Player A", "club": "Club A" },
  "player2": { "name": "Player B", "club": "Club B" },
  "subtitle": "2026/27 comparison",
  "metrics": [
    { "id": "duels", "label": "Duels Won %", "val1": "64%", "val2": "58%", "higherIsBetter": true }
  ],
  "verdictTitle": "Analytical Verdict",
  "verdictText": "..."
}
```

## 3. Transfer Graphic

```json
{
  "schemaVersion": "transfer-graphic-pack-v1",
  "templateType": "transfer-graphic",
  "player": { "name": "Player Name", "age": "22", "positions": "CB" },
  "headline": "AGREEMENT REACHED",
  "badgeText": "TRANSFER UPDATE",
  "transferFee": "€12M",
  "contractLength": "5-YEAR CONTRACT",
  "fromClub": "Nice",
  "toClub": "Fenerbahçe",
  "detailsSummary": "...",
  "keyConditions": ["..."]
}
```

## 4. Match Preview

```json
{
  "schemaVersion": "match-preview-pack-v1",
  "templateType": "match-preview",
  "competition": "UEFA Champions League",
  "matchDate": "18 September 2026",
  "kickoffTime": "21:45 • Chobani Stadium",
  "team1": { "name": "Fenerbahçe", "form": ["W", "W", "D"], "manager": "...", "standing": "..." },
  "team2": { "name": "Liverpool", "form": ["W", "D", "W"], "manager": "...", "standing": "..." },
  "keyBattleTitle": "KEY TACTICAL BATTLE",
  "keyBattleDetails": "...",
  "tacticalKeys": ["...", "..."]
}
```

## 5. Match Analysis

```json
{
  "schemaVersion": "match-analysis-pack-v1",
  "templateType": "match-analysis",
  "competition": "UEFA Champions League",
  "scoreline": { "team1": "Fenerbahçe", "score1": 2, "team2": "Liverpool", "score2": 1 },
  "scorersTeam1": ["..."],
  "scorersTeam2": ["..."],
  "stats": [
    { "label": "Expected Goals (xG)", "val1": "1.84", "val2": "1.12", "val1Num": 1.84, "val2Num": 1.12 }
  ],
  "tacticalSummary": "...",
  "keyTakeaways": ["..."],
  "performerTitle": "PLAYER OF THE MATCH",
  "performerName": "...",
  "performerNote": "..."
}
```

## 6. Tactical Analysis

```json
{
  "schemaVersion": "tactical-analysis-pack-v1",
  "templateType": "tactical-analysis",
  "topic": "HIGH PRESSING STRUCTURE",
  "teamOrCoach": "FENERBAHÇE • HEAD COACH",
  "formation": "4-2-3-1",
  "phase": "Out of Possession",
  "corePrinciples": [
    { "title": "First line pressure", "description": "..." }
  ],
  "tacticalNote": "...",
  "keyInstructions": ["...", "..."]
}
```

## 7. Stat Highlight

```json
{
  "schemaVersion": "stat-highlight-pack-v1",
  "templateType": "stat-highlight",
  "heroStat": "94.2%",
  "heroStatLabel": "Pass Completion Rate",
  "rankBadge": "#1 IN LEAGUE",
  "categoryTag": "STANDOUT STAT",
  "sampleSize": "2026/27 SEASON • MIN. 900 MINUTES",
  "contextMetrics": [],
  "editorialVerdict": "..."
}
```

## 8. Ranking / Top List

```json
{
  "schemaVersion": "ranking-top-list-pack-v1",
  "templateType": "ranking-top-list",
  "categoryTitle": "TOP 5 CHANCE CREATORS",
  "subtitle": "U23 PLAYERS",
  "metricHeader": "Key Passes /90",
  "seasonFilter": "2026/27 SEASON",
  "items": [
    { "id": "1", "rank": 1, "playerName": "Player", "club": "Club", "val": "3.4", "subVal": "900 mins" }
  ],
  "footerNote": "..."
}
```

## 9. Quote / Opinion

```json
{
  "schemaVersion": "quote-opinion-pack-v1",
  "templateType": "quote-opinion",
  "quote": "...",
  "authorName": "...",
  "authorRole": "Head Coach",
  "topicTag": "OPINION & INSIGHT",
  "sourceDate": "Press Conference • August 2026",
  "keyPunchline": "..."
}
```

## 10. Thread Cover

```json
{
  "schemaVersion": "thread-cover-pack-v1",
  "templateType": "thread-cover",
  "headline": "...",
  "subtitle": "...",
  "badge": "EDITORIAL THREAD",
  "authorHandle": "Analysis by @BasitBiOyun",
  "topicBullets": ["...", "...", "..."]
}
```

## 11. Match Result

```json
{
  "schemaVersion": "match-result-pack-v1",
  "templateType": "match-result",
  "competition": "UEFA Champions League",
  "stage": "League Phase",
  "team1": "Fenerbahçe",
  "team2": "Liverpool",
  "score1": 2,
  "score2": 1,
  "scorers1": ["..."],
  "scorers2": ["..."],
  "matchStats": [
    { "label": "Possession %", "val1": "48%", "val2": "52%" }
  ],
  "mvpPlayer": "...",
  "mvpStat": "...",
  "matchSummary": "..."
}
```

## 12. Team Profile

```json
{
  "schemaVersion": "team-profile-pack-v1",
  "templateType": "team-profile",
  "teamName": "Fenerbahçe",
  "manager": "...",
  "league": "Süper Lig",
  "leagueRank": "1ST PLACE",
  "tacticalStyleTag": "High-Intensity Positional Play",
  "metrics": [],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "tacticalSummary": "..."
}
```

## Optional envelope metadata

Any non-scouting pack may also include these fields without affecting visual settings:

```json
{
  "schemaVersion": "template-pack-v1",
  "templateType": "match-preview",
  "context": { "season": "2026/27" },
  "sources": [{ "source": "Manual" }],
  "metadata": { "author": "BasitBiOyun" },
  "data": {
    "competition": "UEFA Champions League"
  }
}
```
