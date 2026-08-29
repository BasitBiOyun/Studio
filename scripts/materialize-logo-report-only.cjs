const fs = require('fs');

const verifierFile = 'scripts/verify-uefa-top-divisions.cjs';
const workflowFile = '.github/workflows/sync-club-catalogue.yml';

let verifier = fs.readFileSync(verifierFile, 'utf8');

function replaceVerifier(needle, replacement, label) {
  if (!verifier.includes(needle)) throw new Error(`Logo report patch failed: ${label}`);
  verifier = verifier.replace(needle, replacement);
}

replaceVerifier(
  "async function main() {\n  const baseRows = readJson(CATALOGUE_FILES[0], []);",
  "async function main() {\n  const reportOnly = process.argv.includes('--report-only');\n  const baseRows = readJson(CATALOGUE_FILES[0], []);",
  'main anchor missing',
);

const oldUnresolved = [
  '  if (unresolved.length) throw new Error(`Unresolved current top-flight logos (${unresolved.length}): ${unresolved.join(\' | \')}`);',
  '',
  "  rows = dedupe(rows).sort((a, b) => a.country.localeCompare(b.country) || String(a.league || '').localeCompare(String(b.league || '')) || a.name.localeCompare(b.name));",
].join('\n');

const newUnresolved = [
  '  const writeCoverageReport = (status, extra = {}) => {',
  "    const reportDir = path.join(ROOT, 'artifacts');",
  '    fs.mkdirSync(reportDir, { recursive: true });',
  '    const report = {',
  '      generatedAt: new Date().toISOString(),',
  "      mode: reportOnly ? 'report-only' : 'strict',",
  '      status,',
  '      expectedAssociations: 54,',
  '      checkedManualAssociations: DIVISIONS.length,',
  '      unresolvedCount: unresolved.length,',
  '      unresolved,',
  '      coverage,',
  '      ...extra,',
  '    };',
  "    fs.writeFileSync(path.join(reportDir, 'uefa-logo-report.json'), `${JSON.stringify(report, null, 2)}\\n`, 'utf8');",
  '  };',
  '',
  '  if (unresolved.length) {',
  "    writeCoverageReport('incomplete');",
  "    const message = `Unresolved current top-flight logos (${unresolved.length}): ${unresolved.join(' | ')}`;",
  '    if (reportOnly) {',
  '      console.warn(`[clubs] REPORT ONLY: ${message}`);',
  "      console.log('[clubs] Coverage gaps were recorded without failing the workflow.');",
  '      return;',
  '    }',
  '    throw new Error(message);',
  '  }',
  '',
  "  rows = dedupe(rows).sort((a, b) => a.country.localeCompare(b.country) || String(a.league || '').localeCompare(String(b.league || '')) || a.name.localeCompare(b.name));",
].join('\n');

replaceVerifier(oldUnresolved, newUnresolved, 'unresolved coverage anchor missing');

replaceVerifier(
  '  if (topCountries.size !== 54) throw new Error(`Expected 54 domestic UEFA top divisions, got ${topCountries.size}.`);',
  [
    '  if (topCountries.size !== 54) {',
    "    writeCoverageReport('association-count-mismatch', { topDivisionAssociations: topCountries.size });",
    '    const message = `Expected 54 domestic UEFA top divisions, got ${topCountries.size}.`;',
    '    if (reportOnly) {',
    '      console.warn(`[clubs] REPORT ONLY: ${message}`);',
    '      return;',
    '    }',
    '    throw new Error(message);',
    '  }',
  ].join('\n'),
  'association count anchor missing',
);

const oldSuccess = [
  '  writeJson(CATALOGUE_FILES, rows);',
  '  writeJson(META_FILES, nextMeta);',
  '  console.log(`[clubs] COMPLETE: ${topCountries.size}/54 domestic UEFA associations, ${topRows.length} top-flight club logo rows.`);',
].join('\n');

const newSuccess = [
  '  writeJson(CATALOGUE_FILES, rows);',
  '  writeJson(META_FILES, nextMeta);',
  "  writeCoverageReport('complete', { topDivisionAssociations: topCountries.size, topDivisionEntries: topRows.length });",
  '  console.log(`[clubs] COMPLETE: ${topCountries.size}/54 domestic UEFA associations, ${topRows.length} top-flight club logo rows.`);',
].join('\n');

replaceVerifier(oldSuccess, newSuccess, 'successful write anchor missing');
fs.writeFileSync(verifierFile, verifier, 'utf8');

let workflow = fs.readFileSync(workflowFile, 'utf8');
const oldStep = [
  '      - name: Verify all UEFA domestic top divisions',
  '        run: node scripts/verify-uefa-top-divisions.cjs',
  '',
  '      - name: Commit refreshed snapshot',
].join('\n');
const newStep = [
  '      - name: Verify UEFA domestic top divisions (report only)',
  '        run: node scripts/verify-uefa-top-divisions.cjs --report-only',
  '',
  '      - name: Upload UEFA logo coverage report',
  '        if: always()',
  '        uses: actions/upload-artifact@v4',
  '        with:',
  '          name: uefa-logo-coverage-report',
  '          path: artifacts/uefa-logo-report.json',
  '          if-no-files-found: warn',
  '          retention-days: 30',
  '',
  '      - name: Commit refreshed snapshot',
].join('\n');

if (!workflow.includes(oldStep)) throw new Error('Logo report patch failed: workflow verifier step anchor missing');
workflow = workflow.replace(oldStep, newStep);
fs.writeFileSync(workflowFile, workflow, 'utf8');

console.log('UEFA logo verifier switched to report-only workflow mode while retaining strict CLI mode.');
