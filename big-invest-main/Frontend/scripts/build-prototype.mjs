import { mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
mkdirSync(resolve(root, 'dist'), { recursive: true });
copyFileSync(resolve(root, 'index.html'), resolve(root, 'dist/index.html'));
assert.ok(readFileSync(resolve(root, 'index.html')).equals(readFileSync(resolve(root, 'dist/index.html'))));
console.log('Built dist/index.html: byte-for-byte identical to the original prototype entry.');
