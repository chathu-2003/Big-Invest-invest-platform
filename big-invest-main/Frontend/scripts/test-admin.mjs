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
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
mkdirSync(join(root, 'Frontend/.qa'), { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'big-invest-admin-qa-'));
const debugPort = 10000 + randomBytes(2).readUInt16BE() % 40000;
let socket, browser;
try {
  fixture('create');
  const csrfFailure = await fetch('http://127.0.0.1:8000/api/admin/login', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal(csrfFailure.status, 419); report.checks.push('Real HTTP login rejected without CSRF token/origin');
  assert.equal((await fetch('http://127.0.0.1:8000/api/admin/dashboard', { headers: { Accept: 'application/json' } })).status, 401);
  report.checks.push('Real HTTP guest dashboard denied');
  browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { const res = await fetch(`http://127.0.0.1:${debugPort}/json`, { signal: AbortSignal.timeout(1000) }); if (res.ok) { const pages = await res.json(); socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl); break; } } catch {} await pause(100); }
  assert.ok(socket); await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0; const tasks = new Map();
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id) { const task = tasks.get(message.id); tasks.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); } if (message.method === 'Runtime.exceptionThrown') report.errors.push(message.params.exceptionDetails.text); if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.errors.push(message.params.args.map(arg => arg.value || arg.description).join(' ')); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { tasks.set(++sequence, { resolve, reject }); socket.send(JSON.stringify({ id: sequence, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; };
  const wait = async expression => { for(let i=0;i<120;i++){if(await evaluate(expression))return;await pause(100);}throw Error(`Timed out: ${expression}`); };
  const load = async path => { await send('Page.navigate', { url: `http://127.0.0.1:5173${path}` }); await wait("document.readyState==='complete' && Boolean(document.querySelector('.bi-admin h1,.bi-admin h2,main h1'))"); };
  const fill = async (selector, value) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await load('/admin'); await wait("Boolean(document.querySelector('.ba-login-card'))");
  await fill('input[type=email]',email); await fill('input[type=password]',password); await click('.ba-login-card button');
  await wait("Boolean(document.querySelector('.ba-stats')) && !document.querySelector('.ba-loading')");
  for (const width of [1440,1024]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    console.log('Computed layout:', await evaluate("(()=>{const s=document.querySelector('.ba-sidebar'),m=document.querySelector('.ba-shell'),p=[...document.querySelectorAll('.ba-top-grid>.ba-card')];return {viewport:innerWidth,sidebarWidth:s.getBoundingClientRect().width,sidebarMinWidth:getComputedStyle(s).minWidth,mainLeft:m.getBoundingClientRect().left,mainWidth:m.getBoundingClientRect().width,panelColumns:getComputedStyle(document.querySelector('.ba-top-grid')).gridTemplateColumns,panelTops:p.map(e=>e.getBoundingClientRect().top),overflow:document.documentElement.scrollWidth>innerWidth}})()"));
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const metrics = JSON.parse(fixture('metrics'));
  const expectedDate = days => { const d = new Date(); d.setDate(d.getDate()-days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.ba-date input')].map(e=>e.value)"),[expectedDate(29),expectedDate(0)]);
  report.checks.push('Default inclusive last 30 days selected');
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.ba-stat>strong')].map(x=>Number(x.textContent.replaceAll(',','')))"), Object.values(metrics));
  report.checks.push('Real browser login with cookies/CSRF; dashboard counts match MySQL');
  await load('/admin/enquiries?q='+encodeURIComponent(email)); await wait("Boolean(document.querySelector('tbody tr'))");
  await click('tbody .ba-icon-button'); await wait("Boolean(document.querySelector('.ba-detail select'))");
  await fill('.ba-detail select','in_progress'); await click('.ba-detail .ba-primary');
  await wait("document.querySelector('tbody')?.textContent.includes('In Progress')");
  report.checks.push('Enquiry search, details and status update persisted through real API');
  await click('.ba-detail [aria-label="Close details"]');
  await load('/admin/subscribers'); await wait("Boolean(document.querySelector('.ba-filters input'))");
  await fill('.ba-filters input',email); await click('.ba-filters button'); await wait("document.querySelector('tbody')?.textContent.includes('admin-qa-')");
  const exported = await evaluate("fetch('/api/admin/subscribers/export',{headers:{Accept:'application/json'}}).then(async r=>({status:r.status,text:await r.text()}))");
  assert.equal(exported.status,200); assert.ok(exported.text.includes(email)); report.checks.push('Subscriber search and authorized CSV export');
  await load('/admin/analytics'); await wait("Boolean(document.querySelector('.ba-stats')) && !document.querySelector('.ba-loading')");
  await fill('[aria-label="Start date"]','2099-01-01'); await fill('[aria-label="End date"]','2099-01-31');
  await wait("[...document.querySelectorAll('.ba-stat>strong')].every(x=>x.textContent==='0')");
  report.checks.push('Date range filters return real zero counts for empty period');
  await load('/admin/schedule'); await wait("Boolean(document.querySelector('.ba-planned'))");
  assert.ok(await evaluate("document.querySelector('.ba-planned').textContent.includes('roadmap')")); report.checks.push('Unimplemented module has explicit Planned state');
  const routes = await evaluate("[...document.querySelectorAll('.ba-sidebar nav a')].map(a=>({path:new URL(a.href).pathname,title:a.querySelector('span').textContent}))");
  for (const route of routes) {
    await click(`.ba-sidebar nav a[href="${route.path}"]`);
    await wait(`document.querySelector('.ba-content h1')?.textContent === ${JSON.stringify(route.title)} && !document.querySelector('.ba-loading')`);
    assert.equal(await evaluate("document.querySelector('.ba-content h1').textContent"),route.title);
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  }
  report.checks.push(`All ${routes.length} admin navigation routes render without overflow`);
  await load('/admin'); await wait("Boolean(document.querySelector('.ba-stats')) && !document.querySelector('.ba-loading')");
  await click('.ba-bell'); assert.ok(await evaluate("!!document.querySelector('.ba-dropdown a[href=\"/admin/queue\"]')")); await click('.ba-bell');
  await fill('.ba-global-search input',email); await evaluate("document.querySelector('.ba-global-search').requestSubmit()");
  await wait("document.querySelector('tbody')?.textContent.includes('admin-qa-')");
  report.checks.push('Notification menu and global search retained');
  fixture('clean-records');
  await load('/admin'); await wait("Boolean(document.querySelector('.ba-stats')) && !document.querySelector('.ba-loading')");
  const actualMetrics = JSON.parse(fixture('metrics'));
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.ba-stat>strong')].map(x=>Number(x.textContent.replaceAll(',','')))"),Object.values(actualMetrics));
  await evaluate('document.fonts.ready');
  let shot = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(join(root,'Frontend/.qa/admin-desktop.png'),Buffer.from(shot.data,'base64')); report.screenshots.push('admin-desktop.png (1440×1000, actual data after fixture cleanup)');
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.ba-stat')].map(e=>Math.round(e.getBoundingClientRect().height))"),[150,150,150]);
  report.layouts = [];
  for (const width of [1600,1440,1280,1024,768,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<960});
    const layout = await evaluate("(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};return {viewport:innerWidth,sidebar:rect(document.querySelector('.ba-sidebar')),main:rect(document.querySelector('.ba-shell')),stats:[...document.querySelectorAll('.ba-stat')].map(rect),panels:[...document.querySelectorAll('.ba-top-grid>.ba-card')].map(rect),sidebarScroll:getComputedStyle(document.querySelector('.ba-sidebar nav')).overflowY}})()");
    assert.equal(layout.sidebar.width,width>960?260:240);
    assert.equal(layout.main.left,width>960?260:0);
    assert.equal(layout.sidebarScroll,'auto');
    if(width>=1280){
      assert.equal(layout.panels[0].top,layout.panels[1].top);
      assert.equal(layout.panels[0].height,layout.panels[1].height);
      assert.ok(Math.abs(layout.panels[0].width/layout.panels[1].width-1.5)<.02);
      assert.ok(layout.stats.every(r=>r.top===layout.stats[0].top && r.height===150 && Math.abs(r.width-layout.stats[0].width)<1));
    }else assert.ok(layout.panels[1].top>=layout.panels[0].top+layout.panels[0].height);
    if(width===390)assert.ok(layout.stats[1].top>=layout.stats[0].top+layout.stats[0].height);
    report.layouts.push(layout);
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false,`Dashboard overflow at ${width}`);
    assert.equal(await evaluate("(()=>{const a=document.querySelector('.ba-breadcrumb').getBoundingClientRect(),b=document.querySelector('.ba-top-actions').getBoundingClientRect();return a.right>b.left})()"),false,`Topbar overlap at ${width}`);
    assert.equal(await evaluate("(()=>{const a=document.querySelector('.ba-date').getBoundingClientRect(),b=document.querySelector('.ba-page-actions button').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top})()"),false);
    await load('/admin/enquiries'); await wait("Boolean(document.querySelector('.ba-filters')) && !document.querySelector('.ba-loading')");
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false,`Enquiry directory overflow at ${width}`);
    await load('/admin'); await wait("Boolean(document.querySelector('.ba-stats')) && !document.querySelector('.ba-loading')");
  }
  report.checks.push('Computed sidebar/main/panel/card layouts at 1600, 1440, 1280, 1024, 768 and 390px; no page overflow or control overlap');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await click('.ba-sidebar-brand button');
  assert.equal(await evaluate("Math.round(document.querySelector('.ba-sidebar').getBoundingClientRect().width)"),76); report.checks.push('Sidebar collapse');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  await click('.ba-mobile-toggle'); await wait("document.querySelector('.ba-sidebar').classList.contains('ba-mobile-open')");
  await click('.ba-mobile-shade'); await pause(350); shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(join(root,'Frontend/.qa/admin-mobile.png'),Buffer.from(shot.data,'base64')); report.screenshots.push('admin-mobile.png (390×844)'); report.checks.push('Mobile navigation and no horizontal overflow');
  await click('.ba-profile'); await click('.ba-dropdown button'); await wait("Boolean(document.querySelector('.ba-login-card'))");
  assert.equal(await evaluate("fetch('/api/admin/me',{headers:{Accept:'application/json'}}).then(r=>r.status)"),401); report.checks.push('Logout invalidates authentication');
  await load('/'); assert.equal(await evaluate("!!document.querySelector('.bi-admin')"),false); report.checks.push('Public Home remains outside admin styles/layout');
  assert.deepEqual(report.errors,[]); console.log(JSON.stringify(report,null,2));
} finally {
  try { fixture('cleanup'); console.log('QA administrator and submissions removed.'); }
  finally { socket?.close(); browser?.kill(); writeFileSync(join(root,'Frontend/.qa/admin-verification.json'),JSON.stringify(report,null,2)); }
}
