const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'services', 'playerPack.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /export function parsePlayerPack\(jsonString: string\): \{ data: PlayerPackV1 \| null; error: string \| null; unknownKeys: string\[\] \} \{[\s\S]*?\}\s*\}/,
  `import { PlayerPackSchema } from './schema';

export function parsePlayerPack(jsonString: string): { data: PlayerPackV1 | null; error: string | null; unknownKeys: string[] } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed) {
      return { data: null, error: 'Empty JSON.', unknownKeys: [] };
    }
    
    // Zod validation
    const result = PlayerPackSchema.safeParse(parsed);
    if (!result.success) {
      const errorMessages = result.error.errors.map(e => \`\${e.path.join('.')}: \${e.message}\`).join(', ');
      return { data: null, error: \`Validation failed: \${errorMessages}\`, unknownKeys: [] };
    }

    if (parsed.schemaVersion !== 'player-pack-v1') {
      return { data: null, error: 'Unsupported schema version.', unknownKeys: [] };
    }

    // Identify unknown keys at the top level
    const knownKeys = ['schemaVersion', 'player', 'context', 'stats', 'scoutingSummary', 'tacticalProfile', 'strengths', 'developmentAreas', 'metadata'];
    const unknownKeys = Object.keys(parsed).filter(k => !knownKeys.includes(k));

    return { data: result.data as PlayerPackV1, error: null, unknownKeys };
  } catch (e: any) {
    return { data: null, error: e.message || 'Failed to parse JSON file.', unknownKeys: [] };
  }
}`
);

fs.writeFileSync(file, code);
