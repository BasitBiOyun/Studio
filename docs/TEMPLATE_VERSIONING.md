# Template Versioning & Recovery

BasitBiOyun Studio records project-level and per-template version metadata whenever saved projects are loaded, imported, created, duplicated, restored or saved.

Current metadata:

- `projectSchemaVersion`: current saved-project envelope version.
- `templateVersions`: per-template state version map for all 12 templates.
- `migrationWarnings`: non-fatal migration decisions that intentionally avoided guessing legacy semantic identity.

## Known-good defaults

`src/services/templateVersioning.ts` keeps a known-good default snapshot for every current template version. `recoverTemplateToCurrentDefault(project, templateType)` resets only the selected template state to that current known-good default. Project identity, shared data, aspect ratio and every unrelated template state remain untouched.

## Legacy semantic-logo migration

Modern multi-logo templates use semantic slots such as from/to club, home/away team, club/opponent and club/competition. A legacy project that already has multiple indexed semantic logos is preserved.

An old project with one ambiguous legacy generic logo cannot prove which semantic identity that image belongs to. Studio therefore does not silently assign that image to slot 0. The ambiguous generic logo instruction is discarded before defaults are merged, safe semantic defaults are restored, and a migration warning is recorded. This prevents a historical generic crest from silently becoming the wrong home team, from club, club or competition logo.

## Breaking migration notes

Project schema version 2 introduces saved-project version metadata and the no-guess rule for ambiguous generic logos. No content fields are intentionally deleted. The only intentionally dropped legacy value is a single generic logo in a template that now requires more than one semantic identity, because assigning it automatically would risk displaying the wrong club/team/competition.

Recovery/reset is destructive only for the selected template state. Users should use project version history first when they want to preserve the exact previous template configuration.
