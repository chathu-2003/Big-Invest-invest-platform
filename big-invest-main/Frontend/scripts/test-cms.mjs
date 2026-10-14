import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../..');
const email = `admin-qa-${randomBytes(8).toString('hex')}@example.com`;
const password = randomBytes(24).toString('hex') + '!Aa1';
const fixture = action => execFileSync('php', [join(root, 'Backend/scripts/admin-browser-fixture.php')], { input: JSON.stringify({ action, email, password }), cwd: root, encoding: 'utf8', windowsHide: true });
const report = { checks: [], errors: [], screenshots: [] };
const prefix = 'cms-qa-'+email.slice(9,25)+'-';
const networkOnly=process.argv.includes('--network-only');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
mkdirSync(join(root, 'Frontend/.qa'), { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'big-invest-admin-qa-'));
const debugPort = 10000 + randomBytes(2).readUInt16BE() % 40000;
let socket, browser;
try {
  fixture('create');
  browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { const res = await fetch(`http://127.0.0.1:${debugPort}/json`, { signal: AbortSignal.timeout(1000) }); if (res.ok) { const pages = await res.json(); socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl); break; } } catch {} await pause(100); }
  assert.ok(socket); await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0; const tasks = new Map();
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id) { const task = tasks.get(message.id); tasks.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); } if (message.method === 'Runtime.exceptionThrown') report.errors.push(message.params.exceptionDetails.text); if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.errors.push(message.params.args.map(arg => arg.value || arg.description).join(' ')); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { tasks.set(++sequence, { resolve, reject }); socket.send(JSON.stringify({ id: sequence, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
  const wait = async expression => { for(let i=0;i<120;i++){if(await evaluate(expression))return;await pause(100);}throw Error(`Timed out: ${expression}`); };
  const load = async path => { await send('Page.navigate', { url: `http://127.0.0.1:5173${path}` }); await wait("document.readyState==='complete' && Boolean(document.querySelector('.bi-admin h1,.bi-admin h2,main h1'))"); };
  const fill = async (selector, value) => {await wait(`!!document.querySelector(${JSON.stringify(selector)})`);return evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);};
  const click = async selector => {await wait(`!!document.querySelector(${JSON.stringify(selector)})`);return evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);};
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await load('/admin'); await wait("Boolean(document.querySelector('.ba-login-card'))");
  await fill('input[type=email]',email); await fill('input[type=password]',password); await click('.ba-login-card button');
  await wait("Boolean(document.querySelector('.ba-stats')) && !document.querySelector('.ba-loading')");

  for (const kind of networkOnly?[]:['services','industries','insights']) {
    const slug=prefix+kind,title=slug,route='/'+kind;
    const searchContent=async()=>{await fill('[aria-label="Search content"]',title);await click('.ba-filters button');await wait(`document.querySelectorAll('tbody tr').length===1 && document.querySelector('tbody tr')?.textContent.includes(${JSON.stringify(slug)}) && !document.querySelector('.ba-loading')`);};
    await load('/admin/'+kind); await wait("!!document.querySelector('.ba-cms .ba-primary') && !document.querySelector('.ba-loading')");
    await click('.ba-cms .ba-primary'); await wait("!!document.querySelector('.ba-cms-dialog[open]')");
    await fill(kind==='industries'?'[aria-label="Name"]':'[aria-label="Title"]',title);await fill('[aria-label="Slug"]',slug);
    await fill('[aria-label="Short description / summary"]','Temporary browser QA content.');
    if(kind==='services'){
      await fill('[aria-label="Card bullet points"]','First point\n');
      assert.equal(await evaluate('document.querySelector(\'[aria-label="Card bullet points"]\').value'),'First point\n');
      await fill('[aria-label="Card bullet points"]','First point\nSecond point');
      report.checks.push('List editor preserves new lines while typing');
    }
    await fill(kind==='insights'?'[aria-label="Article body (Markdown)"]':'[aria-label="Full description"]',kind==='insights'?'## QA heading\n\n<script>window.CMS_UNSAFE=1</script>':'Temporary browser QA details.');
    if(kind==='insights'){await wait("document.querySelector('[aria-label=\"Category\"]').options.length>1");const category=await evaluate("document.querySelector('[aria-label=\"Category\"]').options[1].value");await fill('[aria-label="Category"]',category);}
    await click('.ba-cms-form .ba-cms-actions .ba-primary');await wait("!document.querySelector('.ba-cms-dialog[open]')");
    await searchContent();await click('tbody .ba-button');await wait("document.querySelector('tbody .ba-button')?.textContent==='Unpublish'");
    await load(route);await wait(`!!document.querySelector('main a[href="${route}/${slug}"]')`);report.checks.push(kind+': published content appears on public listing');
    await load(route+'/'+slug);await wait(`document.querySelector('main h1')?.textContent===${JSON.stringify(title)}`);
    if(kind==='insights'){assert.equal(await evaluate('window.CMS_UNSAFE'),undefined);assert.ok(await evaluate("document.querySelector('.prose').textContent.includes('<script>')"));report.checks.push('Article HTML input escaped as text, not executed');}
    await load('/admin/'+kind);await searchContent();await click('tbody [aria-label^="Edit "]');await wait("!!document.querySelector('.ba-cms-dialog[open]')");
    await fill(kind==='industries'?'[aria-label="Name"]':'[aria-label="Title"]',title+' edited');await click('.ba-cms-form .ba-cms-actions .ba-primary');await wait("!document.querySelector('.ba-cms-dialog[open]')");
    await load(route);await wait(`[...document.querySelectorAll('main a[href="${route}/${slug}"]')].some(a=>a.textContent.includes('edited'))`);report.checks.push(kind+': edited title updates publicly without rebuilding');
    await load('/admin/'+kind);await searchContent();await click('tbody .ba-button');await wait("document.querySelector('tbody .ba-button')?.textContent==='Publish'");
    await load(route);await wait("!!document.querySelector('main .view')");assert.equal(await evaluate(`!!document.querySelector('main a[href="${route}/${slug}"]')`),false);report.checks.push(kind+': unpublished content disappears');
    await load('/admin/'+kind);await searchContent();await click('tbody [aria-label^="Delete "]');await wait("!!document.querySelector('.ba-cms-dialog[open]')");
    await click('.ba-cms-dialog .ba-primary');await wait("!document.querySelector('.ba-cms-dialog[open]') && !document.querySelector('tbody tr') && !document.querySelector('.ba-loading')");report.checks.push(kind+': confirmation delete succeeds');
    console.log('Completed browser workflow:',kind);
  }
  await load('/');await wait("!!document.querySelector('main .home-ref')");assert.ok(await evaluate("document.querySelector('#home-title').textContent.length>0"));
  await load('/about');await wait("!!document.querySelector('main .view')");assert.ok(await evaluate("document.querySelector('main h1').textContent.length>0"));
  await load('/global-network');await wait("!!document.querySelector('main .partner')");assert.equal(await evaluate("document.querySelectorAll('main .partner').length"),4);assert.ok(await evaluate("document.body.textContent.includes('Illustrative only')"));report.checks.push('Home, About, Global Network and original partner-type disclaimers render');
  for(const [title,count] of [['Home',56],['About',154]]){
    await load('/admin/content');await wait("!!document.querySelector('tbody tr') && !document.querySelector('.ba-loading')");
    await click('[aria-label="Edit '+title+'"]');await wait("document.querySelectorAll('.ba-cms-form textarea').length>20");
    assert.equal(await evaluate("document.querySelectorAll('.ba-cms-form .ba-cms-wide small').length"),count);
    await click('.ba-cms-dialog [aria-label="Close editor"]');report.checks.push(title+': structured editor loads all '+count+' original fields');
  }
  await load('/admin/media');await wait("!!document.querySelector('[aria-label=\"Image file\"]') && !document.querySelector('.ba-loading')");
  const imagePath=join(root,'Frontend/.qa',prefix+'image.png');
  writeFileSync(imagePath,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5ioAAAAASUVORK5CYII=','base64'));
  const documentNode=await send('DOM.getDocument');const fileNode=await send('DOM.querySelector',{nodeId:documentNode.root.nodeId,selector:'input[type=file]'});
  await send('DOM.setFileInputFiles',{nodeId:fileNode.nodeId,files:[imagePath]});await fill('[aria-label="Image alternative text"]','Temporary QA image');
  await click('.ba-cms-upload .ba-primary');await wait("!!document.querySelector('.ba-cms-media img') && !document.querySelector('.ba-loading')");
  await wait("[...document.querySelectorAll('.ba-cms-media img')].every(i=>i.complete&&i.naturalWidth>0)");
  report.checks.push('Media upload and authenticated image preview work in browser');
  await load('/admin/services');await click('.ba-cms .ba-primary');await wait("!!document.querySelector('.ba-cms-form')");
  await click('.ba-cms-form .ba-cms-field .ba-button');await wait("!!document.querySelector('.ba-cms-media .ba-primary')");
  await click('.ba-cms-media .ba-primary');await wait("!!document.querySelector('.ba-cms-form .ba-cms-preview') && document.querySelector('.ba-cms-form .ba-cms-preview').naturalWidth>0");
  assert.ok(await evaluate("document.querySelector('.ba-cms-form .ba-cms-preview').src.includes('/api/admin/media/')"));
  report.checks.push('Existing media selection uses an authenticated preview in the editor');
  await click('.ba-cms-form .ba-cms-actions .ba-button');
  await load('/admin/media');await wait("!!document.querySelector('.ba-cms-media .ba-button') && !document.querySelector('.ba-loading')");
  const previousUrl=await evaluate("fetch('/api/admin/media').then(r=>r.json()).then(r=>r.data.data[0].url)");
  await click('.ba-cms-media .ba-button');
  const replaceDocument=await send('DOM.getDocument');const replaceFile=await send('DOM.querySelector',{nodeId:replaceDocument.root.nodeId,selector:'input[type=file]'});
  await send('DOM.setFileInputFiles',{nodeId:replaceFile.nodeId,files:[imagePath]});await click('.ba-cms-upload .ba-primary');
  await wait("document.querySelector('.ba-cms-upload .ba-primary')?.textContent==='Upload' && !document.querySelector('.ba-loading')");
  const replacedUrl=await evaluate("fetch('/api/admin/media').then(r=>r.json()).then(r=>r.data.data[0].url)");assert.notEqual(previousUrl,replacedUrl);
  report.checks.push('Replacing media retains its record and changes its public URL version');
  const regionSlug=prefix+'network';
  await load('/admin/network');await click('.ba-cms .ba-primary');await fill('[aria-label="Title"]',regionSlug);await fill('[aria-label="Slug"]',regionSlug);
  await fill('[aria-label="Full description"]','Temporary browser region.');await fill('[aria-label="Illustrative-region disclaimer"]','Temporary QA region disclaimer.');
  await fill('[aria-label="Publication status"]','published');await click('.ba-cms-form .ba-cms-field .ba-button');await wait("!!document.querySelector('.ba-cms-media .ba-primary')");await click('.ba-cms-media .ba-primary');await wait("document.querySelectorAll('.ba-cms-dialog[open]').length===1");
  await click('.ba-cms-form .ba-cms-actions .ba-primary');await wait("!document.querySelector('.ba-cms-dialog[open]')");
  await load('/global-network/map');await click('.chip[data-pick-region="'+regionSlug+'"]');
  await wait(`document.querySelector('[data-render="region-panel"] h3')?.textContent===${JSON.stringify(regionSlug)}`);
  assert.ok(await evaluate("document.querySelector('[data-render=\"region-panel\"]').textContent.includes('Temporary QA region disclaimer.')"));
  await wait("document.querySelector('[data-render=\"region-panel\"] img')?.naturalWidth>0");report.checks.push('Published network region displays its selected image and administrator-edited disclaimer');
  await load('/admin/network');await fill('[aria-label="Search content"]',regionSlug);await click('.ba-filters button');await wait(`document.querySelectorAll('tbody tr').length===1 && document.querySelector('tbody tr')?.textContent.includes(${JSON.stringify(regionSlug)})`);
  await click('tbody [aria-label^="Delete "]');await click('.ba-cms-dialog .ba-primary');await wait("!document.querySelector('.ba-cms-dialog[open]')");
  await load('/admin/media');await wait("!!document.querySelector('.ba-cms-media [aria-label^=\"Delete \"]') && !document.querySelector('.ba-loading')");
  await click('.ba-cms-media [aria-label^="Delete '+prefix+'"]');await wait("!!document.querySelector('.ba-cms-dialog[open]')");await click('.ba-cms-dialog .ba-primary');await wait("!document.querySelector('.ba-cms-dialog[open]') && !document.querySelector('.ba-loading')");
  report.checks.push('Unused uploaded media can be removed with confirmation');
  const screenshot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(root,'Frontend/.qa/cms-media.png'),Buffer.from(screenshot.data,'base64'));report.screenshots.push('cms-media.png');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
} finally {
  try { fixture('cleanup'); console.log('QA administrator and submissions removed.'); }
  finally { socket?.close(); browser?.kill(); writeFileSync(join(root,'Frontend/.qa/'+(networkOnly?'cms-network-verification.json':'cms-verification.json')),JSON.stringify(report,null,2)); }
}
