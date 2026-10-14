import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', middot: '·' };
const decode = text => text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, key) => key[0] === '#' ? String.fromCodePoint(key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1))) : entities[key] ?? all);
const names = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete', autofocus: 'autoFocus', novalidate: 'noValidate', srcset: 'srcSet', colspan: 'colSpan', rowspan: 'rowSpan', crossorigin: 'crossOrigin', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace' };
const camel = key => key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const voids = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);
function jsx(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '').match(/<(?:(?:"[^"]*"|'[^']*'|[^'">])*)>|[^<]+/g).map(token => {
    if (!token.startsWith('<')) return token.trim() ? `{${JSON.stringify(decode(token))}}` : '\n';
    if (token.startsWith('</')) return token;
    const tag = token.match(/^<([\w-]+)/)[1];
    const attributes = token.slice(tag.length + 1).replace(/\/?\s*>$/, '');
    const attrs = [...attributes.matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g)].map(match => {
      let key = names[match[1]] || (/^(data|aria)-/.test(match[1]) ? match[1] : camel(match[1]));
      const value = match[2] ?? match[3] ?? match[4];
      if (value === undefined) return `${key}={true}`;
      if (key === 'style') {
        const style = Object.fromEntries(value.split(';').filter(Boolean).map(rule => { const colon = rule.indexOf(':'); return [camel(rule.slice(0, colon).trim()), rule.slice(colon + 1).trim()]; }));
        return `style={${JSON.stringify(style)}}`;
      }
      if (key === 'value' && ['input', 'textarea', 'select'].includes(tag)) key = 'defaultValue';
      if (key === 'checked') key = 'defaultChecked';
      if (key === 'selected') return '';
      return `${key}={${JSON.stringify(decode(value))}}`;
    }).filter(Boolean).join(' ');
    return `<${tag}${attrs ? ' ' + attrs : ''}${voids.has(tag) || token.endsWith('/>') ? ' />' : '>'}`;
  }).join('');
}
const pages = { Home: 'home', About: 'about', Services: 'services', Industries: 'industries', GlobalNetwork: 'global-network', Insights: 'insights', Contact: 'contact' };
for (const [name, template] of Object.entries(pages)) {
  const html = readFileSync(resolve(root, `src/content/${template}.html`), 'utf8');
  writeFileSync(resolve(root, `src/pages/${name}.jsx`), `export default function ${name}() {\n  return (\n${jsx(html)}\n  );\n}\n`);
}
for (const name of ['Header', 'Footer']) {
  const html = readFileSync(resolve(root, `src/content/${name.toLowerCase()}.html`), 'utf8');
  writeFileSync(resolve(root, `src/components/${name}.jsx`), `export default function ${name}() {\n  return (<>\n${jsx(html)}\n  </>);\n}\n`);
}
let runtime = readFileSync(resolve(root, 'src/content/runtime.js'), 'utf8');
const dataEnd = runtime.indexOf('/* =========================================================\n   BIG INVEST — prototype behaviour');
if (dataEnd < 0) throw new Error('Cannot locate the content data boundary');
const data = runtime.slice(runtime.indexOf('var BI_DATA'), dataEnd);
writeFileSync(resolve(root, 'src/content/data.js'), data.replace('var BI_DATA', 'const BI_DATA') + '\nexport default BI_DATA;\n');
runtime = runtime.slice(0, runtime.indexOf('var BI_DATA')) + runtime.slice(dataEnd);
runtime = "import BI_DATA from './data';\n" + runtime;
for (const [name, list, next] of [['Service', 'SERVICES', 'Industry'], ['Industry', 'INDUSTRIES', 'Article'], ['Article', 'ARTICLES', null]]) {
  const start = runtime.indexOf(`  function render${name}(id) {`);
  const end = next ? runtime.indexOf(`  function render${next}(id) {`, start) : runtime.indexOf('  /* ---------------------------------------------------------\n     Router', start);
  runtime = runtime.slice(0, start) + `  function render${name}(id) {\n    const entry = byId(D.${list}, id);\n    return entry ? entry.title : false;\n  }\n\n` + runtime.slice(end);
}
runtime = runtime.replace('  function route() {', "  function route() {\n    window.dispatchEvent(new Event('big-invest:navigate'));");
writeFileSync(resolve(root, 'src/content/runtime.js'), runtime);
console.log('Converted seven complete page components and header/footer to JSX; extracted shared content data.');
