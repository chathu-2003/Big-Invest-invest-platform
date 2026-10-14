import D from '../data/prototype';
import images from '../data/images';
const IMG = k => esc(images[k] || k || '');
const ico = (name, cls = '') => '<svg class="i ' + cls + '" aria-hidden="true"><use href="#i-' + esc(name) + '"/></svg>';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const byId = (list, id) => list.find(item => item.id === id);
const catLabel = id => byId(D.CATEGORIES, id)?.label || id;
const arrow = ico('arrow-right');
const tbc = text => '<p class="tbc">' + ico('info') + esc(text) + '</p>';
  function statsHTML() {
    return D.STATS.map(function (s) {
      return '<div class="stat"><span class="badge badge-sm">' + ico(s.icon) + '</span>' +
        '<span class="stat-num">' + esc(s.num) + '</span>' +
        '<span class="stat-label">' + esc(s.label) + '<br>' + esc(s.sub) + '</span></div>';
    }).join('');
  }
  function stepsHTML(steps) {
    return steps.map(function (s, i) {
      return '<article class="step"><span class="step-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h3 class="h4">' + esc(s.title) + '</h3><p class="small">' + esc(s.text) + '</p></article>';
    }).join('');
  }
  function pageHero(o) {
    var crumbs = o.crumbs.map(function (c, i) {
      var last = i === o.crumbs.length - 1;
      var sep = i ? '<span class="sep" aria-hidden="true">/</span>' : '';
      return sep + (last ? '<span aria-current="page">' + esc(c[0]) + '</span>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>');
    }).join('');
    return '<section class="page-hero on-dark ' + (o.cls || '') + '" aria-labelledby="' + o.id + '">' +
      '<div class="page-hero-glow" aria-hidden="true"></div>' +
      '<div class="wrap page-hero-inner"><div class="page-hero-copy">' +
      '<nav class="crumbs" aria-label="Breadcrumb">' + crumbs + '</nav>' +
      (o.eyebrow ? '<span class="eyebrow">' + esc(o.eyebrow) + '</span>' : '') +
      '<h1 id="' + o.id + '" class="h1" tabindex="-1">' + esc(o.title) + '</h1>' +
      (o.lead ? '<p class="lead">' + esc(o.lead) + '</p>' : '') +
      (o.extra || '') +
      '</div></div>' +
      '<div class="page-hero-stripe" aria-hidden="true"></div>' +
      '<div class="page-hero-media"><img ' + (o.img ? 'src="' + IMG(o.img) + '" ' : '') + 'alt="' + esc(o.alt || '') + '"' + (o.imgPos ? ' style="object-position:' + o.imgPos + '"' : '') + '></div>' +
      '</section>';
  }
  function solidMapHTML(D) {
    var routes = D.REGIONS.map(function (r) { return '<path class="sr" d="' + r.d + '"/>'; }).join('');
    var nodes = D.REGIONS.map(function (r) {
      return '<circle class="sn-glow" cx="' + r.x + '" cy="' + r.y + '" r="14"/><circle class="sn" cx="' + r.x + '" cy="' + r.y + '" r="5"/>';
    }).join('');
    return '<img src="' + IMG('mapSolid') + '" alt="" width="1240" height="560">' +
      '<svg viewBox="0 0 1240 560" aria-hidden="true"><defs>' +
      '<filter id="bi-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<radialGradient id="bi-hub" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF7CC" stop-opacity="1"/><stop offset=".25" stop-color="#FFD500" stop-opacity=".85"/><stop offset="1" stop-color="#FFC900" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="bi-node" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD500" stop-opacity=".9"/><stop offset="1" stop-color="#FFC900" stop-opacity="0"/></radialGradient>' +
      '</defs><g filter="url(#bi-glow)">' + routes + '</g>' + nodes +
      '<circle cx="' + D.HUB.x + '" cy="' + D.HUB.y + '" r="78" fill="url(#bi-hub)" class="hub-flare"/>' +
      '<circle cx="' + D.HUB.x + '" cy="' + D.HUB.y + '" r="9" fill="#FFFFFF"/></svg>';
  }
  function mapHTML(mode, D) {
    if (mode === 'solid') return solidMapHTML(D);
    var dark = mode === 'dark';
    var interactive = mode === 'interactive';
    var routes = D.REGIONS.map(function (r) {
      return '<path class="route" data-region="' + r.id + '" d="' + r.d + '"/>';
    }).join('');
    var glows = dark ? '' : '<path class="route-glow" d="' + (D.REGIONS[0]?.d || '') + '"/><path class="route-glow" d="' + (D.REGIONS[2]?.d || '') + '"/>';
    var nodes = D.REGIONS.map(function (r) {
      return '<circle class="node" data-region="' + r.id + '" cx="' + r.x + '" cy="' + r.y + '" r="7"/>';
    }).join('');
    var pct = function (v, max) { return (v / max * 100).toFixed(2) + '%'; };
    var tags = '';
    if (interactive) {
      tags = D.REGIONS.map(function (r) {
        return '<button class="map-tag" type="button" data-pick-region="' + r.id + '" aria-pressed="false" style="left:' + pct(r.x, 1240) + ';top:' + pct(r.y, 560) + '">' + esc(r.name) + '</button>';
      }).join('');
    }
    var hubTag = '<span class="map-tag is-hub" style="left:' + pct(D.HUB.x, 1240) + ';top:' + pct(D.HUB.y, 560) + ';transform:translate(-50%,16px)">Sri Lanka</span>';
    return '<img src="' + IMG(dark ? 'mapDark' : 'mapLight') + '" alt="" width="1240" height="560">' +
      '<svg viewBox="0 0 1240 560" aria-hidden="true">' + glows + routes + nodes +
      '<circle class="hub-pulse" cx="' + D.HUB.x + '" cy="' + D.HUB.y + '" r="14"/>' +
      '<circle class="hub" cx="' + D.HUB.x + '" cy="' + D.HUB.y + '" r="10"/></svg>' + tags + hubTag;
  }
  function postCard(a) {
    return '<a class="post card-lift" href="/insights/' + a.id + '">' +
      '<span class="media"><img src="' + IMG(a.img) + '" alt=""></span>' +
      '<span class="post-body"><span class="row" style="justify-content:space-between;gap:10px"><span class="pill">' + esc(catLabel(a.cat)) + '</span><span class="tbc">Sample</span></span>' +
      '<span class="post-title">' + esc(a.title) + '</span>' +
      '<span class="small">' + esc(a.excerpt) + '</span>' +
      '<span class="meta" style="margin-top:auto">' + '<span>' + ico('clock') + a.read + ' min read</span><span>' + ico('file-text') + (a.sample ? 'Sample article' : esc(a.author || 'BIG INVEST')) + '</span></span>' +
      '</span></a>';
  }
  function renderService(id, D) {
    var s = byId(D.SERVICES, id);
    if (!s) return false;
    var idx = D.SERVICES.indexOf(s);
    var related = Array.from({length: Math.min(3,D.SERVICES.length-1)},(_,i)=>D.SERVICES[(idx+i+1)%D.SERVICES.length]);
    var html = pageHero({
      id: 'service-title', title: s.title, eyebrow: 'Service', lead: s.short, img: s.img, imgPos: s.imgPos, alt: '',
      crumbs: [['Home', '/'], ['Services', '/services'], [s.title]],
      extra: '<div class="btn-row mt-8"><a class="btn btn-primary" href="/contact/' + s.type + '/' + s.id + '">Enquire Now' + arrow + '</a><a class="btn btn-ghost" href="/services">All services</a></div>' +
        tbc('Proposed service — content for client approval')
    }) +
    '<section class="section"><div class="wrap detail-grid"><div>' +
      '<div class="detail-section"><span class="eyebrow">Overview</span><h2 class="h2 mt-16">How we help</h2><p class="body mt-16" style="font-size:17px">' + esc(s.overview) + '</p></div>' +
      '<div class="detail-section"><h2 class="h3">What’s included</h2><ul class="checks included mt-24">' + s.included.map(function (t) { return '<li><span class="tick">' + ico('check') + '</span>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="detail-section"><h2 class="h3">Key benefits</h2><div class="out-grid mt-24">' + s.outcomes.map(function (o) { return '<div class="out-card"><span class="badge badge-sm">' + ico('badge-check') + '</span><div><p class="h4" style="font-size:16px">' + esc(o[0]) + '</p><p class="small">' + esc(o[1]) + '</p></div></div>'; }).join('') + '</div></div>' +
      '<div class="detail-section"><h2 class="h3">How an engagement works</h2><div class="steps mt-24">' + stepsHTML(D.STEPS) + '</div></div>' +
    '</div>' +
    '<aside class="side" aria-label="Service navigation">' +
      '<div class="side-card"><p class="foot-h" style="margin:0 12px">All services</p><ul class="side-nav">' + D.SERVICES.map(function (x) {
        return '<li><a href="/services/' + x.id + '"' + (x.id === s.id ? ' aria-current="page"' : '') + '>' + esc(x.title) + ico('arrow-right') + '</a></li>';
      }).join('') + '</ul></div>' +
      '<div class="side-cta on-dark"><span class="badge">' + ico('messages-square') + '</span><h2 class="h3">Discuss ' + esc(s.title.toLowerCase()) + '</h2><p class="small">Tell us about your requirement and we will suggest next steps.</p><a class="btn btn-primary btn-sm" href="/contact/' + s.type + '/' + s.id + '">Enquire Now' + arrow + '</a></div>' +
    '</aside></div></section>' +
    '<section class="section-sm bg-soft" aria-labelledby="rel-svc"><div class="wrap"><div class="related-title"><h2 id="rel-svc" class="h2" style="font-size:clamp(24px,2vw,30px)">Related services</h2><a class="link-arrow" href="/services">View all' + arrow + '</a></div>' +
      '<div class="grid g3 mt-24">' + related.map(function (r) {
        return '<a class="tile card-lift" href="/services/' + r.id + '" style="text-decoration:none"><span class="badge badge-soft">' + ico(r.icon) + '</span><h3 class="h4">' + esc(r.title) + '</h3><p class="small">' + esc(r.short) + '</p><span class="link-arrow">Learn more' + arrow + '</span></a>';
      }).join('') + '</div></div></section>';
    return html;
  }
  function renderIndustry(id, D) {
    var x = byId(D.INDUSTRIES, id);
    if (!x) return false;
    var others = D.INDUSTRIES.filter(function (o) { return o.id !== x.id && !o.plain; }).slice(0, 3);
    var html = pageHero({
      id: 'industry-title', title: x.title, eyebrow: 'Industry', lead: x.tagline + ' ' + 'See where BIG INVEST can support your business in this sector.', img: x.img, alt: '',
      cls: x.plain ? 'is-plain-hero' : '',
      crumbs: [['Home', '/'], ['Industries', '/industries'], [x.short]],
      extra: '<div class="btn-row mt-8"><a class="btn btn-primary" href="/contact/industry/' + x.id + '">Enquire about this sector' + arrow + '</a><a class="btn btn-ghost" href="/industries">All industries</a></div>' +
        tbc('Sector content subject to client confirmation')
    }) +
    '<section class="section"><div class="wrap detail-grid"><div>' +
      '<div class="detail-section"><span class="eyebrow">Overview</span><h2 class="h2 mt-16">' + esc(x.title) + ' at BIG INVEST</h2><p class="body mt-16" style="font-size:17px">' + esc(x.overview) + '</p>' +
        '<div class="notice notice-info mt-24">' + ico('info') + '<span>' + esc(x.note) + '</span></div></div>' +
      '<div class="detail-section"><h2 class="h3">Potential business opportunities</h2><div class="opp-grid mt-24">' + x.opps.map(function (o, i) {
        return '<article class="opp"><span class="num">' + String(i + 1).padStart(2, '0') + '</span><h3 class="h4">' + esc(o[0]) + '</h3><p class="small">' + esc(o[1]) + '</p></article>';
      }).join('') + '</div></div>' +
      '<div class="detail-section"><h2 class="h3">Relevant capabilities</h2><p class="small mt-8">Services we would typically combine for this sector.</p><div class="cap-links mt-24">' + x.services.filter(sid => byId(D.SERVICES, sid)).map(function (sid) {
        var s = byId(D.SERVICES, sid);
        return '<a class="cap-link" href="/services/' + s.id + '"><span class="dd-ico">' + ico(s.icon) + '</span>' + esc(s.title) + '</a>';
      }).join('') + '</div></div>' +
    '</div>' +
    '<aside class="side" aria-label="Industry navigation">' +
      '<div class="side-card"><p class="foot-h" style="margin:0 12px">All industries</p><ul class="side-nav">' + D.INDUSTRIES.map(function (o) {
        return '<li><a href="/industries/' + o.id + '"' + (o.id === x.id ? ' aria-current="page"' : '') + '>' + esc(o.short) + ico('arrow-right') + '</a></li>';
      }).join('') + '</ul></div>' +
      '<div class="side-cta on-dark"><span class="badge">' + ico(x.icon) + '</span><h2 class="h3">Working in ' + esc(x.short.toLowerCase()) + '?</h2><p class="small">Share your product, market and timeline — we will come back with options.</p><a class="btn btn-primary btn-sm" href="/contact/industry/' + x.id + '">Enquire Now' + arrow + '</a></div>' +
    '</aside></div></section>' +
    '<section class="section-sm bg-soft" aria-labelledby="rel-ind"><div class="wrap"><div class="related-title"><h2 id="rel-ind" class="h2" style="font-size:clamp(24px,2vw,30px)">Other industries</h2><a class="link-arrow" href="/industries">View all' + arrow + '</a></div>' +
      '<div class="ind-dir mt-24">' + others.map(function (o) {
        return '<a class="photo-card" href="/industries/' + o.id + '"><img src="' + IMG(o.img) + '" alt=""><span class="pc-body">' + ico(o.icon, 'i-xl') + '<span class="pc-title">' + esc(o.title) + '</span><span class="row" style="justify-content:space-between"><span class="pc-desc">' + esc(o.tagline) + '</span><span class="arrow-dot">' + arrow + '</span></span></span></a>';
      }).join('') + '</div></div></section>';
    return html;
  }
  function renderArticle(id, D) {
    var a = byId(D.ARTICLES, id);
    if (!a) return false;
    var body = a.body.map(function (b) {
      if (b[0] === 'h') return '<h2>' + esc(b[1]) + '</h2>';
      if (b[0] === 'q') return '<blockquote class="pull">' + ico('quote') + esc(b[1]) + '</blockquote>';
      if (b[0] === 'ul') return '<ul>' + b[1].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
      return '<p>' + esc(b[1]) + '</p>';
    }).join('');
    var same = D.ARTICLES.filter(function (o) { return o.id !== a.id && o.cat === a.cat; });
    var rest = D.ARTICLES.filter(function (o) { return o.id !== a.id && o.cat !== a.cat; });
    var related = same.concat(rest).slice(0, 3);
    var html = pageHero({
      id: 'article-title', cls: 'article-hero', title: a.title, eyebrow: catLabel(a.cat), img: a.img, alt: '',
      crumbs: [['Home', '/'], ['Insights', '/insights'], [catLabel(a.cat), '/insights/category/' + a.cat], ['Article']],
      extra: '<span class="meta"><span>' + ico('clock') + a.read + ' min read</span><span>' + ico('file-text') + (a.sample ? 'Sample article for the prototype' : esc(a.author || 'BIG INVEST')) + '</span></span>'
    }) +
    '<section class="section"><div class="wrap"><div class="article-wrap">' +
      '<a class="back-link" href="/insights">' + ico('arrow-left') + 'Back to Insights</a>' +
      '<p class="lead mt-24" style="font-size:20px;color:#17202D">' + esc(a.excerpt) + '</p>' +
      '<div class="prose mt-32">' + body + '</div>' +
      (a.sample ? '<div class="notice notice-info mt-48">' + ico('info') + '<span>Sample article written for this prototype. It is general information only and not professional, legal or financial advice.</span></div>' : '') +
      '<div class="row mt-32" style="justify-content:space-between;flex-wrap:wrap;gap:16px;padding-top:24px;border-top:1px solid #E1E6ED">' +
        '<a class="back-link" href="/insights">' + ico('arrow-left') + 'All insights</a>' +
        '<a class="btn btn-primary btn-sm" href="/contact/general">Talk to our team' + arrow + '</a></div>' +
    '</div></div></section>' +
    '<section class="section-sm bg-soft" aria-labelledby="rel-art"><div class="wrap"><div class="related-title"><h2 id="rel-art" class="h2" style="font-size:clamp(24px,2vw,30px)">Related insights</h2><a class="link-arrow" href="/insights">View all' + arrow + '</a></div>' +
      '<div class="grid g3 mt-24">' + related.map(postCard).join('') + '</div></div></section>';
    return html;
  }

export { statsHTML, stepsHTML, mapHTML, renderService, renderIndustry, renderArticle };
