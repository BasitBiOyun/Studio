const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Function to walk the dir
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const templates = [
  'scouting-report', 'player-comparison', 'transfer-graphic', 'match-preview',
  'match-analysis', 'tactical-analysis', 'stat-highlight', 'ranking-top-list',
  'quote-opinion', 'thread-cover', 'match-result', 'team-profile'
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // We will do manual editing for the types and presets.
    // This script will just check how many times `project.XXX` is used.
  }
});
