import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'dist');
const destDir = path.join(rootDir, 'examples/native/lib/wiselayer');

if (!existsSync(srcDir)) {
  console.error('copy-native-lib: dist/ not found, run build first');
  process.exit(1);
}

rmSync(destDir, { recursive: true, force: true });
mkdirSync(path.dirname(destDir), { recursive: true });
cpSync(srcDir, destDir, { recursive: true });

console.log(`copy-native-lib: ${srcDir} -> ${destDir}`);
