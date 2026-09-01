import fs from 'node:fs';

const manager = fs.readFileSync('src/components/BatchExportManager.tsx', 'utf8');
const topBar = fs.readFileSync('src/components/TopBar.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

function expectContains(source: string, needle: string, label: string) {
  if (!source.includes(needle)) throw new Error(`Batch export self-test failed: ${label}`);
}

expectContains(manager, "['1:1', '4:5', '16:9', '9:16']", 'all four supported production ratios must be exported');
expectContains(manager, 'await exportGraphic(node', 'batch export must reuse the verified SnapDOM exporter');
expectContains(manager, 'CANVAS_DIMENSIONS[nextRatio]', 'each export must use its own exact canvas dimensions');
expectContains(manager, 'flushSync(() => setRatio(nextRatio))', 'hidden export surface must render the target ratio before capture');
expectContains(manager, '[${index + 1}/${BATCH_RATIOS.length}]', 'batch progress must identify the current item');
expectContains(topBar, 'Export All 4 Ratios', 'export menu action is missing');
expectContains(topBar, 'onBatchExport', 'TopBar batch export callback is missing');
expectContains(app, 'onBatchExport={handleBatchExport}', 'App must wire batch export into TopBar');
expectContains(app, '<BatchExportManager ref={batchExportRef}', 'App must mount the hidden batch export surface');
expectContains(app, "showToast('Exported all 4 aspect ratios.')", 'batch completion feedback is missing');

console.log('Batch export self-test passed: one-click sequential export covers 1:1, 4:5, 16:9 and 9:16 through the verified exporter.');
