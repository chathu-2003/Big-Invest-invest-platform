import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Import the supplied design as trusted local markup, keeping its content and assets editable.
const source = process.argv[2];
if (!source) throw new Error('Pass the absolute path to the reference HTML.');
const html = readFileSync(source, 'utf8');
const root = resolve(import.meta.dirname, '..');
const save = (path, value) => writeFileSync(resolve(root, path), value, 'utf8');
mkdirSync(resolve(root, 'src/content'), { recursive: true });
mkdirSync(resolve(root, 'public/images/reference'), { recursive: true });
save('src/styles/reference.css', html.match(/<style>([\s\S]*?)<\/style>/)[1]);
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const imageScript = scripts.find(script => /window\.BI_IMAGES\s*=/.test(script));
const images = JSON.parse(imageScript.match(/window\.BI_IMAGES\s*=\s*([\s\S]*);/)[1]);
const assets = {};
for (const [key, data] of Object.entries(images)) {
  const [, mime, base64] = data.match(/^data:([^;]+);base64,([\s\S]+)$/);
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp' }[mime];
  if (!extension) throw new Error(`Unsupported image type: ${mime}`);
  const filename = `${key}.${extension}`;
  writeFileSync(resolve(root, 'public/images/reference', filename), Buffer.from(base64, 'base64'));
  assets[key] = `/images/reference/${filename}`;
}
save('src/content/images.json', JSON.stringify(assets, null, 2));
let body = html.match(/<body>([\s\S]*?)<script>/)[1];
body = body.replace(/<!--[\s\S]*?-->/g, '').replaceAll('href="#/', 'href="/');
const mainStart = body.indexOf('<main');
const mainOpeningEnd = body.indexOf('>', mainStart) + 1;
const mainEnd = body.indexOf('</main>', mainOpeningEnd);
save('src/content/header.html', body.slice(0, mainStart).replace('<div class="bi-page">', ''));
save('src/content/footer.html', body.slice(mainEnd + '</main>'.length).replace(/(<\/footer>)\s*<\/div>/, '$1'));
const main = body.slice(mainOpeningEnd, mainEnd);
const viewStarts = [...main.matchAll(/<div class="view[^"\n]*" data-view="([^"]+)"/g)];
for (let i = 0; i < viewStarts.length; i++) {
  const match = viewStarts[i];
  save(`src/content/${match[1]}.html`, main.slice(match.index, viewStarts[i + 1]?.index ?? main.length));
}
let runtime = scripts.find(script => script.includes('var BI_DATA'));
runtime = runtime.replace('(function () {\n  \'use strict\';\n\n  var D = BI_DATA;', "export function initializeWebsite() {\n  'use strict';\n  const controller = new AbortController();\n  const timers = new Set();\n  function listen(target, event, handler, options = {}) {\n    target.addEventListener(event, handler, { ...options, signal: controller.signal });\n  }\n  function schedule(callback, delay) {\n    const timer = window.setTimeout(() => { timers.delete(timer); callback(); }, delay);\n    timers.add(timer);\n    return timer;\n  }\n\n  var D = BI_DATA;");
runtime = runtime.replace(/(\$\('[^']+'\)|\b(?:btn|item|document|burger|window|q|search|toTop|el|form))\.addEventListener\(/g, 'listen($1, ');
runtime = runtime.replaceAll('setTimeout(', 'schedule(');
runtime = runtime.replace('window.schedule(', 'window.setTimeout(');
runtime = runtime.replaceAll('window.BI_IMAGES', 'images');
runtime = runtime.replace(/function parseHash\(\) \{[\s\S]*?\n  \}/, `function parseHash() {
    return location.pathname.split('/').filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch { return p; }
    });
  }`);
runtime = runtime.replaceAll('href="#/', 'href="/').replaceAll("location.replace('#/", "location.replace('/");
runtime = runtime.replace('listen(window, \'hashchange\', route);', "listen(window, 'popstate', route);");
runtime = runtime.replace(/var link = e\.target\.closest\('a\[href\^="#"\]'\);[\s\S]*?if \(href\.length > 1\) \{/, `var link = e.target.closest('a[href]');
      if (link) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target || link.hasAttribute('download')) return;
        var href = link.getAttribute('href');
        if (href.indexOf('/') === 0 && href.indexOf('//') !== 0) {
          e.preventDefault();
          history.pushState(null, '', href);
          route();
          return;
        }
        if (href.indexOf('#') === 0 && href.length > 1) {`);
runtime = runtime.replace(/  if \(document\.readyState === 'loading'\)[\s\S]*?\}\)\(\);\s*$/, `  if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1));
  boot();
  return function cleanup() {
    controller.abort();
    timers.forEach(timer => window.clearTimeout(timer));
    document.body.style.overflow = '';
  };
}\n`);
save('src/content/runtime.js', `import images from './images.json';\n${runtime}`);
console.log(`Imported ${viewStarts.length} page templates and ${Object.keys(assets).length} local images.`);
