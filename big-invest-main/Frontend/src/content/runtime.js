import BI_DATA from './data';
import images from './images.json';

/* =========================================================
   BIG INVEST — prototype content
   Everything below is proposed or sample content for client
   review. Items flagged TBC need confirmation before launch.
   ========================================================= */
/* =========================================================
   BIG INVEST — prototype behaviour
   Router · renderers · navigation · forms · footer utilities
   ========================================================= */
export function initializeWebsite() {
  'use strict';
  const controller = new AbortController();
  const timers = new Set();
  function listen(target, event, handler, options = {}) {
    target.addEventListener(event, handler, { ...options, signal: controller.signal });
  }
  function schedule(callback, delay) {
    const timer = window.setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
    return timer;
  }

  var D = BI_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var IMG = function (k) { return (images && images[k]) || ''; };
  var ico = function (name, cls) { return '<svg class="i ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var byId = function (list, id) { for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; } return null; };
  var catLabel = function (id) { var c = byId(D.CATEGORIES, id); return c ? c.label : id; };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var arrow = ico('arrow-right');

  function fillImages(root) {
    $$('img[data-img]', root).forEach(function (img) {
      if (!img.getAttribute('src')) img.src = IMG(img.getAttribute('data-img'));
    });
  }

  /* ---------------------------------------------------------
     Shared fragments
     --------------------------------------------------------- */
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


  /* ---------------------------------------------------------
     World map (light, dark and interactive variants)
     --------------------------------------------------------- */
  function solidMapHTML() {
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

  function mapHTML(mode) {
    if (mode === 'solid') return solidMapHTML();
    var dark = mode === 'dark';
    var interactive = mode === 'interactive';
    var routes = D.REGIONS.map(function (r) {
      return '<path class="route" data-region="' + r.id + '" d="' + r.d + '"/>';
    }).join('');
    var glows = dark ? '' : '<path class="route-glow" d="' + D.REGIONS[0].d + '"/><path class="route-glow" d="' + D.REGIONS[2].d + '"/>';
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

  var regionState = { active: 'europe' };
  function setRegion(id) {
    regionState.active = id;
    var r = byId(D.REGIONS, id);
    $$('[data-map="interactive"] .route').forEach(function (p) {
      var on = p.getAttribute('data-region') === id;
      p.classList.toggle('is-on', on);
      p.classList.toggle('is-dim', !on);
    });
    $$('[data-map="interactive"] .node').forEach(function (n) { n.classList.toggle('is-on', n.getAttribute('data-region') === id); });
    $$('[data-pick-region]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pick-region') === id)); });
    var panel = $('[data-render="region-panel"]');
    if (panel && r) {
      panel.innerHTML = '<span class="pill pill-dark" style="background:#FFC900;color:#102747">Potential focus</span>' +
        '<h3 class="h3">' + esc(r.name) + '</h3>' +
        '<p class="small">' + esc(r.text) + '</p>' +
        '<ul class="checks">' + r.items.map(function (t) { return '<li><span class="tick">' + ico('check') + '</span>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="mt-8"><a class="btn btn-primary btn-sm" href="/contact/general/' + r.id + '">Discuss ' + esc(r.name) + arrow + '</a></div>' +
        '<p class="small" style="font-size:12.5px;margin-top:auto">Illustrative only — markets and partners to be confirmed by BIG INVEST.</p>';
    }
  }

  /* ---------------------------------------------------------
     Static renders (run once)
     --------------------------------------------------------- */
  function renderStatic() {
    $$('[data-render="stats"]').forEach(function (el) { el.innerHTML = statsHTML(); });
    $$('[data-render="steps"]').forEach(function (el) { el.innerHTML = stepsHTML(D.STEPS); });
    $$('[data-render="sourcing-steps"]').forEach(function (el) { el.innerHTML = stepsHTML(D.SOURCING_STEPS); });
    $$('[data-render="map"]').forEach(function (el) { el.innerHTML = mapHTML(el.getAttribute('data-map')); });

    var homeInd = $('[data-render="home-industries"]');
    if (homeInd) {
      homeInd.innerHTML = D.INDUSTRIES.filter(function (x) { return !x.plain; }).map(function (x) {
        return '<a class="photo-card" href="/industries/' + x.id + '">' +
          '<img src="' + IMG(x.img) + '" alt="">' +
          '<span class="pc-body">' + ico(x.icon, 'i-lg') +
          '<span class="pc-row"><span class="pc-txt"><span class="pc-title">' + esc(x.id === 'commodities' ? 'Commodities' : x.id === 'apparel' ? 'Apparel' : x.short) + '</span>' +
          '<span class="pc-text">' + esc(x.tagline) + '</span></span>' +
          '<span class="arrow-dot">' + arrow + '</span></span></span></a>';
      }).join('');
    }

    var svcGrid = $('[data-render="services-grid"]');
    if (svcGrid) {
      svcGrid.innerHTML = D.SERVICES.map(function (s) {
        return '<article class="svc-card card-lift">' +
          '<a class="media" href="/services/' + s.id + '" tabindex="-1" aria-hidden="true"><img src="' + IMG(s.img) + '" alt=""' + (s.imgPos ? ' style="object-position:' + s.imgPos + '"' : '') + '></a>' +
          '<div class="svc-body"><span class="badge">' + ico(s.icon) + '</span>' +
          '<h3 class="h3"><a href="/services/' + s.id + '" style="text-decoration:none;color:inherit">' + esc(s.title) + '</a></h3>' +
          '<p class="small">' + esc(s.short) + '</p>' +
          '<ul class="checks">' + s.points.map(function (p) { return '<li><span class="tick">' + ico('check') + '</span>' + esc(p) + '</li>'; }).join('') + '</ul>' +
          '<div class="svc-actions"><a class="link-arrow" href="/services/' + s.id + '" aria-label="Learn more about ' + esc(s.title) + '">Learn more' + arrow + '</a>' +
          '<a class="link-arrow" href="/contact/' + s.type + '/' + s.id + '" aria-label="Enquire about ' + esc(s.title) + '" style="color:#526078">Enquire</a></div>' +
          '</div></article>';
      }).join('');
    }

    var chips = $('[data-render="region-chips"]');
    if (chips) {
      chips.innerHTML = D.REGIONS.map(function (r) {
        return '<button class="chip" type="button" data-pick-region="' + r.id + '" aria-pressed="false">' + esc(r.name) + '</button>';
      }).join('');
    }
    setRegion(regionState.active);

    $$('[data-render="socials"]').forEach(function (el) {
      el.innerHTML = D.SOCIALS.map(function (s) {
        return '<button class="social" type="button" data-social="' + s.id + '" aria-label="' + s.label + '" aria-pressed="false">' + ico(s.icon, 'i-fill') + '</button>';
      }).join('');
    });

    renderIndustryFilters();
    renderIndustryGrid();
    renderInsightFilters();
    renderInsights();
  }

  /* ---------------------------------------------------------
     Industries directory + filters
     --------------------------------------------------------- */
  var indState = { group: 'all' };
  function renderIndustryFilters() {
    var el = $('[data-render="industry-filters"]');
    if (!el) return;
    el.innerHTML = D.IND_GROUPS.map(function (g) {
      var n = g.id === 'all' ? D.INDUSTRIES.length : D.INDUSTRIES.filter(function (x) { return x.group === g.id; }).length;
      return '<button class="chip" type="button" data-ind-group="' + g.id + '" aria-pressed="' + (indState.group === g.id) + '">' + esc(g.label) + ' <span class="count">' + n + '</span></button>';
    }).join('');
  }
  function renderIndustryGrid() {
    var el = $('[data-render="industry-grid"]');
    if (!el) return;
    var list = D.INDUSTRIES.filter(function (x) { return indState.group === 'all' || x.group === indState.group; });
    el.innerHTML = list.map(function (x) {
      return '<a class="photo-card' + (x.plain ? ' is-plain' : '') + '" href="/industries/' + x.id + '">' +
        '<img src="' + IMG(x.img) + '" alt="">' +
        '<span class="pc-body">' + ico(x.icon, 'i-xl') +
        '<span class="pc-title">' + esc(x.title) + '</span>' +
        '<span class="pc-desc">' + esc(x.tagline) + '</span>' +
        '<span class="row" style="justify-content:space-between;gap:12px;margin-top:4px"><span class="small" style="color:#FFD500;font-weight:700">View industry</span><span class="arrow-dot">' + arrow + '</span></span>' +
        '</span></a>';
    }).join('');
    var live = $('#industry-count');
    if (live) live.textContent = list.length + (list.length === 1 ? ' industry shown' : ' industries shown');
  }

  /* ---------------------------------------------------------
     Insights listing, filtering and search
     --------------------------------------------------------- */
  var insState = { cat: 'all', q: '' };
  function renderInsightFilters() {
    var el = $('[data-render="insight-filters"]');
    if (!el) return;
    el.innerHTML = D.CATEGORIES.map(function (c) {
      return '<button class="chip" type="button" data-ins-cat="' + c.id + '" aria-pressed="' + (insState.cat === c.id) + '">' + esc(c.label) + '</button>';
    }).join('');
  }
  function postCard(a) {
    return '<a class="post card-lift" href="/insights/' + a.id + '">' +
      '<span class="media"><img src="' + IMG(a.img) + '" alt=""></span>' +
      '<span class="post-body"><span class="row" style="justify-content:space-between;gap:10px"><span class="pill">' + esc(catLabel(a.cat)) + '</span><span class="tbc">Sample</span></span>' +
      '<span class="post-title">' + esc(a.title) + '</span>' +
      '<span class="small">' + esc(a.excerpt) + '</span>' +
      '<span class="meta" style="margin-top:auto">' + '<span>' + ico('clock') + a.read + ' min read</span><span>' + ico('file-text') + 'Sample article</span></span>' +
      '</span></a>';
  }
  function renderInsights() {
    var featEl = $('[data-render="insight-featured"]');
    var gridEl = $('[data-render="insight-grid"]');
    if (!featEl || !gridEl) return;
    var q = insState.q.trim().toLowerCase();
    var showFeatured = insState.cat === 'all' && !q;
    var featured = D.ARTICLES[0];
    var list = D.ARTICLES.filter(function (a) {
      if (showFeatured && a === featured) return false;
      if (insState.cat !== 'all' && a.cat !== insState.cat) return false;
      if (q && (a.title + ' ' + a.excerpt + ' ' + catLabel(a.cat)).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    featEl.innerHTML = showFeatured ?
      '<article class="feature card-lift"><a class="media" href="/insights/' + featured.id + '" tabindex="-1" aria-hidden="true"><img src="' + IMG(featured.img) + '" alt=""></a>' +
      '<div class="feat-body"><div class="flag-row"><span class="pill pill-dark">Featured</span><span class="pill">' + esc(catLabel(featured.cat)) + '</span><span class="tbc">Sample article</span></div>' +
      '<h3 class="h2" style="font-size:clamp(24px,2.2vw,32px)"><a href="/insights/' + featured.id + '" style="color:inherit;text-decoration:none">' + esc(featured.title) + '</a></h3>' +
      '<p class="body">' + esc(featured.excerpt) + '</p>' +
      '<span class="meta"><span>' + ico('clock') + featured.read + ' min read</span></span>' +
      '<div><a class="btn btn-navy btn-sm" href="/insights/' + featured.id + '">Read article' + arrow + '</a></div></div></article>' : '';
    featEl.hidden = !showFeatured;
    gridEl.innerHTML = list.length ? list.map(postCard).join('') :
      '<div class="empty" style="grid-column:1/-1"><span class="badge badge-soft">' + ico('search') + '</span><h3 class="h4">No articles match your search</h3><p class="small">Try a different keyword or category.</p><button class="btn btn-outline btn-sm" type="button" data-clear-insights>Clear filters</button></div>';
    var live = $('#insight-count');
    if (live) live.textContent = (list.length + (showFeatured ? 1 : 0)) + ' articles shown';
  }

  /* ---------------------------------------------------------
     Detail templates
     --------------------------------------------------------- */
  function renderService(id) {
    const entry = byId(D.SERVICES, id);
    return entry ? entry.title : false;
  }

  function renderIndustry(id) {
    const entry = byId(D.INDUSTRIES, id);
    return entry ? entry.title : false;
  }

  function renderArticle(id) {
    const entry = byId(D.ARTICLES, id);
    return entry ? entry.title : false;
  }

  /* ---------------------------------------------------------
     Router
     --------------------------------------------------------- */
  var NAV_FOR = { home: 'home', about: 'about', services: 'services', service: 'services', industries: 'industries', industry: 'industries', 'global-network': 'global-network', insights: 'insights', article: 'insights', contact: 'contact' };

  function parseHash() {
    return location.pathname.split('/').filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch { return p; }
    });
  }

  function showView(name, opts) {
    opts = opts || {};
    $$('.view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    var view = $('.view[data-view="' + name + '"]');
    var navKey = NAV_FOR[name];
    $$('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === navKey;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = opts.title ? opts.title + ' — BIG INVEST' : (view.getAttribute('data-title') || 'BIG INVEST');
    closeAllMenus();
    fillImages(view);
    if (opts.section) {
      var target = document.getElementById(opts.section);
      if (target) {
        schedule(function () { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }, 30);
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    var h1 = $('h1', view);
    if (h1 && opts.focus !== false) { try { h1.focus({ preventScroll: true }); } catch { h1.focus(); } }
  }

  var firstRoute = true;
  function route() {
    window.dispatchEvent(new Event('big-invest:navigate'));
    var parts = parseHash();
    if (parts === null) return; // in-page anchor — leave the current view alone
    var a = parts[0] || '', b = parts[1], c = parts[2];
    var focus = !firstRoute;
    firstRoute = false;
    switch (a) {
      case '': showView('home', { focus: focus }); break;
      case 'about': showView('about', { focus: focus }); break;
      case 'services':
        if (b) { var st = renderService(b); if (st) { showView('service', { title: st, focus: focus }); } else { location.replace('/services'); } }
        else showView('services', { focus: focus });
        break;
      case 'industries':
        if (b) { var it = renderIndustry(b); if (it) { showView('industry', { title: it, focus: focus }); } else { location.replace('/industries'); } }
        else showView('industries', { focus: focus });
        break;
      case 'global-network':
        showView('global-network', { focus: focus, section: b ? 'net-' + b : null });
        break;
      case 'insights':
        if (b === 'category' && c) {
          insState.cat = byId(D.CATEGORIES, c) ? c : 'all'; insState.q = ''; var qi = $('#insight-q'); if (qi) qi.value = '';
          renderInsightFilters(); renderInsights(); showView('insights', { focus: focus });
        } else if (b === 'newsletter') {
          showView('insights', { focus: false, section: 'newsletter' });
        } else if (b) {
          var at = renderArticle(b); if (at) { showView('article', { title: at, focus: focus }); } else { location.replace('/insights'); }
        } else showView('insights', { focus: focus });
        break;
      case 'contact':
        showView('contact', { focus: focus && !b, section: b ? 'enquiry' : null });
        if (b) presetEnquiry(b, c);
        break;
      default:
        location.replace('/');
    }
  }

  /* ---------------------------------------------------------
     Header: dropdowns + mobile menu
     --------------------------------------------------------- */
  function closeDropdowns(except) {
    $$('.dd-toggle').forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute('aria-expanded', 'false');
      var dd = document.getElementById(btn.getAttribute('aria-controls'));
      if (dd) dd.classList.remove('is-open');
    });
  }
  function setMobileMenu(open) {
    var burger = $('.burger'), panel = $('#mobile-menu');
    if (!burger || !panel) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.hidden = !open;
  }
  function closeAllMenus() { closeDropdowns(); setMobileMenu(false); }

  function initHeader() {
    $$('.dd-toggle').forEach(function (btn) {
      listen(btn, 'click', function (e) {
        e.stopPropagation();
        var open = btn.getAttribute('aria-expanded') !== 'true';
        closeDropdowns(btn);
        btn.setAttribute('aria-expanded', String(open));
        var dd = document.getElementById(btn.getAttribute('aria-controls'));
        if (dd) dd.classList.toggle('is-open', open);
      });
    });
    $$('.nav-item.has-dd').forEach(function (item) {
      listen(item, 'mouseleave', function () { closeDropdowns(); });
      listen(item, 'focusout', function (e) { if (!item.contains(e.relatedTarget)) closeDropdowns(); });
    });
    listen(document, 'click', function (e) { if (!e.target.closest('.nav-item.has-dd')) closeDropdowns(); });
    listen(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openBtn = $('.dd-toggle[aria-expanded="true"]');
      if (openBtn) { closeDropdowns(); openBtn.focus(); return; }
      if ($('.burger') && $('.burger').getAttribute('aria-expanded') === 'true') { setMobileMenu(false); $('.burger').focus(); }
    });
    var burger = $('.burger');
    if (burger) listen(burger, 'click', function () { setMobileMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('.m-exp').forEach(function (btn) {
      listen(btn, 'click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        var sub = document.getElementById(btn.getAttribute('aria-controls'));
        if (sub) sub.hidden = !open;
      });
    });
    listen(window, 'resize', function () { if (window.innerWidth > 1180) setMobileMenu(false); });
  }

  /* ---------------------------------------------------------
     Delegated clicks: filters, regions, socials, legal, anchors
     --------------------------------------------------------- */
  var lastFocus = null;
  function openModal(kind, opener) {
    var m = $('#legal-modal');
    var name = kind === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
    $('#legal-title').textContent = name;
    $('[data-legal-name]', m).textContent = name;
    lastFocus = opener || document.activeElement;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-close', m).focus();
  }
  function closeModal() {
    var m = $('#legal-modal');
    if (m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initDelegates() {
    listen(document, 'click', function (e) {
      var t;
      if ((t = e.target.closest('[data-ind-group]'))) {
        indState.group = t.getAttribute('data-ind-group');
        renderIndustryFilters(); renderIndustryGrid();
        var again = $('[data-ind-group="' + indState.group + '"]'); if (again) again.focus();
        return;
      }
      if ((t = e.target.closest('[data-ins-cat]'))) {
        insState.cat = t.getAttribute('data-ins-cat');
        renderInsightFilters(); renderInsights();
        var again2 = $('[data-ins-cat="' + insState.cat + '"]'); if (again2) again2.focus();
        return;
      }
      if (e.target.closest('[data-clear-insights]')) {
        insState.cat = 'all'; insState.q = ''; $('#insight-q').value = '';
        renderInsightFilters(); renderInsights(); $('#insight-q').focus();
        return;
      }
      if ((t = e.target.closest('[data-pick-region]'))) { setRegion(t.getAttribute('data-pick-region')); return; }
      if ((t = e.target.closest('[data-social]'))) {
        var id = t.getAttribute('data-social');
        var group = t.closest('[data-render="socials"]');
        var wasOn = t.getAttribute('aria-pressed') === 'true';
        $$('[data-social]', group).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        var s = byId(D.SOCIALS, id);
        var scope = group.closest('.site-footer, .side-card') || group.parentElement;
        var note = scope.querySelector('.social-note');
        if (!wasOn) t.setAttribute('aria-pressed', 'true');
        if (note) note.textContent = wasOn ? '' : s.label + ' profile link will be added once BIG INVEST confirms the account.';
        return;
      }
      if ((t = e.target.closest('[data-legal]'))) { openModal(t.getAttribute('data-legal'), t); return; }
      if (e.target.closest('[data-close-modal]')) { closeModal(); return; }
      if (e.target.id === 'legal-modal') { closeModal(); return; }
      if (e.target.closest('[data-action="preset-partnership"]')) { presetEnquiry('partnership'); $('#f-name') && $('#f-name').focus(); return; }
      var link = e.target.closest('a[href]');
      if (link) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target || link.hasAttribute('download')) return;
        var href = link.getAttribute('href');
        if (href.indexOf('/') === 0 && href.indexOf('//') !== 0) {
          e.preventDefault();
          history.pushState(null, '', href);
          route();
          return;
        }
        if (href.indexOf('#') === 0 && href.length > 1) {
          var target = document.getElementById(href.slice(1));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            if (href === '#main') target.focus({ preventScroll: true });
          }
        }
      }
    });

    listen(document, 'keydown', function (e) {
      var m = $('#legal-modal');
      if (!m || m.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'Tab') {
        var f = $$('button, a[href], input, select, textarea', m);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var search = $('[data-form="insight-search"]');
    if (search) {
      var q = $('#insight-q');
      listen(q, 'input', function () { insState.q = q.value; renderInsights(); });
      listen(search, 'submit', function (e) { e.preventDefault(); insState.q = q.value; renderInsights(); });
    }

    var toTop = $('.to-top');
    var header = $('.site-header');
    var onScroll = function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (toTop) toTop.hidden = y < 640;
      if (header) header.classList.toggle('is-scrolled', y > 8);
    };
    listen(window, 'scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) listen(toTop, 'click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var main = $('#main'); if (main) main.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------
     Forms
     --------------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FIELDS = {
    name: { label: 'Full name', test: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; } },
    email: { label: 'Business email', test: function (v) { return !v.trim() ? 'Please enter your email address.' : (EMAIL_RE.test(v.trim()) ? '' : 'Please enter a valid email address, like name@company.com.'); } },
    phone: { label: 'Phone', test: function (v) { if (!v.trim()) return ''; var digits = v.replace(/\D/g, ''); return (/^[+()\d\s-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15) ? '' : 'Please enter a valid phone number, or leave it blank.'; } },
    company: { label: 'Company', test: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your company name.'; } },
    type: { label: 'Enquiry type', test: function (v) { return v ? '' : 'Please choose an enquiry type.'; } },
    message: { label: 'Message', test: function (v) { var n = v.trim().length; return n < 20 ? 'Please add a little more detail (at least 20 characters).' : (n > 1000 ? 'Please keep your message under 1,000 characters.' : ''); } },
    consent: { label: 'Consent', test: function (v, el) { return el.checked ? '' : 'Please confirm we may use your details to reply.'; } }
  };
  var TYPE_LABELS = {};

  function fieldEl(name) { return document.getElementById('f-' + name); }
  function showError(name, msg) {
    var el = fieldEl(name), err = document.getElementById('e-' + name);
    if (!el || !err) return;
    if (msg) {
      err.innerHTML = ico('circle-alert') + esc(msg); err.hidden = false;
      el.setAttribute('aria-invalid', 'true'); if (name !== 'consent') el.classList.add('is-invalid');
    } else {
      err.textContent = ''; err.hidden = true;
      el.removeAttribute('aria-invalid'); el.classList.remove('is-invalid');
    }
  }
  function validateField(name) {
    var el = fieldEl(name); if (!el) return '';
    var msg = FIELDS[name].test(el.value || '', el);
    showError(name, msg);
    return msg;
  }

  function presetEnquiry(type, topic) {
    if (!$('form[data-form="contact"]')) resetContact();
    var sel = fieldEl('type');
    if (!sel) return;
    var valid = $$('option', sel).some(function (o) { return o.value === type; });
    if (valid) { sel.value = type; showError('type', ''); }
    var msg = fieldEl('message');
    if (topic && msg && !msg.value.trim()) {
      var s = byId(D.SERVICES, topic) || byId(D.INDUSTRIES, topic) || byId(D.REGIONS, topic);
      var name = s ? (s.title || s.name) : '';
      if (name) { msg.value = 'I would like to discuss ' + name + '. '; updateCount(); }
    }
  }

  function updateCount() {
    var m = fieldEl('message'), c = $('#m-count');
    if (m && c) c.textContent = m.value.length + ' / 1000';
  }

  var contactTemplate = null;
  function resetContact() {
    var area = $('[data-render="contact-form-area"]');
    if (!area || !contactTemplate) return;
    area.innerHTML = contactTemplate;
    bindContact();
  }

  function bindContact() {
    var form = $('form[data-form="contact"]');
    if (!form) return;
    $$('option', fieldEl('type')).forEach(function (o) { TYPE_LABELS[o.value] = o.textContent; });
    Object.keys(FIELDS).forEach(function (name) {
      var el = fieldEl(name);
      if (!el) return;
      listen(el, 'blur', function () { if (el.value || el.dataset.touched) validateField(name); el.dataset.touched = '1'; });
      listen(el, name === 'consent' || name === 'type' ? 'change' : 'input', function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(name);
        if (name === 'message') updateCount();
      });
    });
    listen(form, 'submit', function (e) {
      e.preventDefault();
      var errors = [];
      Object.keys(FIELDS).forEach(function (name) { var m = validateField(name); if (m) errors.push([name, m]); });
      var summary = $('#form-summary');
      if (errors.length) {
        summary.innerHTML = '<div class="notice notice-err" tabindex="-1">' + ico('circle-alert') + '<div><strong>Please check ' + errors.length + (errors.length === 1 ? ' field' : ' fields') + ':</strong><ul style="margin:6px 0 0;padding-left:18px">' +
          errors.map(function (er) { return '<li><a href="#f-' + er[0] + '" style="color:inherit">' + esc(FIELDS[er[0]].label) + '</a> — ' + esc(er[1]) + '</li>'; }).join('') + '</ul></div></div>';
        $('.notice', summary).focus();
        return;
      }
      summary.innerHTML = '';
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.innerHTML = 'Sending…';
      var data = { name: fieldEl('name').value.trim(), email: fieldEl('email').value.trim(), company: fieldEl('company').value.trim(), type: TYPE_LABELS[fieldEl('type').value] || '' };
      schedule(function () {
        var area = $('[data-render="contact-form-area"]');
        area.innerHTML = '<div class="success-panel" tabindex="-1" id="contact-success">' +
          '<span class="success-icon">' + ico('circle-check') + '</span>' +
          '<span class="eyebrow">Enquiry ready</span>' +
          '<h2 class="h2" style="font-size:clamp(26px,2.2vw,34px)">Thank you, ' + esc(data.name.split(' ')[0]) + '.</h2>' +
          '<p class="body">Your enquiry passed all checks. In the live website it would be delivered to the BIG INVEST team, who would reply to <strong>' + esc(data.email) + '</strong>.</p>' +
          '<ul class="summary-list"><li><b>Enquiry type:</b> ' + esc(data.type) + '</li><li><b>Company:</b> ' + esc(data.company) + '</li><li><b>Email:</b> ' + esc(data.email) + '</li></ul>' +
          '<div class="notice notice-info" style="width:100%">' + ico('info') + '<span>Frontend prototype — this message has not been sent or stored anywhere.</span></div>' +
          '<div class="btn-row"><button class="btn btn-navy btn-sm" type="button" data-new-enquiry>Send another enquiry</button><a class="btn btn-outline btn-sm" href="/">Back to home</a></div></div>';
        $('#contact-success').focus();
        listen($('[data-new-enquiry]'), 'click', function () { resetContact(); fieldEl('name').focus(); });
      }, 900);
    });
    listen($('#form-summary'), 'click', function (e) {
      var a = e.target.closest('a[href^="#f-"]');
      if (!a) return;
      e.preventDefault(); e.stopPropagation();
      var f = document.getElementById(a.getAttribute('href').slice(1));
      if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.focus({ preventScroll: true }); }
    });
    updateCount();
  }

  function initNewsletter() {
    var form = $('form[data-form="newsletter"]');
    if (!form) return;
    listen(form, 'submit', function (e) {
      e.preventDefault();
      var email = form.email, consent = form.consent, out = $('#nl-msg');
      var v = email.value.trim();
      var msg = !v ? 'Please enter your email address.' : (!EMAIL_RE.test(v) ? 'Please enter a valid email address, like name@company.com.' : (!consent.checked ? 'Please tick the box to agree to receive emails.' : ''));
      if (msg) {
        out.innerHTML = '<div class="notice notice-err">' + ico('circle-alert') + '<span>' + esc(msg) + '</span></div>';
        if (!v || !EMAIL_RE.test(v)) { email.setAttribute('aria-invalid', 'true'); email.classList.add('is-invalid'); email.focus(); }
        else { email.removeAttribute('aria-invalid'); email.classList.remove('is-invalid'); consent.focus(); }
        return;
      }
      email.removeAttribute('aria-invalid'); email.classList.remove('is-invalid');
      out.innerHTML = '<div class="notice notice-ok">' + ico('circle-check') + '<span>Thanks! <strong>' + esc(v) + '</strong> would be subscribed once the newsletter service is connected. Prototype only — nothing was sent.</span></div>';
      form.reset();
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function boot() {
    var area = $('[data-render="contact-form-area"]');
    if (area) contactTemplate = area.innerHTML;
    fillImages(document);
    renderStatic();
    initHeader();
    initDelegates();
    bindContact();
    initNewsletter();
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    listen(window, 'popstate', route);
    route();
  }

  if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1));
  boot();
  return function cleanup() {
    controller.abort();
    timers.forEach(timer => window.clearTimeout(timer));
    document.body.style.overflow = '';
  };
}
