import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import assert from 'node:assert/strict';

// Reuse the verification PNG decoder to locate differences at their source.
const verifier = readFileSync(new URL('./verify-react.mjs', import.meta.url), 'utf8');
const decoder = verifier.slice(verifier.indexOf('const paeth ='), verifier.indexOf('function pixelDifference'));
const decode = new Function('inflateSync', 'assert', `${decoder}; return decodePng;`)(inflateSync, assert);
const a = decode(readFileSync(process.argv[2]));
const b = decode(readFileSync(process.argv[3]));
assert.equal(a.width, b.width);
assert.equal(a.height, b.height);
let count = 0, left = a.width, top = a.height, right = 0, bottom = 0;
for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
  const pixel = y * a.width + x;
  if ([0, 1, 2].some(channel => Math.abs(a.pixels[pixel * a.channels + channel] - b.pixels[pixel * b.channels + channel]) > 20)) {
    count++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
}
console.log({ count, bounds: count ? { left, top, right, bottom } : null });
