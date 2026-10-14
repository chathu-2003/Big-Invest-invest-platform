import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { inflateSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const artifact = join(root, '.qa');
const auditOnly = process.argv.includes('--audit-only');
const reportName = process.argv.find(value => value.startsWith('--report='))?.slice(9) || (process.argv.includes('--visual-only') ? 'visual-recheck.json' : 'react-verification.json');
mkdirSync(artifact, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'big-invest-react-qa-'));
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], { cwd: root, windowsHide: true, stdio: 'pipe' });
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { routes: [], interactions: [], responsive: [], comparisons: [], errors: [] };
const dataText = readFileSync(join(root, 'src/data/prototype.js'), 'utf8');
const data = JSON.parse(dataText.slice(dataText.indexOf('{'), dataText.lastIndexOf('}') + 1));
const paeth = (a, b, c) => { const p = a + b - c; const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
function decodePng(buffer) {
  let position = 8, width, height, channels;
  const chunks = [];
  while (position < buffer.length) {
    const length = buffer.readUInt32BE(position), type = buffer.toString('ascii', position + 4, position + 8), content = buffer.subarray(position + 8, position + 8 + length);
    if (type === 'IHDR') { width = content.readUInt32BE(0); height = content.readUInt32BE(4); assert.equal(content[8], 8); channels = content[9] === 6 ? 4 : 3; }
    if (type === 'IDAT') chunks.push(content);
    position += length + 12;
  }
  const source = inflateSync(Buffer.concat(chunks)), stride = width * channels, pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = source[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0, above = y ? pixels[(y - 1) * stride + x] : 0, corner = y && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      const adjustment = filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : filter === 4 ? paeth(left, above, corner) : 0;
      pixels[y * stride + x] = (source[y * (stride + 1) + x + 1] + adjustment) & 255;
    }
  }
  return { width, height, channels, pixels };
}
function pixelDifference(first, second) {
  const a = decodePng(first), b = decodePng(second);
  if (auditOnly && (a.width !== b.width || a.height !== b.height)) return null;
  assert.equal(a.width, b.width); assert.equal(a.height, b.height);
  let different = 0;
  for (let i = 0; i < a.width * a.height; i++) {
    let distance = 0;
    for (let channel = 0; channel < 3; channel++) distance = Math.max(distance, Math.abs(a.pixels[i * a.channels + channel] - b.pixels[i * b.channels + channel]));
    if (distance > 20) different++;
  }
  return Number((100 * different / (a.width * a.height)).toFixed(3));
}
async function ready(url) {
  for (let i = 0; i < 100; i++) { try { const response = await fetch(url); if (response.ok) return response; } catch { /* starting */ } await pause(200); }
  throw new Error(`Cannot reach ${url}`);
}
let socket;
try {
  await ready('http://127.0.0.1:5174');
  const targets = await (await ready('http://127.0.0.1:9333/json')).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') report.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++sequence, { resolve, reject }); socket.send(JSON.stringify({ id: sequence, method, params })); });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await send('Runtime.enable'); await send('Page.enable');
  const viewport = async (width, height = 1028) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const load = async (path, reference = false) => {
    await send('Page.navigate', { url: reference ? `http://127.0.0.1:5174/reference/big-invest-website_2.html#${path}` : `http://127.0.0.1:5174${path}` });
    for (let i = 0; i < 80; i++) {
      if (await evaluate("document.readyState === 'complete' && Boolean(document.querySelector('main .view:not([hidden]) h1'))")) break;
      await pause(100);
    }
    await evaluate('document.fonts.ready');
    await evaluate('Promise.all(Array.from(document.images).map(img => img.decode().catch(() => {})))');
    await pause(100);
  };
  const click = async selector => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await pause(70); };
  const fill = async (selector, value) => {
    await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); const proto = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await pause(40);
  };
  const reactNavigate = async path => { await evaluate(`history.pushState(null, '', ${JSON.stringify(path)}); window.dispatchEvent(new PopStateEvent('popstate'));`); await pause(250); };
  if (!process.argv.includes('--visual-only')) {
  await viewport(1440);
  await load('/');
  assert.ok(await evaluate("Boolean(document.querySelector('#root main'))"), 'React must render the website');
  const original = readFileSync(join(root, 'reference/big-invest-website_2.html'), 'utf8');
  assert.ok(readFileSync(join(root, 'src/styles/reference.css'), 'utf8').includes('--bi-yellow'), 'Prototype design tokens must remain present');
  for (const [path, view] of [['/', 'home'], ['/about', 'about'], ['/services', 'services'], ['/industries', 'industries'], ['/global-network', 'global-network'], ['/insights', 'insights'], ['/contact', 'contact']]) {
    await click(`.nav-desktop a[data-nav][href="${path}"]`);
    assert.equal(await evaluate('location.pathname'), path);
    assert.equal(await evaluate("document.querySelector('main .view').dataset.view"), view);
    assert.equal(await evaluate("document.querySelector('.nav-desktop a[aria-current=page]').getAttribute('href')"), path);
    report.routes.push(path);
  }
  const details = [...data.SERVICES.map(item => ['/services/' + item.id, item.title, 'service']), ...data.INDUSTRIES.map(item => ['/industries/' + item.id, item.title, 'industry']), ...data.ARTICLES.map(item => ['/insights/' + item.id, item.title, 'article'])];
  for (const [path, title, view] of details) {
    await reactNavigate(path);
    assert.equal(await evaluate("document.querySelector('main h1').textContent"), title);
    assert.equal(await evaluate("document.querySelector('main .view').dataset.view"), view);
    report.routes.push(path);
  }
  console.log(`PASS: seven top links and ${details.length} distinct detail routes.`);
  for (const section of ['overview', 'map', 'partners', 'sourcing']) {
    const path = '/global-network/' + section;
    await load(path);
    assert.ok(await evaluate(`Boolean(document.getElementById('net-${section}'))`)); report.routes.push(path);
  }
  for (const category of data.CATEGORIES.filter(item => item.id !== 'all')) {
    const path = '/insights/category/' + category.id;
    await load(path);
    assert.equal(await evaluate("document.querySelector('[data-ins-cat][aria-pressed=true]').dataset.insCat"), category.id);
    report.routes.push(path);
  }
  await load('/insights/newsletter'); report.routes.push('/insights/newsletter');
  await fill('#insight-q', 'zzzz-no-match');
  assert.ok(await evaluate("Boolean(document.querySelector('[data-clear-insights]'))"));
  await click('[data-clear-insights]');
  assert.equal(await evaluate("document.querySelector('#insight-q').value"), '');
  await click('[data-ins-cat=logistics]');
  assert.equal(await evaluate("document.querySelector('[data-render=insight-grid]').children.length"), data.ARTICLES.filter(item => item.cat === 'logistics').length);
  await fill('#nl-email', 'bad'); await click('form[data-form=newsletter] button[type=submit]');
  assert.ok(await evaluate("document.querySelector('#nl-email').getAttribute('aria-invalid') === 'true'"));
  await fill('#nl-email', 'reader@example.com'); await click('form[data-form=newsletter] input[type=checkbox]'); await click('form[data-form=newsletter] button[type=submit]');
  assert.ok(await evaluate("document.querySelector('#nl-msg').textContent.includes('reader@example.com')"));
  report.interactions.push('Insights search, empty state, reset, category filtering; newsletter invalid/valid demo feedback');
  await load('/industries');
  for (const group of data.IND_GROUPS) {
    await click(`[data-ind-group=${group.id}]`);
    assert.equal(await evaluate("document.querySelector('[data-render=industry-grid]').children.length"), group.id === 'all' ? data.INDUSTRIES.length : data.INDUSTRIES.filter(item => item.group === group.id).length);
  }
  report.interactions.push('All industry directory filters');
  await load('/global-network/map');
  for (const region of data.REGIONS) {
    await click(`.chip[data-pick-region=${region.id}]`);
    assert.equal(await evaluate("document.querySelector('[data-render=region-panel] h3').textContent"), region.name);
    assert.equal(await evaluate("document.querySelectorAll('[data-map=interactive] .route.is-on').length"), 1);
  }
  await click('.map-tag[data-pick-region=europe]');
  assert.equal(await evaluate("document.querySelector('[data-render=region-panel] h3').textContent"), 'Europe');
  report.interactions.push('All map region chips, SVG highlight, map-tag selection');
  await load('/contact/sourcing/medical-equipment'); report.routes.push('/contact/sourcing/medical-equipment');
  assert.equal(await evaluate("document.querySelector('#f-type').value"), 'sourcing');
  assert.ok(await evaluate("document.querySelector('#f-message').value.includes('Medical Equipment')"));
  await click('form[data-form=contact] button[type=submit]');
  assert.ok(await evaluate("document.querySelectorAll('[aria-invalid=true]').length >= 4"));
  for (const [field, value] of Object.entries({ name: 'Test User', email: 'test@example.com', company: 'Test Company', phone: '+94 771234567', message: 'Please help us explore international sourcing opportunities.' })) await fill('#f-' + field, value);
  await click('#f-consent'); await click('form[data-form=contact] button[type=submit]'); await pause(1000);
  assert.ok(await evaluate("document.querySelector('#contact-success').textContent.includes('has not been sent or stored')"));
  await click('[data-new-enquiry]');
  assert.equal(await evaluate("document.querySelector('#f-name').value"), '');
  await click('[data-action=preset-partnership]');
  assert.equal(await evaluate("document.querySelector('#f-type').value"), 'partnership'); report.routes.push('/contact/partnership');
  report.interactions.push('Enquiry presets, required validation, phone/email/message validation, consent, demo success and reset');
  for (const kind of ['privacy', 'terms']) {
    await click(`[data-legal=${kind}]`);
    assert.equal(await evaluate("document.querySelector('#legal-modal').hidden"), false);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    assert.equal(await evaluate("document.querySelector('#legal-modal').hidden"), true);
  }
  await click('.site-footer [data-social=linkedin]');
  assert.ok(await evaluate("document.querySelector('.site-footer .social-note').textContent.includes('LinkedIn')"));
  report.interactions.push('Both legal dialogs, Escape/focus restoration, social feedback');
  await load('/');
  for (const name of ['services', 'industries', 'network', 'insights']) {
    await click(`[aria-controls=dd-${name}]`);
    assert.equal(await evaluate(`document.querySelector('[aria-controls=dd-${name}]').getAttribute('aria-expanded')`), 'true');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    assert.equal(await evaluate(`document.querySelector('[aria-controls=dd-${name}]').getAttribute('aria-expanded')`), 'false');
  }
  report.interactions.push('All desktop dropdown toggles and keyboard closing');
  await viewport(390); await load('/');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.nav-desktop')).display"), 'none');
  await click('.burger'); assert.equal(await evaluate("document.querySelector('#mobile-menu').hidden"), false);
  for (const name of ['services', 'industries']) {
    await click(`[aria-controls=m-sub-${name}]`);
    assert.equal(await evaluate(`document.querySelector('#m-sub-${name}').hidden`), false);
  }
  await click('#mobile-menu a[href="/services/logistics"]');
  assert.equal(await evaluate('location.pathname'), '/services/logistics');
  assert.equal(await evaluate("document.querySelector('#mobile-menu').hidden"), true);
  await evaluate('history.back()'); await pause(150); assert.equal(await evaluate('location.pathname'), '/');
  await load('/#/about'); assert.equal(await evaluate('location.pathname'), '/about');
  await load('/no-such-page'); assert.ok(await evaluate("document.querySelector('main h1').textContent.includes('find that page')"));
  report.interactions.push('Mobile hamburger, both nested groups, detail navigation, menu close, browser Back, legacy hash migration, 404');
  console.log(`PASS: ${report.routes.length} route checks and all primary React interactions.`);
  }
  const sizes = process.argv.includes('--specified-viewports') ? [[1640,900],[1440,900],[1920,1080],[1024,768],[375,812]] : [1896,1440,1280,1024,768,430,375,320].map(width => [width,1028]);
  const requestedPath = process.argv.find(value => value.startsWith('--path='))?.slice(7);
  const pages = requestedPath ? [requestedPath] : ['/', '/about', '/services', '/industries', '/global-network', '/insights', '/contact', ...data.SERVICES.map(item => '/services/' + item.id), ...data.INDUSTRIES.map(item => '/industries/' + item.id), ...data.ARTICLES.map(item => '/insights/' + item.id)];
  const screenshot = async () => {
    const { cssContentSize } = await send('Page.getLayoutMetrics');
    return Buffer.from((await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 } })).data, 'base64');
  };
  const snapshot = async () => {
    await evaluate("window.scrollTo({ top: 0, behavior: 'instant' }); document.activeElement?.blur(); const style = document.createElement('style'); style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'; document.head.append(style);");
    await pause(60);
    return evaluate("({text:document.querySelector('main').innerText.replace(/\\s/g,''), overflow:document.documentElement.scrollWidth > innerWidth, brokenImages:Array.from(document.images).filter(img => img.complete && !img.naturalWidth && img.getAttribute('src')).map(img => img.src), boxes:Array.from(document.querySelectorAll('.site-header,main h1,main section,.site-footer')).filter(el => el.getBoundingClientRect().height).map(el => {const r=el.getBoundingClientRect(); return {tag:el.tagName,class:el.className,x:r.x,y:r.y,w:r.width,h:r.height};})})");
  };
  for (const [width, height] of sizes) {
    await viewport(width, height);
    for (const path of pages) {
      await load(path, true);
      const expected = await snapshot();
      const capture = true;
      const referencePng = capture ? await screenshot() : null;
      await load(path);
      const actual = await snapshot();
      assert.deepEqual(actual.brokenImages, [], `${path} @ ${width}: images`);
      assert.equal(actual.overflow, false, `${path} @ ${width}: overflow`);
      assert.equal(actual.text, expected.text, `${path} @ ${width}: original content mismatch`);
      const boxDifference = Math.max(0, ...actual.boxes.flatMap((box, index) => ['x', 'y', 'w', 'h'].map(key => Math.abs(box[key] - (expected.boxes[index]?.[key] ?? 0)))));
      if (!auditOnly) assert.ok(boxDifference <= 1, `${path} @ ${width}: original layout mismatch (${boxDifference}px)`);
      const layout = path === '/' ? await evaluate(`(() => { const css = selector => getComputedStyle(document.querySelector(selector)); const rect = selector => { const r=document.querySelector(selector).getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; }; return {viewport:{width:innerWidth,height:innerHeight},desktopNav:css('.nav-desktop').display,burger:css('.burger').display,header:rect('.site-header'),hero:rect('.hero'),headingFont:css('.hero h1').fontSize,heroButton:rect('.hero .btn'),valuesColumns:css('.values').gridTemplateColumns,values:Array.from(document.querySelectorAll('.values > *')).map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})),industryCards:Array.from(document.querySelectorAll('.ind-cards > *')).map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})),industries:rect('.ref-industries')}; })()`) : null;
      if (width >= 1440 && path === '/') {
        assert.equal(layout.desktopNav, 'flex'); assert.equal(layout.burger, 'none');
        assert.equal(new Set(layout.values.map(item=>item.y)).size,1);
        assert.equal(layout.industryCards.length,6); assert.equal(new Set(layout.industryCards.map(item=>item.y)).size,1);
        assert.ok(layout.hero.height < 400); assert.ok(layout.heroButton.height <= 42);
      }
      report.responsive.push({ width, path, boxDifference: Number(boxDifference.toFixed(3)), noOverflow: true, noBrokenImages: true });
      if (capture) {
        const actualPng = await screenshot();
        const slug = path === '/' ? 'home' : path.slice(1).replaceAll('/', '-');
        writeFileSync(join(artifact, `${slug}-${width}-reference.png`), referencePng);
        writeFileSync(join(artifact, `${slug}-${width}-react.png`), actualPng);
        const changedPixelPercent = pixelDifference(referencePng, actualPng);
        if (!auditOnly) assert.ok(changedPixelPercent <= 0.2, `${path} @ ${width}: screenshot mismatch (${changedPixelPercent}%)`);
        report.comparisons.push({ width, height, path, changedPixelPercent, boxDifference: Number(boxDifference.toFixed(3)), layout });
      }
    }
    console.log(`Compared ${pages.length} full pages at ${width}px against the original prototype.`);
    writeFileSync(join(artifact, reportName), JSON.stringify(report, null, 2));
  }
  assert.deepEqual(report.errors, []);
  writeFileSync(join(artifact, reportName), JSON.stringify(report, null, 2));
  console.log(`PASS: ${report.routes.length} routes, ${report.interactions.length} interaction groups, ${report.responsive.length} full-page comparisons and browser console checks.`);
} catch (error) {
  report.failure = String(error.stack || error);
  writeFileSync(join(artifact, reportName), JSON.stringify(report, null, 2));
  throw error;
} finally {
  socket?.close(); browser.kill(); server.kill(); await pause(700);
  if (profile.startsWith(join(tmpdir(), 'big-invest-react-qa-'))) { try { rmSync(profile, { recursive: true, force: true, maxRetries: 2 }); } catch { /* browser handles may close later */ } }
  setTimeout(() => process.exit(process.exitCode || 0), 1500).unref();
}

