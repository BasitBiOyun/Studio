const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'EditorSidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Need to add state for inspectedStats
if (!code.includes('inspectedStats')) {
  code = code.replace(
    /const \[templateCategoryFilter, setTemplateCategoryFilter\] = useState<string>\('All'\);/,
    `const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('All');\n  const [inspectedStats, setInspectedStats] = useState<Record<string, boolean>>({});\n  const toggleInspect = (id: string) => setInspectedStats(prev => ({...prev, [id]: !prev[id]}));`
  );
}

const mapRegex = /\{stats\.slice\(0, 4\)\.map\(\(st, idx\) => \(\s*<div key=\{st\.id \|\| idx\} className="p-3 rounded-lg bg-black\/40 border border-neutral-800 space-y-2">([\s\S]*?)<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\)\}/;

const replacement = `{stats.slice(0, 4).map((st, idx) => {
                    const status = st.provenance?.status || 'missing';
                    let StatusIcon = IconAlertCircle;
                    let statusColor = 'text-neutral-500';
                    let statusText = 'Missing Source';

                    if (status === 'verified') {
                      StatusIcon = IconShieldCheck;
                      statusColor = 'text-green-400';
                      statusText = 'Verified Data';
                    } else if (status === 'manual') {
                      StatusIcon = IconUserEdit;
                      statusColor = 'text-yellow-400';
                      statusText = 'Manual Entry';
                    } else if (status === 'calculated') {
                      StatusIcon = IconInfoCircle;
                      statusColor = 'text-cyan-400';
                      statusText = 'Calculated Data';
                    }
                    
                    const isInspecting = inspectedStats[st.id || idx];

                    return (
                    <div key={st.id || idx} className="p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-2 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                         <button onClick={() => toggleInspect(st.id || String(idx))} className={\`p-1.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1 \${isInspecting ? 'bg-neutral-800' : ''}\`} title="Data Inspector">
                            <StatusIcon size={14} className={statusColor} />
                         </button>
                      </div>
                      $1</select>
                        </div>
                      </div>
                      
                      {isInspecting && (
                         <div className="mt-4 pt-3 border-t border-neutral-800 space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                                <IconDatabase size={12} className="text-cyan-500" />
                                Data Inspector
                              </span>
                              <span className={\`text-[9px] uppercase px-1.5 py-0.5 rounded-full border \${status === 'verified' ? 'bg-green-950/30 border-green-900 text-green-400' : status === 'manual' ? 'bg-yellow-950/30 border-yellow-900 text-yellow-400' : status === 'calculated' ? 'bg-cyan-950/30 border-cyan-900 text-cyan-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}\`}>{statusText}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-neutral-950/50 p-2 rounded border border-neutral-800/50">
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Source Provider</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.source || 'Not available'}>{st.provenance?.source || 'Not available'}</div>
                               </div>
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Competition</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.competition || 'Not available'}>{st.provenance?.competition || 'Not available'}</div>
                               </div>
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Season/Timeframe</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.season || 'Not available'}>{st.provenance?.season || 'Not available'}</div>
                               </div>
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Sample Size</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.sampleSize || 'Not available'}>{st.provenance?.sampleSize || 'Not available'}</div>
                               </div>
                            </div>
                            {st.provenance?.sourceUrl && (
                              <div>
                                <label className="text-[9px] text-neutral-500 block mb-0.5">Source URL</label>
                                <a href={st.provenance.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline truncate block">
                                  {st.provenance.sourceUrl}
                                </a>
                              </div>
                            )}
                            {st.provenance?.retrievedAt && (
                              <div className="text-[9px] text-neutral-600 text-right">
                                Retrieved: {new Date(st.provenance.retrievedAt).toLocaleDateString()}
                              </div>
                            )}
                         </div>
                      )}
                    </div>
                  )
                  })}`;

if (mapRegex.test(code)) {
  code = code.replace(mapRegex, replacement);
  fs.writeFileSync(file, code);
  console.log("Stats map updated successfully!");
} else {
  console.log("Could not find stats map regex.");
}
