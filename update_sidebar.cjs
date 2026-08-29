const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('ClubLogoSelector')) {
  code = code.replace(/import \{ TemplateForms \} from '\.\/TemplateForms';/, "import { TemplateForms } from './TemplateForms';\nimport { ClubLogoSelector } from './ClubLogoSelector';");
}

const targetHtml = `<div className="flex items-center gap-2">
                      <button
                        onClick={() => updateLogo(idx, 'visible', !logo.visible)}
                        className="p-1 rounded text-neutral-400 hover:text-white"
                      >
                        {logo.visible ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                      </button>
                      <label className="cursor-pointer px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-cyan-400 font-bold">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, idx)}
                          className="hidden"
                        />
                      </label>
                    </div>`;

const replaceHtml = `<div className="flex items-center gap-2 w-full mt-2">
                        <ClubLogoSelector 
                          label={logo.name}
                          currentLogoUrl={logo.src}
                          onSelect={(dataUrl) => updateLogo(idx, 'src', dataUrl)}
                          onRemove={() => updateLogo(idx, 'src', '')}
                          onManualUpload={(e) => handleLogoUpload(e, idx)}
                        />
                        <button
                          onClick={() => updateLogo(idx, 'visible', !logo.visible)}
                          className="p-2 rounded bg-neutral-800 text-neutral-400 hover:text-white flex-shrink-0"
                          title="Toggle Visibility"
                        >
                          {logo.visible ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                        </button>
                    </div>`;

const searchRegex = /<div className="flex items-center justify-between">\s*<span className="text-xs font-bold text-white">\{logo\.name\}<\/span>\s*<div className="flex items-center gap-2">\s*<button\s*onClick=\{\(\) => updateLogo\(idx, 'visible', !logo\.visible\)\}\s*className="p-1 rounded text-neutral-400 hover:text-white"\s*>\s*\{logo\.visible \? <IconEye size=\{16\} \/> : <IconEyeOff size=\{16\} \/>\}\s*<\/button>\s*<label className="cursor-pointer px-2 py-0\.5 rounded bg-neutral-800 hover:bg-neutral-700 text-\[11px\] text-cyan-400 font-bold">\s*Replace\s*<input\s*type="file"\s*accept="image\/\*"\s*onChange=\{\(e\) => handleLogoUpload\(e, idx\)\}\s*className="hidden"\s*\/>\s*<\/label>\s*<\/div>\s*<\/div>/;

const newSection = `<div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{logo.name}</span>
                    </div>
                    ${replaceHtml}
                  </div>`;

code = code.replace(searchRegex, newSection);
fs.writeFileSync(file, code);
