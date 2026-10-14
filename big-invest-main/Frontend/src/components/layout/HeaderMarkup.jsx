import { useCms } from '../../cms/ContentProvider';
import { Link, useLocation } from 'react-router-dom';
export default function HeaderMarkup({ dropdown, setDropdown, mobileOpen, setMobileOpen, groups, setGroups, scrolled }) {
const { pathname } = useLocation();
const { data } = useCms();
const isActive = name => name === 'home' ? pathname === '/' : pathname === '/' + name || pathname.startsWith('/' + name + '/');
return (<header className={'site-header' + (scrolled ? ' is-scrolled' : '')} id="top">

<div className="wrap header-row">

<Link className="brand" aria-label="BIG INVEST — home" to="/">

<svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
<circle cx="24" cy="24" r="22" fill="#FFC900">

</circle><path d="M5.5 31.5C15 31 27 24.5 36.5 13.5L33 12.2 44 7.5 42.6 19.2 39.6 16.4C29.6 28.6 17 35.8 7.4 36.6Z" fill="#102747">

</path><path d="M10.6 41.2C20.4 39.4 31 33 40.8 22.6 41.6 27.2 39.6 30.6 37 33 30 39 21.8 42.6 13.6 43.2Z" fill="#102747">

</path>
</svg>
<span>

<span className="brand-name">
{"BIG "}<span className="b2">
{"INVEST"}
</span>
</span>
<span className="brand-tag">
{"GLOBAL TRADE | BUSINESS SOLUTIONS"}
</span>

</span>

</Link>
<nav className="nav-desktop" aria-label="Main">

<ul className="nav-list">

<li className="nav-item">
<Link className={"nav-link" + (isActive("home") ? ' is-active' : '')} data-nav="home" to="/" aria-current={isActive("home") ? 'page' : undefined}>
{"Home"}
</Link>
</li>
<li className="nav-item">
<Link className={"nav-link" + (isActive("about") ? ' is-active' : '')} data-nav="about" to="/about" aria-current={isActive("about") ? 'page' : undefined}>
{"About Us"}
</Link>
</li>
<li className="nav-item has-dd" onMouseLeave={() => setDropdown(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null); }}>

<Link className={"nav-link" + (isActive("services") ? ' is-active' : '')} data-nav="services" to="/services" aria-current={isActive("services") ? 'page' : undefined}>
{"Services"}
</Link>
<button className="dd-toggle" type="button" aria-expanded={dropdown === "dd-services"} aria-controls="dd-services" aria-label="Show Services menu" onClick={event => { event.stopPropagation(); setDropdown(dropdown === "dd-services" ? null : "dd-services"); }}>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>
</button>
<div className={"dd dd-wide" + (dropdown === "dd-services" ? ' is-open' : '')} id="dd-services">

{data.SERVICES.map(item=><Link className="dd-link" key={item.id} to={`/services/${item.id}`}><span className="dd-ico"><svg className="i" aria-hidden="true"><use href={'#i-'+item.icon}/></svg></span><span><span className="dd-title">{item.title}</span><span className="dd-desc">{item.nav_description||item.short}</span></span></Link>)}







<div className="dd-foot">
<span className="small">
{"Proposed service list — for client approval"}
</span><Link className="link-arrow" to="/services">
{"All services"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</div>

</div>

</li>
<li className="nav-item has-dd" onMouseLeave={() => setDropdown(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null); }}>

<Link className={"nav-link" + (isActive("industries") ? ' is-active' : '')} data-nav="industries" to="/industries" aria-current={isActive("industries") ? 'page' : undefined}>
{"Industries"}
</Link>
<button className="dd-toggle" type="button" aria-expanded={dropdown === "dd-industries"} aria-controls="dd-industries" aria-label="Show Industries menu" onClick={event => { event.stopPropagation(); setDropdown(dropdown === "dd-industries" ? null : "dd-industries"); }}>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>
</button>
<div className={"dd" + (dropdown === "dd-industries" ? ' is-open' : '')} id="dd-industries">

{data.INDUSTRIES.map(item=><Link className="dd-link" key={item.id} to={`/industries/${item.id}`}><span className="dd-ico"><svg className="i" aria-hidden="true"><use href={'#i-'+item.icon}/></svg></span><span>{item.title}</span></Link>)}






<div className="dd-foot">
<Link className="link-arrow" to="/industries">
{"All industries"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</div>

</div>

</li>
<li className="nav-item has-dd" onMouseLeave={() => setDropdown(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null); }}>

<Link className={"nav-link" + (isActive("global-network") ? ' is-active' : '')} data-nav="global-network" to="/global-network" aria-current={isActive("global-network") ? 'page' : undefined}>
{"Global Network"}
</Link>
<button className="dd-toggle" type="button" aria-expanded={dropdown === "dd-network"} aria-controls="dd-network" aria-label="Show Global Network menu" onClick={event => { event.stopPropagation(); setDropdown(dropdown === "dd-network" ? null : "dd-network"); }}>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>
</button>
<div className={"dd" + (dropdown === "dd-network" ? ' is-open' : '')} id="dd-network">

<Link className="dd-link" to="/global-network/overview">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-earth">

</use>
</svg>
</span><span>
<span className="dd-title">
{"Network Overview"}
</span><span className="dd-desc">
{"How we connect markets and partners"}
</span>
</span>
</Link>
<Link className="dd-link" to="/global-network/map">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-map">

</use>
</svg>
</span><span>
<span className="dd-title">
{"Market Connections"}
</span><span className="dd-desc">
{"Explore regions on the interactive map"}
</span>
</span>
</Link>
<Link className="dd-link" to="/global-network/partners">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-network">

</use>
</svg>
</span><span>
<span className="dd-title">
{"Partner Network"}
</span><span className="dd-desc">
{"The partners we work alongside"}
</span>
</span>
</Link>
<Link className="dd-link" to="/global-network/sourcing">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-route">

</use>
</svg>
</span><span>
<span className="dd-title">
{"Sourcing & Distribution"}
</span><span className="dd-desc">
{"Moving products in both directions"}
</span>
</span>
</Link>

</div>

</li>
<li className="nav-item has-dd" onMouseLeave={() => setDropdown(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null); }}>

<Link className={"nav-link" + (isActive("insights") ? ' is-active' : '')} data-nav="insights" to="/insights" aria-current={isActive("insights") ? 'page' : undefined}>
{"Insights"}
</Link>
<button className="dd-toggle" type="button" aria-expanded={dropdown === "dd-insights"} aria-controls="dd-insights" aria-label="Show Insights menu" onClick={event => { event.stopPropagation(); setDropdown(dropdown === "dd-insights" ? null : "dd-insights"); }}>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>
</button>
<div className={"dd dd-right" + (dropdown === "dd-insights" ? ' is-open' : '')} id="dd-insights">

<Link className="dd-link" to="/insights/category/global-trade">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-globe">

</use>
</svg>
</span><span className="dd-title" style={{"alignSelf":"center"}}>
{"Global Trade"}
</span>
</Link>
<Link className="dd-link" to="/insights/category/logistics">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-ship">

</use>
</svg>
</span><span className="dd-title" style={{"alignSelf":"center"}}>
{"Logistics"}
</span>
</Link>
<Link className="dd-link" to="/insights/category/market-insights">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-chart-line">

</use>
</svg>
</span><span className="dd-title" style={{"alignSelf":"center"}}>
{"Market Insights"}
</span>
</Link>
<Link className="dd-link" to="/insights/category/business-growth">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-trending-up">

</use>
</svg>
</span><span className="dd-title" style={{"alignSelf":"center"}}>
{"Business Growth"}
</span>
</Link>
<Link className="dd-link" to="/insights/category/investment">
<span className="dd-ico">
<svg className="i" aria-hidden="true">
<use href="#i-landmark">

</use>
</svg>
</span><span className="dd-title" style={{"alignSelf":"center"}}>
{"Investment"}
</span>
</Link>
<div className="dd-foot">
<Link className="link-arrow" to="/insights/newsletter">
{"Newsletter"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</div>

</div>

</li>
<li className="nav-item">
<Link className={"nav-link" + (isActive("contact") ? ' is-active' : '')} data-nav="contact" to="/contact" aria-current={isActive("contact") ? 'page' : undefined}>
{"Contact"}
</Link>
</li>

</ul>

</nav>
<div className="header-actions">

<div className="header-meta">

<svg className="i" aria-hidden="true">
<use href="#i-globe">

</use>
</svg>
<span>
{"Global Trade"}<br />{"Global Opportunities"}
</span>

</div>
<Link className="btn btn-primary header-cta" to="/contact">
{"Get in Touch"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
<button className="burger" type="button" aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}>

<svg className="i icon-open" aria-hidden="true">
<use href="#i-menu">

</use>
</svg>
<svg className="i icon-close" aria-hidden="true" hidden={true}>
<use href="#i-x">

</use>
</svg>

</button>

</div>

</div>
<div className="mobile-panel" id="mobile-menu" hidden={!mobileOpen}>

<nav className="wrap" aria-label="Mobile">

<div className="m-row">
<Link className={"m-link" + (isActive("home") ? ' is-active' : '')} data-nav="home" to="/" aria-current={isActive("home") ? 'page' : undefined}>
{"Home"}
</Link>
</div>
<div className="m-row">
<Link className={"m-link" + (isActive("about") ? ' is-active' : '')} data-nav="about" to="/about" aria-current={isActive("about") ? 'page' : undefined}>
{"About Us"}
</Link>
</div>
<div className="m-row">
<Link className={"m-link" + (isActive("services") ? ' is-active' : '')} data-nav="services" to="/services" aria-current={isActive("services") ? 'page' : undefined}>
{"Services"}
</Link><button className="m-exp" type="button" aria-expanded={Boolean(groups["m-sub-services"])} aria-controls="m-sub-services" aria-label="Show service links" onClick={() => setGroups(previous => ({ ...previous, "m-sub-services": !previous["m-sub-services"] }))}>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>
</button>
</div>
<div className="m-sub" id="m-sub-services" hidden={!groups["m-sub-services"]}>

{data.SERVICES.map(item=><Link className="m-sublink" key={item.id} to={`/services/${item.id}`}>{item.title}</Link>)}








</div>
<div className="m-row">
<Link className={"m-link" + (isActive("industries") ? ' is-active' : '')} data-nav="industries" to="/industries" aria-current={isActive("industries") ? 'page' : undefined}>
{"Industries"}
</Link><button className="m-exp" type="button" aria-expanded={Boolean(groups["m-sub-industries"])} aria-controls="m-sub-industries" aria-label="Show industry links" onClick={() => setGroups(previous => ({ ...previous, "m-sub-industries": !previous["m-sub-industries"] }))}>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>
</button>
</div>
<div className="m-sub" id="m-sub-industries" hidden={!groups["m-sub-industries"]}>

{data.INDUSTRIES.map(item=><Link className="m-sublink" key={item.id} to={`/industries/${item.id}`}>{item.title}</Link>)}







</div>
<div className="m-row">
<Link className={"m-link" + (isActive("global-network") ? ' is-active' : '')} data-nav="global-network" to="/global-network" aria-current={isActive("global-network") ? 'page' : undefined}>
{"Global Network"}
</Link>
</div>
<div className="m-row">
<Link className={"m-link" + (isActive("insights") ? ' is-active' : '')} data-nav="insights" to="/insights" aria-current={isActive("insights") ? 'page' : undefined}>
{"Insights"}
</Link>
</div>
<div className="m-row">
<Link className={"m-link" + (isActive("contact") ? ' is-active' : '')} data-nav="contact" to="/contact" aria-current={isActive("contact") ? 'page' : undefined}>
{"Contact"}
</Link>
</div>
<div className="stack gap-16" style={{"paddingTop":"22px"}}>

<Link className="btn btn-primary btn-block" to="/contact">
{"Get in Touch"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
<p className="small center">
{"Global Trade · Global Opportunities"}
</p>

</div>

</nav>

</div>

</header>);
}
