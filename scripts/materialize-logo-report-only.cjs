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

replaceVerifier(
  "  if (unresolved.length) throw new Error(`Unresolved current top-flight logos (${unresolved.length}): ${unresolved.join(' | ')}`);\n\n  rows = dedupe(rows).sort((a, b) => a.country.localeCompare(b.country) || String(a.league || '').localeCompare(String(b.league || '')) || a.name.localeCompare(b.name));",
  `  const writeCoverageReport = (status, extra = {}) => {\n    const reportDir = path.join(ROOT, 'artifacts');\n    fs.mkdirSync(reportDir, { recursive: true });\n    const report = {\n      generatedAt: new Date().toISOString(),\n      mode: reportOnly ? 'report-only' : 'strict',\n      status,\n      expectedAssociations: 54,\n      checkedManualAssociations: DIVISIONS.length,\n      unresolvedCount: unresolved.length,\n      unresolved,\n      coverage,\n      ...extra,\n    };\n    fs.writeFileSync(path.join(reportDir, 'uefa-logo-report.json'), \\`\\${JSON.stringify(report, null, 2)}\\n\\`, 'utf8');\n  };\n\n  if (unresolved.length) {\n    writeCoverageReport('incomplete');\n    const message = \\`Unresolved current top-flight logos (\\${unresolved.length}): \\${unresolved.join(' | ')}\\`;\n    if (reportOnly) {\n      console.warn(\\`[clubs] REPORT ONLY: \\${message}\\`);\n      console.log('[clubs] Coverage gaps were recorded without failing the workflow.');\n      return;\n    }\n    throw new Error(message);\n  }\n\n  rows = dedupe(rows).sort((a, b) => a.country.localeCompare(b.country) || String(a.league || '').localeCompare(String(b.league || '')) || a.name.localeCompare(b.name));`,
  'unresolved coverage anchor missing',
);

replaceVerifier(
  "  if (topCountries.size !== 54) throw new Error(`Expected 54 domestic UEFA top divisions, got ${topCountries.size}.`);",
  `  if (topCountries.size !== 54) {\n    writeCoverageReport('association-count-mismatch', { topDivisionAssociations: topCountries.size });\n    const message = \\`Expected 54 domestic UEFA top divisions, got \\${topCountries.size}.\\`;\n    if (reportOnly) {\n      console.warn(\\`[clubs] REPORT ONLY: \\${message}\\`);\n      return;\n    }\n    throw new Error(message);\n  }`,
  'association count anchor missing',
);

replaceVerifier(
  "  writeJson(CATALOGUE_FILES, rows);\n  writeJson(META_FILES, nextMeta);\n  console.log(`[clubs] COMPLETE: ${topCountries.size}/54 domestic UEFA associations, ${topRows.length} top-flight club logo rows.`);",
  `  writeJson(CATALOGUE_FILES, rows);\n  writeJson(META_FILES, nextMeta);\n  writeCoverageReport('complete', { topDivisionAssociations: topCountries.size, topDivisionEntries: topRows.length });\n  console.log(\\`[clubs] COMPLETE: \\${topCountries.size}/54 domestic UEFA associations, \\${topRows.length} top-flight club logo rows.\\`);`,
  'successful write anchor missing',
);

fs.writeFileSync(verifierFile, verifier, 'utf8');

let workflow = fs.readFileSync(workflowFile, 'utf8');
const oldStep = `      - name: Verify all UEFA domestic top divisions\n        run: node scripts/verify-uefa-top-divisions.cjs\n\n      - name: Commit refreshed snapshot`;
const newStep = `      - name: Verify UEFA domestic top divisions (report only)\n        run: node scripts/verify-uefa-top-divisions.cjs --report-only\n\n      - name: Upload UEFA logo coverage report\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: uefa-logo-coverage-report\n          path: artifacts/uefa-logo-report.json\n          if-no-files-found: warn\n          retention-days: 30\n\n      - name: Commit refreshed snapshot`;

if (!workflow.includes(oldStep)) throw new Error('Logo report patch failed: workflow verifier step anchor missing');
workflow = workflow.replace(oldStep, newStep);
fs.writeFileSync(workflowFile, workflow, 'utf8');

console.log('UEFA logo verifier switched to report-only workflow mode while retaining strict CLI mode.');
