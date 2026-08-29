const fs = require('fs');

const file = 'src/App.tsx';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(needle, replacement, label) {
  if (!source.includes(needle)) throw new Error(`Batch export patch failed: ${label}`);
  source = source.replace(needle, replacement);
}

replaceOnce(
  "import { QualityCheckModal } from './components/QualityCheckModal';",
  "import { QualityCheckModal } from './components/QualityCheckModal';\nimport { BatchExportManager, BatchExportManagerHandle } from './components/BatchExportManager';",
  'BatchExportManager import anchor missing',
);

replaceOnce(
  "  const exportElementRef = useRef<HTMLDivElement | null>(null);",
  "  const exportElementRef = useRef<HTMLDivElement | null>(null);\n  const batchExportRef = useRef<BatchExportManagerHandle | null>(null);",
  'export ref anchor missing',
);

replaceOnce(
  "  const handleCopyClipboard = async () => {",
  `  const handleBatchExport = async (scaleMultiplier: 1 | 2 | 4, format: ExportFormat) => {\n    if (!batchExportRef.current) return;\n    try {\n      setIsExporting(true);\n      setExportStatus('Preparing multi-ratio export...');\n      await batchExportRef.current.exportAllRatios({\n        scaleMultiplier,\n        format,\n        onProgress: (status) => setExportStatus(status),\n      });\n      showToast('Exported all 4 aspect ratios.');\n    } catch (err: any) {\n      alert(err.message || 'Batch export error');\n    } finally {\n      setIsExporting(false);\n      setExportStatus('');\n    }\n  };\n\n  const handleCopyClipboard = async () => {`,
  'copy handler anchor missing',
);

replaceOnce(
  "        onExport={handleExportGraphic}\n        onCopyClipboard={handleCopyClipboard}",
  "        onExport={handleExportGraphic}\n        onBatchExport={handleBatchExport}\n        onCopyClipboard={handleCopyClipboard}",
  'TopBar export props anchor missing',
);

replaceOnce(
  "      </div>\n    </div>\n  );\n}",
  "      </div>\n\n      <BatchExportManager ref={batchExportRef} project={currentProject} />\n    </div>\n  );\n}",
  'app closing anchor missing',
);

fs.writeFileSync(file, source, 'utf8');
console.log('Batch export manager wired into App.tsx');
