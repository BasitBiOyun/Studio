const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('ImageCropModal')) {
  code = code.replace(
    "import { ScoutingReportForm } from './forms/ScoutingReportForm';",
    "import { ScoutingReportForm } from './forms/ScoutingReportForm';\nimport { ImageCropModal } from './ImageCropModal';\nimport imageCompression from 'browser-image-compression';\nimport Vibrant from 'node-vibrant';"
  );
  
  // Add state for cropping
  code = code.replace(
    "const [activeTab, setActiveTab] = useState<'visuals' | 'data'>('data');",
    "const [activeTab, setActiveTab] = useState<'visuals' | 'data'>('data');\n  const [cropState, setCropState] = useState<{ src: string, type: 'primary' | 'secondary' | number } | null>(null);"
  );
  
  // Rewrite handlePlayerPhotoUpload to use image compression and open crop modal
  const handleUpload = `
  const handlePlayerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isSecondary = false) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setCropState({ src: result, type: isSecondary ? 'secondary' : 'primary' });
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Set crop state for logos using index
          setCropState({ src: result, type: index });
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  const handleCropComplete = async (croppedDataUrl: string) => {
    if (!cropState) return;
    
    if (cropState.type === 'primary') {
      updateVisuals({ playerImageSrc: croppedDataUrl });
    } else if (cropState.type === 'secondary') {
      updateVisuals({ secondaryPlayerImageSrc: croppedDataUrl });
    } else if (typeof cropState.type === 'number') {
      const newLogos = [...activeTemplate.visuals.logos];
      newLogos[cropState.type].src = croppedDataUrl;
      newLogos[cropState.type].visible = true;
      updateVisuals({ logos: newLogos });
    }
    setCropState(null);
  };
  
  const extractThemeFromImage = async (src: string) => {
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
`;

  code = code.replace(
    /const handlePlayerPhotoUpload = \(e: React\.ChangeEvent<HTMLInputElement>, isSecondary = false\) => \{[\s\S]*?\}\s*\};/g,
    handleUpload
  );
  
  // also remove old handleLogoUpload if present
  code = code.replace(
    /const handleLogoUpload = \(e: React\.ChangeEvent<HTMLInputElement>, index: number\) => \{[\s\S]*?\}\s*\};/g,
    ""
  );
  
  // Add extract theme button to Image uploads
  // Right near <IconUpload size={14} /> <span>Upload PNG</span>
  code = code.replace(
    /<span>Upload PNG<\/span>/g,
    `<span>Upload PNG</span>`
  );
  
  // We'll add the Extract Theme button manually next.
  
  // Put Crop Modal at the bottom
  code = code.replace(
    /<\/aside>/,
    `  {cropState && <ImageCropModal imageSrc={cropState.src} onCropComplete={handleCropComplete} onCancel={() => setCropState(null)} />}\n    </aside>`
  );

  fs.writeFileSync(file, code);
}
