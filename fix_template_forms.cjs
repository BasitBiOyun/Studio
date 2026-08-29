const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'TemplateForms.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('IconDatabase')) {
  code = code.replace(
    "import { IconChevronDown, IconChevronUp, IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react';",
    "import { IconChevronDown, IconChevronUp, IconPlus, IconTrash, IconGripVertical, IconDatabase, IconCheck, IconAlertTriangle } from '@tabler/icons-react';"
  );
}

// Inside ScoutingReportForm, we render `Stats / Metrics`.
// Let's find where stats are mapped.
// <div className="space-y-3">
//   {content.stats.map((stat, idx) => (

const target = `className="w-1/2 p-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                />
              </div>
            </div>`;

const replace = `className="w-1/2 p-2 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                />
              </div>
              
              {/* Data Provenance Inspector */}
              <div className="mt-2 p-2 bg-neutral-900/50 border border-neutral-800 rounded flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold">
                    <IconDatabase size={12} />
                    Data Provenance
                  </div>
                  {stat.provenance?.verified ? (
                     <div className="flex items-center gap-1 text-[10px] text-emerald-400"><IconCheck size={10} /> Verified Source</div>
                  ) : stat.provenance?.type === 'manual' ? (
                     <div className="flex items-center gap-1 text-[10px] text-amber-400"><IconAlertTriangle size={10} /> Manual Entry</div>
                  ) : stat.provenance?.type === 'calculated' ? (
                     <div className="flex items-center gap-1 text-[10px] text-cyan-400"><IconDatabase size={10} /> Calculated</div>
                  ) : (
                     <div className="flex items-center gap-1 text-[10px] text-neutral-500">Unverified</div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <input
                    type="text"
                    placeholder="Source (e.g. Opta)"
                    value={stat.provenance?.source || ''}
                    onChange={(e) => {
                      const newStats = [...content.stats];
                      newStats[idx].provenance = { ...newStats[idx].provenance, source: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    className="p-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200"
                  />
                  <input
                    type="text"
                    placeholder="Competition"
                    value={stat.provenance?.competition || ''}
                    onChange={(e) => {
                      const newStats = [...content.stats];
                      newStats[idx].provenance = { ...newStats[idx].provenance, competition: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    className="p-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200"
                  />
                  <input
                    type="text"
                    placeholder="Season"
                    value={stat.provenance?.season || ''}
                    onChange={(e) => {
                      const newStats = [...content.stats];
                      newStats[idx].provenance = { ...newStats[idx].provenance, season: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    className="p-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200"
                  />
                  <input
                    type="text"
                    placeholder="Mins/Sample"
                    value={stat.provenance?.sampleSize || ''}
                    onChange={(e) => {
                      const newStats = [...content.stats];
                      newStats[idx].provenance = { ...newStats[idx].provenance, sampleSize: e.target.value };
                      updateContent({ stats: newStats });
                    }}
                    className="p-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200"
                  />
                </div>
              </div>
            </div>`;

code = code.replace(target, replace);
code = code.replace(target, replace); // Just in case there are multiple templates like PlayerComparisonForm

fs.writeFileSync(file, code);
