const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

execSync("find src -type f -name '*.tsx' -exec sed -i 's/sharedData?\\.player\\.name/sharedData?.player?.name/g' {} +");
execSync("find src -type f -name '*.ts' -exec sed -i 's/sharedData?\\.player\\.name/sharedData?.player?.name/g' {} +");

// Also check .positions and .club and .age
execSync("find src -type f -name '*.tsx' -exec sed -i 's/sharedData?\\.player\\.positions/sharedData?.player?.positions/g' {} +");
execSync("find src -type f -name '*.tsx' -exec sed -i 's/sharedData?\\.player\\.club/sharedData?.player?.club/g' {} +");
execSync("find src -type f -name '*.tsx' -exec sed -i 's/sharedData?\\.player\\.age/sharedData?.player?.age/g' {} +");

// Note: `created.sharedData.player.name` -> `created.sharedData.player.name` doesn't have `?`, but let's make sure it's valid.
