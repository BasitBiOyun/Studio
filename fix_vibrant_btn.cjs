const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('Generate Theme from Image')) {
  // Find where Player Cutout Image is defined
  const targetStr = `<span>Upload PNG</span>
                  <input`;
  const replaceStr = `<span>Upload PNG</span>
                  <input`;
  
  // Actually let's just add it below the player cutout upload section
  const targetSection = `{/* Transform Sliders */}`;
  const inject = `
              {playerImageSrc && (
                <button
                  onClick={() => extractThemeFromImage(playerImageSrc)}
                  className="w-full mt-2 py-2 px-3 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 text-fuchsia-400 border border-fuchsia-800/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <IconWand size={14} />
                  Generate Theme from Image
                </button>
              )}
              {/* Transform Sliders */}`;

  code = code.replace(targetSection, inject);
  fs.writeFileSync(file, code);
}
