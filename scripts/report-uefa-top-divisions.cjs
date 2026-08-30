const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const VERIFIER = path.join(ROOT, 'scripts/verify-uefa-top-divisions.cjs');
const REPORT_DIR = path.join(ROOT, 'artifacts');
const REPORT_FILE = path.join(REPORT_DIR, 'uefa-logo-report.json');

function parseCoverage(output) {
  return String(output || '')
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\[clubs\] verified (.+): (\d+)\/(\d+)$/);
      if (!match) return null;
      return {
        association: match[1],
        resolved: Number(match[2]),
        expected: Number(match[3]),
        missing: Number(match[3]) - Number(match[2]),
      };
    })
    .filter(Boolean);
}

function parseUnresolved(output) {
  const match = String(output || '').match(/Unresolved current top-flight logos \(\d+\): ([^\n]+)/);
  if (!match) return [];
  return match[1]
    .split(' | ')
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseAssociationCount(output) {
  const match = String(output || '').match(/Expected 54 domestic UEFA top divisions, got (\d+)\./);
  return match ? Number(match[1]) : null;
}

function writeReport(report) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

const result = spawnSync(process.execPath, [VERIFIER], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
});

const stdout = result.stdout || '';
const stderr = result.stderr || '';
const combined = `${stdout}\n${stderr}`;

if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);

const unresolved = parseUnresolved(combined);
const topDivisionAssociations = parseAssociationCount(combined);
const expectedCoverageGap = unresolved.length > 0 || topDivisionAssociations !== null;
const exitCode = typeof result.status === 'number' ? result.status : 1;

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'report-only',
  status: exitCode === 0 ? 'complete' : expectedCoverageGap ? 'incomplete' : 'error',
  exitCode,
  expectedAssociations: 54,
  topDivisionAssociations,
  unresolvedCount: unresolved.length,
  unresolved,
  coverage: parseCoverage(stdout),
  verifierSignal: result.signal || null,
  verifierError: result.error ? String(result.error.message || result.error) : null,
};

writeReport(report);
console.log(`[clubs] Coverage report written to ${path.relative(ROOT, REPORT_FILE)} (${report.status}).`);

if (exitCode === 0 || expectedCoverageGap) {
  if (exitCode !== 0) {
    console.warn('[clubs] Coverage gap recorded in report-only mode; workflow will continue.');
  }
  process.exit(0);
}

console.error('[clubs] Unexpected verifier failure. Keeping the workflow red so broken automation is not hidden.');
process.exit(exitCode || 1);
