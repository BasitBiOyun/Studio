import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_PROJECT, TEMPLATE_METADATA } from '../src/constants/presets';
import { searchLocalClubCatalogue } from '../src/services/clubCatalogue';
import {
  COMPETITION_CATALOGUE,
  competitionTypeLabel,
  displayCompetitionName,
  searchCompetitionCatalogue,
} from '../src/services/competitionCatalogue';
import {
  applyClubEntitySelection,
  applyCompetitionEntitySelection,
  getEntityTargets,
} from '../src/services/entitySelection';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const fener = searchLocalClubCatalogue('Fenerbahçe', 5).find((club) => /fenerbah/i.test(club.name));
assert.ok(fener, 'Fenerbahçe must be searchable in the local club catalogue.');
assert.ok(fener.country, 'Club catalogue records must expose country.');
assert.ok(fener.league, 'Club catalogue records must expose league.');
assert.ok(fener.logoUrl, 'Club catalogue records must expose a logo where available.');

assert.ok(COMPETITION_CATALOGUE.length >= 40, 'Competition catalogue should include European domestic leagues plus curated competitions.');
for (const competition of COMPETITION_CATALOGUE) {
  assert.ok(competition.id, 'Competition record missing id.');
  assert.ok(competition.canonicalName, 'Competition record missing canonical name.');
  assert.ok(competition.displayNameEn, 'Competition record missing English display name.');
  assert.ok(competition.displayNameTr, 'Competition record missing Turkish display name.');
  assert.ok(competition.countryRegion, 'Competition record missing country/region.');
  assert.ok(competition.type, 'Competition record missing type.');
}

const champions = searchCompetitionCatalogue('şampiyonlar', 10).find((entry) => entry.id === 'uefa-champions-league');
assert.ok(champions, 'Turkish competition terminology must be searchable.');
assert.equal(displayCompetitionName(champions, 'tr'), 'UEFA Şampiyonlar Ligi');
assert.equal(displayCompetitionName(champions, 'en'), 'UEFA Champions League');
assert.equal(competitionTypeLabel(champions.type, 'tr'), 'Kıtasal Kulüp');
assert.equal(competitionTypeLabel(champions.type, 'en'), 'Continental Club');

const logoData = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E';

for (const metadata of TEMPLATE_METADATA) {
  const base = clone(DEFAULT_PROJECT);
  base.templateType = metadata.type;
  const active = base.templates[metadata.type];
  active.visuals.logos = active.visuals.logos.map((logo, index) => ({ ...logo, src: `KEEP-LOGO-${index}`, visible: true }));

  for (const target of getEntityTargets(base, 'club')) {
    const beforeContent = JSON.stringify(base.templates[metadata.type].content);
    const beforeShared = JSON.stringify(base.sharedData);
    const applied = applyClubEntitySelection(base, target.key, fener!, logoData, false);
    assert.equal(JSON.stringify(applied.templates[metadata.type].content), beforeContent, `${metadata.type} club visual-only selection changed content.`);
    assert.equal(JSON.stringify(applied.sharedData), beforeShared, `${metadata.type} club visual-only selection changed shared data.`);
    applied.templates[metadata.type].visuals.logos.forEach((logo, index) => {
      if (index === target.index) assert.equal(logo.src, logoData, `${metadata.type} did not update intended club logo slot.`);
      else assert.equal(logo.src, `KEEP-LOGO-${index}`, `${metadata.type} club selection overwrote sibling logo slot ${index}.`);
    });
  }

  for (const target of getEntityTargets(base, 'competition')) {
    const beforeContent = JSON.stringify(base.templates[metadata.type].content);
    const beforeShared = JSON.stringify(base.sharedData);
    const applied = applyCompetitionEntitySelection(base, target.key, champions!, logoData, 'tr', false);
    assert.equal(JSON.stringify(applied.templates[metadata.type].content), beforeContent, `${metadata.type} competition visual-only selection changed content.`);
    assert.equal(JSON.stringify(applied.sharedData), beforeShared, `${metadata.type} competition visual-only selection changed shared data.`);
    applied.templates[metadata.type].visuals.logos.forEach((logo, index) => {
      if (index === target.index) assert.equal(logo.src, logoData, `${metadata.type} did not update intended competition logo slot.`);
      else assert.equal(logo.src, `KEEP-LOGO-${index}`, `${metadata.type} competition selection overwrote sibling logo slot ${index}.`);
    });
  }
}

{
  const project = clone(DEFAULT_PROJECT);
  project.templateType = 'transfer-graphic';
  const before = clone(project.templates['transfer-graphic'].content.transferData!);
  const from = applyClubEntitySelection(project, 'logo-0', fener!, logoData, true);
  assert.equal(from.templates['transfer-graphic'].content.transferData?.fromClub, fener!.name, 'Transfer from-club text was not updated by explicit catalogue selection.');
  assert.equal(from.templates['transfer-graphic'].content.transferData?.toClub, before.toClub, 'Transfer from-club selection changed to-club text.');

  const to = applyClubEntitySelection(project, 'logo-1', fener!, logoData, true);
  assert.equal(to.templates['transfer-graphic'].content.transferData?.toClub, fener!.name, 'Transfer to-club text was not updated by explicit catalogue selection.');
  assert.equal(to.templates['transfer-graphic'].content.transferData?.fromClub, before.fromClub, 'Transfer to-club selection changed from-club text.');
}

{
  const project = clone(DEFAULT_PROJECT);
  project.templateType = 'match-preview';
  const before = clone(project.templates['match-preview'].content.matchPreviewData!);
  const clubApplied = applyClubEntitySelection(project, 'logo-0', fener!, logoData, true);
  assert.equal(clubApplied.templates['match-preview'].content.matchPreviewData?.team1.name, fener!.name);
  assert.equal(clubApplied.templates['match-preview'].content.matchPreviewData?.team2.name, before.team2.name);

  const trApplied = applyCompetitionEntitySelection(project, 'logo-2', champions!, logoData, 'tr', true);
  assert.equal(trApplied.templates['match-preview'].content.matchPreviewData?.competition, 'UEFA Şampiyonlar Ligi');
  const enApplied = applyCompetitionEntitySelection(project, 'logo-2', champions!, logoData, 'en', true);
  assert.equal(enApplied.templates['match-preview'].content.matchPreviewData?.competition, 'UEFA Champions League');
}

{
  const project = clone(DEFAULT_PROJECT);
  project.templateType = 'team-profile';
  const clubApplied = applyClubEntitySelection(project, 'logo-0', fener!, logoData, true);
  assert.equal(clubApplied.templates['team-profile'].content.teamProfileData?.teamName, fener!.name);
  const competitionApplied = applyCompetitionEntitySelection(project, 'logo-1', champions!, logoData, 'tr', true);
  assert.equal(competitionApplied.templates['team-profile'].content.teamProfileData?.league, 'UEFA Şampiyonlar Ligi');
}

{
  const project = clone(DEFAULT_PROJECT);
  const untouched = applyClubEntitySelection(project, 'logo-99', fener!, logoData, true);
  assert.equal(untouched, project, 'Unsupported semantic club target must be ignored.');
  const untouchedCompetition = applyCompetitionEntitySelection(project, 'logo-99', champions!, logoData, 'en', true);
  assert.equal(untouchedCompetition, project, 'Unsupported semantic competition target must be ignored.');
}

const modalSource = fs.readFileSync('src/components/EntityDatabaseModal.tsx', 'utf8');
const sidebarSource = fs.readFileSync('src/components/EditorSidebar.tsx', 'utf8');
const assetTargetsSource = fs.readFileSync('src/services/assetTargets.ts', 'utf8');
assert.ok(sidebarSource.includes('entity-database-open') && sidebarSource.includes('EntityDatabaseModal'), 'Phase 8 database launcher/modal wiring is missing.');
assert.ok(modalSource.includes('entity-mode-club') && modalSource.includes('entity-mode-competition'), 'Club and competition catalogues must be separate first-class modes.');
assert.ok(modalSource.includes('entity-target') && modalSource.includes('getEntityTargets'), 'Entity database must target semantic slots explicitly.');
assert.ok(modalSource.includes('materializeEntityImage'), 'Remote logo failures must have a materialized fallback path.');
assert.ok(assetTargetsSource.includes("competition: [{") || assetTargetsSource.includes('competition:'), 'Competition logos must remain first-class semantic assets.');
assert.equal(/fetch\([^)]*\/api\//.test(modalSource), false, 'Phase 8 modal must not require a custom backend.');

console.log('Phase 8 club & competition database self-test passed.');
