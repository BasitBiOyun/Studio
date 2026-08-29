const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// The issue is around extractThemeFromImage 
// find extractThemeFromImage definition and replace up to "const filteredTemplates"
code = code.replace(/const extractThemeFromImage = async[\s\S]*?const filteredTemplates/m, 
`const extractThemeFromImage = async (src: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = async () => {
        const v = new Vibrant(img);
        const palette = await v.getPalette();
        const primary = palette.Vibrant?.hex || '#ffffff';
        const secondary = palette.LightVibrant?.hex || '#aaaaaa';
        const bg1 = palette.DarkMuted?.hex || '#000000';
        updateTheme({
          primaryAccent: primary,
          secondaryAccent: secondary,
          bg1: bg1,
          bg2: '#111111'
        });
      };
    } catch(e) {
      console.error(e);
    }
  };

  // Filtered Templates
  const filteredTemplates`);
  
fs.writeFileSync(file, code);
