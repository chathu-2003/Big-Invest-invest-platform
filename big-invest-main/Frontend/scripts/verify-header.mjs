import { readFileSync, writeFileSync } from 'node:fs';

// Reuse the browser setup, image/font waits and cleanup from the full suite.
const source = readFileSync(new URL('./verify-react.mjs', import.meta.url), 'utf8');
const start = source.slice(0, source.indexOf("  if (!process.argv.includes('--visual-only')) {"));
const cleanup = source.slice(source.indexOf('} catch (error) {'));
const checks = String.raw`
  for (const width of [1440,1640,1920,1240,1181,1024,1000,999,768,375]) {
    await viewport(width, width === 1920 ? 1080 : 900);
    await load('/', true);
    await evaluate("window.scrollTo(0,0); const s=document.createElement('style');s.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';document.head.append(s)");
    await pause(60);
    const capture = async name => {
      const screenshot = await send('Page.captureScreenshot', {format:'png',clip:{x:0,y:0,width,height:100,scale:1}});
      writeFileSync(join(artifact,name),Buffer.from(screenshot.data,'base64'));
    };
    await capture('header-'+width+'-reference.png');
    const metrics = () => evaluate("(() => {const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return {x:r.x,y:r.y,w:r.width,h:r.height,display:c.display,font:c.fontSize}};return {header:box('.site-header'),brand:box('.site-header .brand'),nav:box('.nav-desktop'),links:box('.nav-list'),actions:box('.header-actions'),meta:box('.header-meta'),button:box('.header-cta'),burger:box('.burger'),overflow:document.documentElement.scrollWidth>innerWidth}})()");
    const reference = await metrics();
    await load('/');
    await evaluate("window.scrollTo(0,0); const s=document.createElement('style');s.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';document.head.append(s)");
    await pause(60);
    const actual = await metrics();
    assert.equal(actual.overflow,false);
    if(width>=1000){
      assert.equal(actual.nav.display,'flex');assert.equal(actual.burger.display,'none');
      assert.ok(actual.brand.x+actual.brand.w<=actual.links.x,'Logo and navigation overlap');
      assert.ok(actual.links.x+actual.links.w<=actual.actions.x,'Navigation and actions overlap');
      assert.ok(actual.actions.x+actual.actions.w<=width,'Actions overflow');
      if(width>=1440) assert.equal(actual.meta.display,'flex');
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.nav-desktop a[data-nav]')).map(e=>e.textContent.trim())"),['Home','About Us','Services','Industries','Global Network','Insights','Contact']);
      for(const name of ['services','industries','network','insights']){
        await click('[aria-controls=dd-'+name+']');
        assert.equal(await evaluate("document.querySelector('#dd-"+name+"').classList.contains('is-open')"),true);
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
        await evaluate('document.activeElement.blur()');
      }
      report.interactions.push('Desktop dropdowns and Escape at '+width);
    }else{
      assert.equal(actual.nav.display,'none');assert.notEqual(actual.burger.display,'none');
      assert.ok(actual.burger.x+actual.burger.w<=width,'Hamburger clipped');
      await click('.burger');assert.equal(await evaluate("document.querySelector('#mobile-menu').hidden"),false);
      await click('.burger');assert.equal(await evaluate("document.querySelector('#mobile-menu').hidden"),true);
      report.interactions.push('Mobile menu opens/closes at '+width);
    }
    await capture('header-'+width+'-react.png');
    report.comparisons.push({width,reference,actual});
    console.log('PASS header '+width+'px');
  }
  assert.deepEqual(report.errors,[]);
  writeFileSync(join(artifact,reportName),JSON.stringify(report,null,2));
`;
// Keep the generated runner beside the browser suite so relative paths remain valid.
const runner = new URL('./.verify-header-runner.mjs', import.meta.url);
writeFileSync(runner, start + checks + cleanup);
try {
  process.argv.push('--visual-only', '--report=header-verification.json');
  await import(runner.href);
} finally {
  const { unlinkSync } = await import('node:fs');
  unlinkSync(runner);
}
