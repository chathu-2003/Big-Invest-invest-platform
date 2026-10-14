import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';

// Run with the API at :8000 and Vite at :5173. Only this run's unique records are cleaned up.
const root = resolve(import.meta.dirname, '../..');
const email = `integration-${randomBytes(8).toString('hex')}@example.com`;
const profile = mkdtempSync(join(tmpdir(), 'big-invest-integration-'));
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9335', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(r => setTimeout(r, ms));
const report = { checks: [], routes: [], database: null, cleanup: null };
let socket;
const db = mode => JSON.parse(execFileSync('php', [join(root, 'Backend/scripts/check-integration-records.php'), mode, email], { cwd: root, encoding: 'utf8', windowsHide: true }));
try {
  for (let i = 0; i < 80; i++) { try { const res = await fetch('http://127.0.0.1:9335/json'); if (res.ok) { const targets = await res.json(); socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl); break; } } catch {} await pause(100); }
  assert.ok(socket, 'Chrome available');
  await new Promise(r => socket.addEventListener('open', r, { once: true }));
  let sequence = 0; const pending = new Map();
  socket.addEventListener('message', event => { const m = JSON.parse(event.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++sequence, { resolve, reject }); socket.send(JSON.stringify({ id: sequence, method, params })); });
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const wait = async expression => { for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(100); } throw Error(`Timed out: ${expression}`); };
  const load = async path => { await send('Page.navigate', { url: `http://127.0.0.1:5173${path}` }); await wait("document.readyState === 'complete' && !!document.querySelector('main h1')"); };
  const fill = async (newsletter = false) => evaluate(`(() => {
    const set = (selector, value) => { const el = document.querySelector(selector); Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
    ${newsletter ? `set('#nl-email',${JSON.stringify(email)}); document.querySelector('[data-form="newsletter"] [name="consent"]').click();` : `set('#f-name','Integration Test'); set('#f-email',${JSON.stringify(email)}); set('#f-company','Integration Ltd'); set('#f-type','partnership'); set('#f-message','Please discuss a partnership for integration verification.'); document.querySelector('#f-consent').click();`}
  })()`);
  const submit = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
  const mock = async (status, body, retry = '2', delay = 0, network = false) => evaluate(`window.__calls = []; window.fetch = async (url, options) => { window.__calls.push({url,payload:JSON.parse(options.body)}); await new Promise(r=>setTimeout(r,${delay})); ${network ? "throw new TypeError('Failed to fetch');" : `return new Response(${JSON.stringify(JSON.stringify(body))}, {status:${status},headers:{'Content-Type':'application/json','Retry-After':${JSON.stringify(retry)}}});`} };`);
  await load('/contact/partnership/sourcing');
  assert.equal(await evaluate("document.querySelector('#f-type').value"), 'partnership');
  assert.match(await evaluate("document.querySelector('#f-message').value"), /International Sourcing/);
  await evaluate("window.__calls=[]; const original=window.fetch; window.fetch=(url,options)=>{window.__calls.push({url,payload:JSON.parse(options.body)});return original(url,options);}");
  await fill(); await submit('[data-form="contact"]');
  await wait("!!document.querySelector('#contact-success')");
  const calls = await evaluate('window.__calls'); assert.equal(calls.length, 1);
  assert.deepEqual(Object.keys(calls[0].payload).sort(), ['name','email','phone','company','type','message','consent'].sort());
  assert.equal(calls[0].url, 'http://127.0.0.1:8000/api/enquiries');
  report.checks.push('Real enquiry POST, exact payload, presets and successful feedback');
  await load('/insights/newsletter'); await fill(true); await submit('[data-form="newsletter"]');
  await wait("document.querySelector('#nl-msg').textContent.includes('is subscribed')");
  await fill(true); await submit('[data-form="newsletter"]'); await wait("document.querySelector('#nl-msg').textContent.includes('is subscribed')");
  report.database = db('check'); assert.deepEqual(report.database, { enquiries: 1, newsletter_subscriptions: 1 });
  report.checks.push('Real newsletter POST and repeat: one MySQL row; enquiry MySQL row confirmed');
  for (const newsletter of [false, true]) {
    const path = newsletter ? '/insights' : '/contact'; const selector = newsletter ? '[data-form="newsletter"]' : '[data-form="contact"]';
    const feedback = newsletter ? '#nl-msg' : '#form-summary'; const button = `${selector} button[type="submit"]`;
    await load(path); await mock(201, {success:true}, '2', 300); await fill(newsletter);
    await submit(selector); await submit(selector); await pause(500);
    assert.equal(await evaluate('window.__calls.length'), 1); report.checks.push(`${path}: pending duplicate prevented`);
    await load(path); await mock(422, {success:false,message:'Invalid',errors:{email:['Server email validation message']}}); await fill(newsletter); await submit(selector);
    await wait(`document.querySelector('${feedback}').textContent.includes('Server email validation message')`);
    assert.equal(await evaluate(`document.querySelector('${newsletter ? '#nl-email' : '#f-email'}').getAttribute('aria-invalid')`), 'true');
    assert.equal(await evaluate(`document.querySelector('${newsletter ? '#nl-email' : '#f-email'}').value`), email);
    report.checks.push(`${path}: 422 field feedback and values retained`);
    await load(path); await mock(429, {success:false}, '2'); await fill(newsletter); await submit(selector);
    await wait(`document.querySelector('${button}').disabled && document.querySelector('${feedback}').textContent.includes('Too many')`);
    await submit(selector); assert.equal(await evaluate('window.__calls.length'),1);
    await wait(`!document.querySelector('${button}').disabled`);
    report.checks.push(`${path}: 429 Retry-After cooldown prevents requests and expires`);
    for (const network of [false,true]) {
      await load(path); await mock(500, {message:'private'}, '2', 0, network); await fill(newsletter); await submit(selector);
      await wait(`document.querySelector('${feedback}').textContent.includes('${network ? 'Unable to connect' : 'temporarily unavailable'}')`);
      assert.equal(await evaluate(`document.querySelector('${newsletter ? '#nl-email' : '#f-email'}').value`),email);
      assert.equal(await evaluate("!!document.querySelector('#contact-success')"),false);
      report.checks.push(`${path}: ${network ? 'network' : '500'} failure, no false success`);
    }
  }
  for (const path of ['/', '/about', '/services', '/services/sourcing', '/industries', '/industries/pharmaceuticals', '/global-network', '/global-network/map', '/insights', '/insights/category/logistics', '/insights/five-questions-new-market', '/contact', '/contact/partnership', '/contact/industry/pharmaceuticals', '/index.html', '/missing']) {
    await load(path); report.routes.push(path);
  }
  report.checks.push('All route patterns rendered');
  console.log(JSON.stringify(report,null,2));
} finally {
  try {
    report.cleanup = db('cleanup');
    assert.deepEqual(db('check'), { enquiries: 0, newsletter_subscriptions: 0 });
    mkdirSync(join(root,'Frontend/.qa'),{recursive:true});
    writeFileSync(join(root,'Frontend/.qa/form-integration.json'),JSON.stringify(report,null,2));
    console.log('Unique integration test records removed; existing records retained.');
  } finally { socket?.close(); browser.kill(); }
}
