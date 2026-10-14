import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const reference = readFileSync(process.argv[2], 'utf8');
const save = (path, text) => writeFileSync(resolve(root, path), text, 'utf8');
for (const dir of ['reference', 'src/data', 'src/components/common', 'src/components/network', 'src/components/forms', 'src/components/layout']) mkdirSync(resolve(root, dir), { recursive: true });
save('reference/big-invest-website_2.html', reference);
const css = reference.match(/<style>([\s\S]*?)<\/style>/)[1];
save('src/styles/reference.css', css);
const scripts = [...reference.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const script = scripts.find(text => text.includes('var BI_DATA'));
const dataCode = script.slice(script.indexOf('var BI_DATA'), script.indexOf('/* =========================================================\n   BIG INVEST — prototype behaviour'));
const sandbox = {};
vm.runInNewContext(dataCode, sandbox);
save('src/data/prototype.js', `// Exact content from the supplied prototype.\nexport default ${JSON.stringify(sandbox.BI_DATA, null, 2)};\n`);
for (const [file, keys] of Object.entries({ services: ['SERVICES', 'STEPS'], industries: ['INDUSTRIES', 'IND_GROUPS'], articles: ['ARTICLES', 'CATEGORIES'], network: ['HUB', 'REGIONS', 'SOURCING_STEPS'] })) {
  save(`src/data/${file}.js`, `import data from './prototype';\n${keys.map(key => `export const ${key} = data.${key};`).join('\n')}\n`);
}
const imageScript = scripts.find(text => /window\.BI_IMAGES\s*=/.test(text));
const imageData = JSON.parse(imageScript.match(/window\.BI_IMAGES\s*=\s*([\s\S]*);/)[1]);
mkdirSync(resolve(root, 'public/images/reference'), { recursive: true });
const images = {};
for (const [name, uri] of Object.entries(imageData)) {
  const [, type, content] = uri.match(/^data:([^;]+);base64,([\s\S]+)$/);
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp' }[type];
  const filename = `${name}.${extension}`;
  writeFileSync(resolve(root, `public/images/reference/${filename}`), Buffer.from(content, 'base64'));
  images[name] = `/images/reference/${filename}`;
}
save('src/data/images.js', `export default ${JSON.stringify(images, null, 2)};\n`);
const functionSource = name => {
  const start = script.indexOf(`  function ${name}(`);
  if (start < 0) throw new Error(`Missing renderer: ${name}`);
  const end = script.indexOf('\n  }', start) + 4;
  return script.slice(start, end);
};
let pure = `import D from '../data/prototype';\nimport images from '../data/images';\nconst IMG = k => images[k] || '';\nconst ico = (name, cls = '') => '<svg class="i ' + cls + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';\nconst esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));\nconst byId = (list, id) => list.find(item => item.id === id);\nconst catLabel = id => byId(D.CATEGORIES, id)?.label || id;\nconst arrow = ico('arrow-right');\nconst tbc = text => '<p class="tbc">' + ico('info') + esc(text) + '</p>';\n`;
for (const name of ['statsHTML', 'stepsHTML', 'pageHero', 'solidMapHTML', 'mapHTML', 'postCard', 'renderService', 'renderIndustry', 'renderArticle']) {
  let fn = functionSource(name);
  if (name.startsWith('render')) fn = fn.replace(/    \$\('[^']+'\)\.innerHTML = html;\s*return [^;]+;/, '    return html;');
  pure += fn + '\n';
}
pure = pure.replaceAll('#/', '/');
pure += '\nexport { statsHTML, stepsHTML, mapHTML, renderService, renderIndustry, renderArticle };\n';
save('src/components/prototypeMarkup.js', pure);

// Convert every original static node to JSX, retaining the exact DOM structure.
const body = reference.match(/<body>([\s\S]*?)<script>/)[1].replace(/<!--[\s\S]*?-->/g, '');
const tokens = body.match(/<(?:(?:"[^"]*"|'[^']*'|[^'">])*)>|[^<]+/g);
const tree = { tag: 'root', children: [] };
const stack = [tree];
const voids = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);
for (const token of tokens) {
  if (!token.startsWith('<')) { stack.at(-1).children.push({ text: token }); continue; }
  if (token.startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
  const tag = token.match(/^<([\w-]+)/)[1];
  const attrs = Object.fromEntries([...token.slice(tag.length + 1).replace(/\/?\s*>$/, '').matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g)].map(match => [match[1], match[2] ?? match[3] ?? match[4] ?? true]));
  const node = { tag, attrs, children: [] };
  stack.at(-1).children.push(node);
  if (!voids.has(tag) && !token.endsWith('/>')) stack.push(node);
}
const all = [];
const visit = node => { all.push(node); node.children?.forEach(visit); };
visit(tree);
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', middot: '·', reg: '®' };
const decode = text => text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, key) => key[0] === '#' ? String.fromCodePoint(key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1))) : entities[key] ?? all);
const names = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete', autofocus: 'autoFocus', novalidate: 'noValidate', srcset: 'srcSet', colspan: 'colSpan', rowspan: 'rowSpan', crossorigin: 'crossOrigin' };
const camel = key => key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
let scope = '';
const expression = value => ({ expression: value });
function convert(node) {
  if (node.text !== undefined) return node.text.trim() ? `{${JSON.stringify(decode(node.text))}}` : '\n';
  const attrs = { ...node.attrs };
  let tag = node.tag;
  let children = null;
  if (attrs['data-view']) delete attrs.hidden;
  if (attrs['data-img']) attrs.src = expression(`images[${JSON.stringify(attrs['data-img'])}]`);
  if (tag === 'a' && typeof attrs.href === 'string' && attrs.href.startsWith('#/')) { tag = 'Link'; attrs.to = attrs.href.slice(1); delete attrs.href; }
  if (scope === 'header') {
    if (attrs['data-nav']) {
      attrs.class = expression(`${JSON.stringify(attrs.class)} + (isActive(${JSON.stringify(attrs['data-nav'])}) ? ' is-active' : '')`);
      attrs['aria-current'] = expression(`isActive(${JSON.stringify(attrs['data-nav'])}) ? 'page' : undefined`);
    }
    if (attrs.class === 'dd-toggle') {
      const id = attrs['aria-controls']; attrs['aria-expanded'] = expression(`dropdown === ${JSON.stringify(id)}`);
      attrs.onClick = expression(`event => { event.stopPropagation(); setDropdown(dropdown === ${JSON.stringify(id)} ? null : ${JSON.stringify(id)}); }`);
    }
    if (typeof attrs.class === 'string' && attrs.class.split(' ').includes('dd')) attrs.class = expression(`${JSON.stringify(attrs.class)} + (dropdown === ${JSON.stringify(attrs.id)} ? ' is-open' : '')`);
    if (attrs.class === 'nav-item has-dd') {
      attrs.onMouseLeave = expression('() => setDropdown(null)');
      attrs.onBlur = expression("event => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null); }");
    }
    if (attrs.class === 'burger') { attrs['aria-expanded'] = expression('mobileOpen'); attrs['aria-label'] = expression("mobileOpen ? 'Close menu' : 'Open menu'"); attrs.onClick = expression('() => setMobileOpen(!mobileOpen)'); }
    if (attrs.id === 'mobile-menu') attrs.hidden = expression('!mobileOpen');
    if (attrs.class === 'm-exp') {
      const id = attrs['aria-controls']; attrs['aria-expanded'] = expression(`Boolean(groups[${JSON.stringify(id)}])`);
      attrs.onClick = expression(`() => setGroups(previous => ({ ...previous, ${JSON.stringify(id)}: !previous[${JSON.stringify(id)}] }))`);
    }
    if (typeof attrs.class === 'string' && attrs.class.split(' ').includes('m-sub')) attrs.hidden = expression(`!groups[${JSON.stringify(attrs.id)}]`);
    if (attrs.id === 'top') attrs.class = expression("'site-header' + (scrolled ? ' is-scrolled' : '')");
  }
  if (attrs['data-legal']) attrs.onClick = expression(`() => openLegal(${JSON.stringify(attrs['data-legal'])})`);
  if (attrs['data-year'] !== undefined) children = '{new Date().getFullYear()}';
  if (attrs['data-action'] === 'preset-partnership') attrs.onClick = expression("() => navigate('/contact/partnership')");
  if (typeof attrs.class === 'string' && attrs.class.includes('social-note')) children = `<SocialNote scope="${scope}" />`;
  const slot = attrs['data-render'];
  const slots = {
    stats: '<Statistics />', steps: '<ProcessSteps />', 'sourcing-steps': '<ProcessSteps sourcing />',
    map: `<WorldMap mode="${attrs['data-map']}"${attrs['data-map'] === 'interactive' ? ' active={region} onSelect={setRegion}' : ''} />`,
    'home-industries': '<IndustryCards home />', 'services-grid': '<ServiceCards />',
    socials: `<SocialButtons scope="${scope}" />`,
    'industry-filters': '<IndustryFilters group={group} onChange={setGroup} />',
    'industry-grid': '<IndustryCards entries={industryList} />',
    'region-chips': '<RegionChips active={region} onSelect={setRegion} />',
    'region-panel': '<RegionDetails active={region} />',
    'insight-filters': '<InsightFilters category={category} onChange={setCategory} />',
    'insight-featured': '<FeaturedArticle />', 'insight-grid': '<ArticleCards entries={articleList} onClear={clearFilters} />',
    'contact-form-area': '<EnquiryForm />',
  };
  if (slot && slots[slot]) children = slots[slot];
  if (slot === 'insight-featured') attrs.hidden = expression('!showFeatured');
  if (attrs.id === 'industry-count') children = '{industryList.length + (industryList.length === 1 ? " industry shown" : " industries shown")}';
  if (attrs.id === 'insight-count') children = '{(articleList.length + (showFeatured ? 1 : 0)) + " articles shown"}';
  if (attrs['data-form'] === 'newsletter') return '<Newsletter />';
  if (attrs['data-form'] === 'insight-search') attrs.onSubmit = expression('event => event.preventDefault()');
  if (attrs.id === 'insight-q') { attrs.value = expression('query'); attrs.onChange = expression('event => setQuery(event.target.value)'); }
  if (scope === 'form') {
    if (attrs['data-form'] === 'contact') attrs.onSubmit = expression('submit');
    if (attrs.id?.startsWith('f-')) {
      const field = attrs.id.slice(2);
      attrs[field === 'consent' ? 'checked' : 'value'] = expression(`values.${field}`);
      attrs.onChange = expression(`event => change(${JSON.stringify(field)}, ${field === 'consent' ? 'event.target.checked' : 'event.target.value'})`);
      attrs.onBlur = expression(`() => blur(${JSON.stringify(field)})`);
      attrs['aria-invalid'] = expression(`errors.${field} ? true : undefined`);
      if (attrs.class) attrs.class = expression(`${JSON.stringify(attrs.class)} + (errors.${field} ? ' is-invalid' : '')`);
    }
    if (attrs.id?.startsWith('e-')) {
      const field = attrs.id.slice(2); attrs.hidden = expression(`!errors.${field}`);
      children = `<Icon name="circle-alert" />{errors.${field}}`;
    }
    if (attrs.id === 'm-count') children = '{values.message.length + " / 1000"}';
    if (attrs.id === 'form-summary') children = '<ValidationSummary errors={errors} show={submitted} />';
    if (tag === 'button' && attrs.type === 'submit') { attrs.disabled = expression('sending'); children = '{sending ? "Sending…" : <>Send Enquiry<Icon name="send" /></>}'; }
  }
  const attributes = Object.entries(attrs).map(([raw, value]) => {
    let key = names[raw] || (/^(data|aria)-/.test(raw) ? raw : camel(raw));
    if (value?.expression) return `${key}={${value.expression}}`;
    if (key === 'style') {
      const style = Object.fromEntries(value.split(';').filter(Boolean).map(rule => { const colon = rule.indexOf(':'); return [camel(rule.slice(0, colon).trim()), rule.slice(colon + 1).trim()]; }));
      return `style={${JSON.stringify(style)}}`;
    }
    if (value === true) return `${key}={true}`;
    return `${key}=${JSON.stringify(decode(String(value)))}`;
  }).join(' ');
  if (slot === 'map') return `<WorldMap ${attributes} mode="${attrs['data-map']}"${attrs['data-map'] === 'interactive' ? ' active={region} onSelect={setRegion}' : ''} />`;
  const opening = `<${tag}${attributes ? ' ' + attributes : ''}`;
  if (voids.has(tag)) return opening + ' />';
  return opening + '>\n' + (children ?? node.children.map(convert).join('')) + `\n</${tag}>`;
}
const imports = `import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';\nimport { useState } from 'react';\nimport images from '../data/images';\nimport data from '../data/prototype';\nimport { Statistics, ProcessSteps, ServiceCards, IndustryCards, IndustryFilters, InsightFilters, FeaturedArticle, ArticleCards, SocialButtons, SocialNote } from '../components/common/Content';\nimport { WorldMap, RegionChips, RegionDetails } from '../components/network/WorldMap';\nimport EnquiryForm from '../components/forms/EnquiryForm';\nimport Newsletter from '../components/forms/Newsletter';\n`;
const state = {
  industries: "const [group, setGroup] = useState('all');\nconst industryList = data.INDUSTRIES.filter(item => group === 'all' || item.group === group);",
  'global-network': "const [region, setRegion] = useState('europe');",
  insights: `const { category: requestedCategory } = useParams();\nconst routeCategory = data.CATEGORIES.some(item => item.id === requestedCategory) ? requestedCategory : 'all';\nconst { pathname } = useLocation();\nconst [filter, setFilter] = useState({ path: pathname, category: routeCategory, query: '' });\nconst category = filter.path === pathname ? filter.category : routeCategory;\nconst query = filter.path === pathname ? filter.query : '';\nconst setCategory = category => setFilter({ path: pathname, category, query });\nconst setQuery = query => setFilter({ path: pathname, category, query });\nconst clearFilters = () => setFilter({ path: pathname, category: 'all', query: '' });\nconst showFeatured = category === 'all' && !query.trim();\nconst articleList = data.ARTICLES.filter(article => !(showFeatured && article === data.ARTICLES[0]) && (category === 'all' || article.cat === category) && (!query.trim() || (article.title + ' ' + article.excerpt + ' ' + data.CATEGORIES.find(item => item.id === article.cat)?.label).toLowerCase().includes(query.trim().toLowerCase())));`,
  contact: 'const navigate = useNavigate();',
};
const pages = { Home: 'home', About: 'about', Services: 'services', Industries: 'industries', GlobalNetwork: 'global-network', Insights: 'insights', Contact: 'contact' };
for (const [name, view] of Object.entries(pages)) {
  scope = view;
  const node = all.find(node => node.attrs?.['data-view'] === view);
  save(`src/pages/${name}.jsx`, imports + `\nexport default function ${name}() {\n${state[view] || ''}\nreturn (${convert(node)});\n}\n`);
}
scope = 'header';
const header = all.find(node => node.tag === 'header');
save('src/components/layout/HeaderMarkup.jsx', `import { Link, useLocation } from 'react-router-dom';\nexport default function HeaderMarkup({ dropdown, setDropdown, mobileOpen, setMobileOpen, groups, setGroups, scrolled }) {\nconst { pathname } = useLocation();\nconst isActive = name => name === 'home' ? pathname === '/' : pathname === '/' + name || pathname.startsWith('/' + name + '/');\nreturn (${convert(header)});\n}\n`);
const sprite = tree.children.find(node => node.tag === 'svg');
save('src/components/common/IconSprite.jsx', `export default function IconSprite() { return (${convert(sprite)}); }\n`);
scope = 'footer';
save('src/components/Footer.jsx', `import { Link } from 'react-router-dom';\nimport { useLegal } from './common/LegalModal';\nimport { SocialButtons, SocialNote } from './common/Content';\nexport default function Footer() { const { openLegal } = useLegal(); return (${convert(all.find(node => node.tag === 'footer'))}); }\n`);
scope = 'form';
const form = all.find(node => node.attrs?.['data-form'] === 'contact');
save('src/components/forms/EnquiryForm.jsx', `import { Icon } from '../common/Content';\nimport { ContactSuccess, ValidationSummary, useEnquiry } from './enquiryState';\nexport default function EnquiryForm() {\nconst { values, errors, sending, submitted, success, change, blur, submit, reset } = useEnquiry();\nif (success) return <ContactSuccess values={values} onReset={reset} />;\nreturn (${convert(form)});\n}\n`);
save('reference/AUDIT.md', `# Prototype audit\n\nSource: big-invest-website_2.html (user confirmed this is the requested reference).\n\nRead ${reference.length} characters, ${reference.split('\n').length} lines, ${css.length} CSS characters and ${scripts.length} inline scripts.\n\n## Views\n${all.filter(node => node.attrs?.['data-view']).map(node => `- ${node.attrs['data-view']}: ${node.attrs['data-title']}`).join('\n')}\n\n## Data\n${Object.entries(sandbox.BI_DATA).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.length : JSON.stringify(value)}`).join('\n')}\n\n## Dynamic slots\n${[...new Set(all.map(node => node.attrs?.['data-render']).filter(Boolean))].map(slot => `- ${slot}`).join('\n')}\n\n## Original routes\n${[...new Set(all.map(node => node.attrs?.href).filter(href => href?.startsWith('#/')))].map(href => `- ${href}`).join('\n')}\n\n## Checklist\n- [ ] Restore React/Vite entry and React Router\n- [ ] Reuse all original CSS without override styles\n- [ ] All original static sections converted to JSX\n- [ ] All original images extracted without replacement\n- [ ] Header/footer, dropdowns and mobile groups\n- [ ] Exact shared/detail markup and content\n- [ ] React state for filters, search, region selection\n- [ ] Native React validation and form demo feedback\n- [ ] Legal modal, focus handling and scroll behavior\n- [ ] All routes/direct links/legacy hash compatibility\n- [ ] Desktop/tablet/mobile browser checks\n- [ ] Reference/application visual comparison\n- [ ] Production build\n`);
console.log('Full prototype parsed. Generated original JSX, pure detail/map renderers, exact CSS, 17 local assets and route/content audit.');
