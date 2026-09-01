# BasitBiOyun Studio Execution Roadmap

This document is the source of truth for autonomous Studio development. Work must proceed sequentially. Never start a later phase until the current phase has passed all acceptance gates.

## Global execution rules

1. Work only on the current unfinished phase.
2. Inspect the current implementation before changing code. Reuse existing architecture where possible.
3. Do not redesign working frontend areas unless the phase explicitly requires it.
4. Do not remove working controls, color swatches, data fields, localization, footer branding, social controls, logo selectors, image removal, undo/redo, export, or responsive behavior unless replacing them with a verified equivalent.
5. Prefer small, reviewable changes over broad rewrites.
6. After each meaningful change run/build the relevant tests.
7. A phase is complete only when:
   - Studio CI passes.
   - Responsive Visual QA passes.
   - Vercel production deployment is successful.
   - No known regression from the phase remains open.
8. If a gate fails, stay on the same phase and fix it. Do not advance.
9. If one run cannot finish the phase safely, leave the phase unfinished and continue it on the next run.
10. Preserve Turkish and English behavior. Turkish typography must respect Turkish dotted/dotless I casing.
11. Preserve PNG/JPG export behavior and ensure preview/export render the same design.
12. Avoid placeholder player photos or club logos unless a template explicitly calls for one.
13. Logo placement must be template-aware. Do not use one generic fixed upper-right logo position for every template when the template semantics require team, club or competition logos elsewhere.

---

## Phase 3 — Template Perfection

Goal: make all 12 templates feel purpose-built rather than variants of scouting-report.

### Scope

Perfect templates in this order:
1. Player Comparison
2. Match Preview
3. Match Analysis
4. Tactical Analysis
5. Match Result
6. Team Profile
7. Transfer Graphic
8. Scouting Report
9. Stat Highlight
10. Ranking / Top List
11. Quote / Opinion
12. Thread Cover

### Immediate Phase 3 priority — template-aware club/team/competition logos

These requirements are newly added and are NOT considered complete merely because a template previously received a Phase 3 polish pass. Before Phase 3 can be completed, revisit the affected templates and implement the following semantic logo behavior:

- Transfer Graphic must have distinct `from club` and `to club` logo slots mapped to the correct clubs. The preferred composition is logo-first: a prominent club crest with the club name as a smaller label underneath or adjacent when useful. Do not rely on a generic upper-right logo for transfer identity.
- Match Preview must support both home and away team logos in the main matchup composition, with each crest clearly attached to the correct team. Use a clean visual separator such as `VS`, a thin divider, or another non-score-like separator between the sides when appropriate.
- Match Analysis must support both participating team logos in a logical matchup/header area when the analysis concerns two teams. The logos must remain mapped to the correct home/away or left/right team.
- Match Result must support both team logos and keep each logo, team name, score and scorer information on the correct side. The score itself is the central separator; do not add a dash that could be confused with the score.
- Tactical Analysis must be scope-aware: use one team logo for a single-team tactical analysis and two correctly mapped team logos for a head-to-head tactical matchup. Do not force two logos when the content is about one team.
- Team Profile must support the club crest plus a separate optional league/competition logo slot. League/competition identity must not be faked by reusing the club-logo slot.
- Player Comparison must keep player/team identity visually clear and must never cause one player or club logo to appear in the other player's slot.
- Across all affected templates, logos must use purposeful template-specific placement rather than all appearing in the same fixed upper-right position.
- Club/team names may remain as small labels beneath or near crests for recognition and accessibility; avoid oversized duplicate club names when the logo already carries the main visual hierarchy.

### Requirements

- Each template must use the full canvas intelligently.
- No unexplained dead zones or inherited scouting layout behavior.
- Long and short names must remain visually balanced.
- Home/away team information must align logically.
- Match Result scorers must sit beneath the correct team.
- Match Analysis and Tactical Analysis must use full-width content layouts unless an optional image is intentionally present.
- Player Comparison must clearly support two players and two images.
- Team Profile must support crest-as-background without destroying text hierarchy and must allow a separate league/competition identity mark.
- Transfer Graphic must support player image plus correctly mapped from/to club logos cleanly.
- Match Preview, Match Analysis and Match Result must support two correctly mapped team crests where two teams are present.
- Tactical Analysis must support one-team and two-team logo states according to analysis scope.
- Headline, subtitle, body, verdict, stat, label and footer hierarchy must be consistent.
- No text clipping at supported aspect ratios.
- Logos and player photos must respect safe zones.
- Template-specific default content should make semantic sense.
- Competition labels and football terminology must localize correctly in TR mode.

### Typography controls

Add template-aware sizing controls rather than one destructive global font-size slider.
At minimum expose sensible controls for:
- headline size
- subtitle size where relevant
- body/verdict size where relevant
- stat/value size where relevant

Controls must have safe min/max ranges and defaults.

### Acceptance gates

- 12 templates render without overflow in 1:1, 4:5, 16:9 and 9:16.
- Long-name smoke tests pass.
- TR/EN switching does not break layout.
- Logo and image optional states look intentional.
- Transfer Graphic proves from-club crest and to-club crest cannot swap slots.
- Match Preview, Match Analysis and Match Result prove both team crests render in the correct team slots.
- Tactical Analysis proves both single-team and two-team logo states behave intentionally.
- Team Profile proves club crest and league/competition logo can coexist as separate assets without hierarchy or export breakage.
- No affected template falls back to a meaningless generic upper-right logo placement when a semantic logo slot exists.
- Studio CI green.
- Responsive Visual QA green.
- Vercel production green.

---

## Phase 4 — Production Hardening

Goal: make the current Studio dependable before adding major new features.

### Scope

- Fix any remaining duplicate DOM id/test selector issues between preview/export/batch renders.
- Verify undo/redo across template switch, logo selection, text edit, image removal, theme change and layout change.
- Verify local project persistence and reload.
- Verify sidebar resize/collapse/expand.
- Verify TR/EN UI localization and graphic localization.
- Verify PNG and JPG export at 1x, 2x and 4x.
- Verify multi-ratio batch export.
- Verify manual image/logo upload, crop and remove.
- Verify club logo catalogue selection for Arsenal, Fenerbahçe and Real Madrid as smoke-test clubs.
- Verify semantic logo-slot persistence and export for Transfer Graphic from/to clubs, Match Preview home/away teams, Match Analysis teams, Match Result teams, Tactical Analysis scope-aware team logos, and Team Profile club/competition logos.
- Verify changing one team/club logo never overwrites another semantic logo slot.
- Verify footer BasitBiOyun logo renders in preview and export.
- Verify social footer toggles.
- Remove dead legacy sidebar/editor code only when proven unused.
- Fix obvious performance regressions and React update loops.

### Acceptance gates

- No black-screen or freeze regression.
- No known broken logo selector.
- No team/club/competition logo mapped to the wrong semantic slot.
- No broken production assets.
- Core editor regression tests cover state/history behavior.
- Studio CI green.
- Responsive Visual QA green.
- Vercel production green.

---

## Phase 5 — Smart Text Fit

Goal: eliminate overflow without making designs look mechanically shrunk.

### Requirements

- Introduce reusable text-fit helpers.
- Per-field min/max font sizes.
- Prefer line-count and container-aware reduction.
- Preserve visual hierarchy: headline > subtitle > body > metadata.
- Never shrink every text block because one field is long.
- Support Turkish characters correctly.
- Add long-content regression fixtures.

### Acceptance gates

- No clipping in long-name/long-headline fixtures.
- Normal-length content remains at intended size.
- CI + visual QA + Vercel green.

---

## Phase 6 — Brand Presets

Goal: one-click visual systems without destroying template data.

### Presets

At minimum:
- BasitBiOyun Editorial
- Fenerbahçe Analysis
- Transfer News
- Scouting
- Matchday

### Requirements

A preset can change only visual/design properties such as:
- colors
- fonts
- background pattern
- footer/social configuration
- default logo treatment
- safe layout defaults

It must not overwrite template content or imported data.

### Acceptance gates

- Switching presets preserves content and images unless explicitly documented.
- Undo restores previous visual state.
- CI + visual QA + Vercel green.

---

## Phase 7 — Asset Library

Goal: stop re-uploading the same assets.

### Requirements

- Local-first asset library using IndexedDB or equivalent browser storage.
- Store reusable player cutouts, club logos, competition/league logos and custom images.
- Thumbnail browser with search/name.
- Add/remove/rename assets.
- Apply an asset to the currently relevant semantic slot.
- Do not require a backend.
- Avoid duplicate storage using a hash when practical.

### Acceptance gates

- Assets survive reload.
- Selecting an asset updates only the intended visual slot.
- Removing a library asset does not corrupt existing project state.
- CI + visual QA + Vercel green.

---

## Phase 8 — Club & Competition Database UX

Goal: make logo/entity selection reliable and fast.

### Requirements

- Searchable club catalogue.
- Searchable competition catalogue.
- Club record should expose name, country, league and logo where available.
- Competition record should expose at minimum canonical name, localized TR/EN display name, country/region where applicable, competition type and logo where available.
- Competition/league logos must be first-class assets rather than being forced through a club-logo field.
- Selecting a club must immediately update the intended semantic logo slot and relevant club text only when explicitly chosen.
- Selecting a competition must update only the intended competition/league identity and logo slot.
- Competition terminology must localize in TR/EN.
- Graceful fallback when a remote club or competition logo cannot load.
- Do not silently substitute another club or competition.
- Team Profile must be able to use both a club crest and a separate league/competition logo from the catalogue.
- Match templates and Transfer Graphic must consume club selections without losing their home/away/from/to slot semantics.

### Smoke tests

- Arsenal
- Fenerbahçe
- Real Madrid
- UEFA Champions League
- Süper Lig
- Premier League

### Acceptance gates

- Club and competition selections render on canvas and export.
- Team Profile can show the correct club crest and correct league/competition logo simultaneously.
- Transfer and match template logo-slot mappings remain correct after catalogue selection.
- CI + visual QA + Vercel green.

---

## Phase 9 — Template Variants

Goal: multiple compositions from the same data.

### Requirements

Create controlled variants for high-value templates first:
- Transfer Graphic: Minimal, Breaking, Editorial
- Match Preview: Editorial, Poster, Data
- Scouting Report: Editorial, Data
- Player Comparison: Split, Table/Data

Variant switching must reuse the same template data and visual assets.
Do not duplicate project content into independent copies.
All variants must preserve semantic logo mapping: from/to, home/away, player/team, club/competition identities must not swap or collapse into a generic logo slot.

### Acceptance gates

- Switching variants is reversible.
- No data loss.
- No semantic logo-slot loss or swapping across variants.
- Existing JSON packs still load.
- CI + visual QA + Vercel green.

---

## Phase 10 — Auto Layout Presets

Goal: provide useful composition choices without manual dragging.

### Requirements

Examples:
- player left
- player right
- centered subject
- no-subject full-content
- crest background
- two-player split

Only expose presets valid for the active template.
Manual overrides should remain possible where the editor supports them.
Logo placements must remain attached to their semantic team/club/competition identities when layout presets change.

### Acceptance gates

- Presets never move content outside canvas.
- Reset returns to a known valid layout.
- Logo identities do not swap when changing layout presets.
- CI + visual QA + Vercel green.

---

## Phase 11 — Smart Data Layer

Goal: make JSON packs reliable, discoverable and template-specific.

### Requirements

- Formal schema/version for each template pack.
- Strict templateType validation.
- Backward-compatible migration where practical.
- Clear import errors and warnings.
- Missing fields should preserve template defaults instead of corrupting state.
- Import must preserve visuals unless schema explicitly includes visual instructions.
- Where a template supports multiple logos, schemas must keep semantic identities distinct, for example `fromClub`, `toClub`, `homeTeam`, `awayTeam`, `club`, and `competition`, rather than a single ambiguous logo field.
- Document current example JSON for all 12 templates.
- Add export-current-data-as-JSON where useful.

### Acceptance gates

- Round-trip tests for representative templates.
- Wrong-template imports rejected cleanly.
- Multi-logo templates preserve the correct logo-to-entity mapping through JSON import/export where visuals are included.
- CI + visual QA + Vercel green.

---

## Phase 12 — Batch Content Generator

Goal: reuse one data pack across multiple social graphics.

### Requirements

For supported content types, allow one source pack to produce a coordinated set such as:
- main graphic
- stat highlight
- thread cover
- story/vertical output

Generated outputs must reuse data, brand preset and selected assets where appropriate.
Do not silently invent missing facts.
Team/club/competition logo identities must remain correct across generated outputs.

### Acceptance gates

- Generated projects remain independently editable.
- Batch export names are deterministic and clean.
- Generated outputs do not swap or drop semantic team/club/competition logos.
- CI + visual QA + Vercel green.

---

## Phase 13 — X / Social Safe-Zone Preview

Goal: show how exports will appear on social platforms.

### Requirements

- Non-destructive preview overlays only.
- X timeline crop/safe-zone guidance.
- 1:1, 4:5, 16:9 and 9:16 preview support.
- Toggle overlays on/off.
- Safe-zone overlay must never appear in exported graphic unless explicitly requested.

### Acceptance gates

- Preview does not alter project state or export.
- CI + visual QA + Vercel green.

---

## Phase 14 — Template Versioning & Recovery

Goal: make design evolution safe.

### Requirements

- Record template schema/version metadata.
- Migrate older saved projects safely.
- Keep known-good defaults for each template version.
- Provide recovery/reset-to-current-template-default without deleting unrelated project data.
- Preserve or safely migrate semantic multi-logo slots introduced for transfer, match and competition-aware templates.
- Document breaking migrations.

### Acceptance gates

- Old representative saved projects load without black screen.
- Migration tests exist.
- Old projects with legacy generic logo fields recover without silently assigning a logo to the wrong team/club/competition slot.
- CI + visual QA + Vercel green.

---

## Completion rule

The roadmap is complete only when Phase 14 has passed all global gates. Do not declare a phase complete merely because code was committed. Tests and production deployment are part of the definition of done.
