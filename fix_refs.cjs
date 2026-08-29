const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Note: we can just use native fs recursion or sed

// Just use child_process for sed on all files
const { execSync } = require('child_process');

execSync("find src -type f -name '*.tsx' -exec sed -i 's/project\\.player/project.sharedData.player/g' {} +");
execSync("find src -type f -name '*.ts' -exec sed -i 's/project\\.player/project.sharedData.player/g' {} +");

