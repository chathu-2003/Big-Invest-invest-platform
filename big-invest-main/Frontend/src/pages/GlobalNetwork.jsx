import { useCms } from '../cms/ContentProvider';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import images from '../data/images';

import { ProcessSteps } from '../components/common/Content';
import { WorldMap, RegionChips, RegionDetails } from '../components/network/WorldMap';



export default function GlobalNetwork() {
const { data } = useCms();
const [region, setRegion] = useState('europe');
return (<div className="view" data-view="global-network" data-title="Global Network — BIG INVEST">

<section className="page-hero on-dark" aria-labelledby="network-title">

<div className="page-hero-glow" aria-hidden="true">

</div>
<div className="wrap page-hero-inner">

<div className="page-hero-copy">

<nav className="crumbs" aria-label="Breadcrumb">
<Link to="/">
{"Home"}
</Link><span className="sep" aria-hidden="true">
{"/"}
</span><span aria-current="page">
{"Global Network"}
</span>
</nav>
<span className="eyebrow">
{"Global Network"}
</span>
<h1 id="network-title" className="h1" tabIndex="-1">
{"From Sri Lanka to markets around the world"}
</h1>
<p className="lead">
{"A growing network of partners, suppliers and service providers that helps our clients trade, source and invest with confidence."}
</p>
<div className="btn-row mt-8">

<Link className="btn btn-primary" to="/global-network/map">
{"Explore the map"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
<Link className="btn btn-ghost" to="/contact/partnership">
{"Become a partner"}
</Link>

</div>

</div>

</div>
<div className="page-hero-media is-map">

<WorldMap className="map map-dark" aria-hidden="true" data-render="map" data-map="dark" mode="dark" />

</div>

</section>
<section className="section" id="net-overview" aria-labelledby="net-ov-title">

<div className="wrap">

<div className="sec-head">

<span className="eyebrow">
{"International Opportunities"}
</span>
<h2 id="net-ov-title" className="h2">
{"Three ways our network creates value"}
</h2>

</div>
<div className="grid g3 mt-32">

<article className="tile card-lift">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href="#i-plane">

</use>
</svg>
</span><h3 className="h4">
{"Export growth"}
</h3><p className="small">
{"Helping Sri Lankan producers find qualified buyers, distributors and agents in new markets."}
</p><Link className="link-arrow" to="/services/market-entry">
{"Market entry"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</article>
<article className="tile card-lift">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href="#i-package-check">

</use>
</svg>
</span><h3 className="h4">
{"Smarter sourcing"}
</h3><p className="small">
{"Connecting Sri Lankan businesses with suppliers of the products, equipment and materials they need."}
</p><Link className="link-arrow" to="/services/sourcing">
{"International sourcing"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</article>
<article className="tile card-lift">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href="#i-hand-coins">

</use>
</svg>
</span><h3 className="h4">
{"Investment & partnerships"}
</h3><p className="small">
{"Introducing investors and partners to credible opportunities, and coordinating the steps that follow."}
</p><Link className="link-arrow" to="/services/investment">
{"Investment opportunities"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</article>

</div>

</div>

</section>
<section className="section bg-soft" id="net-map" aria-labelledby="net-map-title">

<div className="wrap">

<div className="sec-row">

<div className="sec-head">

<span className="eyebrow">
{"Market Connections"}
</span>
<h2 id="net-map-title" className="h2">
{"Select a region to explore potential connections"}
</h2>

</div>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href="#i-info">

</use>
</svg>{"Illustrative only — not confirmed offices or trade lanes"}
</p>

</div>
<div className="chips mt-24" role="group" aria-label="Choose a region" data-render="region-chips">
<RegionChips active={region} onSelect={setRegion} />
</div>
<div className="net-grid mt-24" style={{"alignItems":"stretch"}}>

<div className="map-card">

<WorldMap className="map" data-render="map" data-map="interactive" role="img" aria-label="World map showing illustrative routes from Sri Lanka to the selected region" mode="interactive" active={region} onSelect={setRegion} />

</div>
<div className="region-panel on-dark" aria-live="polite" data-render="region-panel">
<RegionDetails active={region} />
</div>

</div>

</div>

</section>
<section className="section" id="net-partners" aria-labelledby="net-partners-title">

<div className="wrap">

<div className="sec-row">

<div className="sec-head">

<span className="eyebrow">
{"Partner Network"}
</span>
<h2 id="net-partners-title" className="h2">
{"The partners we work alongside"}
</h2>
<p className="body">
{"We bring together the right specialists for each engagement, so clients benefit from a wider bench of expertise."}
</p>

</div>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href="#i-info">

</use>
</svg>{"Partner names and logos to be added once confirmed"}
</p>

</div>
<div className="grid g2 mt-32">

{data.PARTNERS.map(partner=><article className="partner" key={partner.id}><span className="badge badge-soft">{partner.img?<img src={partner.img} alt={partner.title} style={{width:36,height:36,objectFit:'contain'}}/>:<svg className="i" aria-hidden="true"><use href={'#i-'+partner.icon}/></svg>}</span><div className="stack gap-12"><h3 className="h4">{partner.title}</h3><p className="small">{partner.overview}</p>{partner.website&&<a className="link-arrow" href={partner.website} target="_blank" rel="noopener noreferrer">Visit website</a>}</div></article>)}




</div>

</div>

</section>
<section className="section bg-soft" aria-labelledby="net-flow-title">

<div className="wrap">

<div className="sec-head center">

<span className="eyebrow">
{"Market Connection Highlights"}
</span>
<h2 id="net-flow-title" className="h2">
{"Trade that flows in both directions"}
</h2>

</div>
<div className="flow mt-48">

<article className="tile">

<span className="pill">
{"Outbound"}
</span>
<h3 className="h3">
{"From Sri Lanka to the world"}
</h3>
<ul className="checks">

<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Buyer and distributor introductions abroad"}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Export readiness and documentation support"}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Freight coordination to destination markets"}
</li>

</ul>

</article>
<div className="flow-mid">

<span className="badge">
<svg className="i" aria-hidden="true">
<use href="#i-route">

</use>
</svg>
</span>
<span>
{"Sri Lanka"}<br /><span className="small" style={{"fontWeight":"600"}}>
{"Coordination hub"}
</span>
</span>

</div>
<article className="tile">

<span className="pill">
{"Inbound"}
</span>
<h3 className="h3">
{"From the world to Sri Lanka"}
</h3>
<ul className="checks">

<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Supplier search for products and equipment"}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Quality checks and sample coordination"}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Import coordination with licensed brokers"}
</li>

</ul>

</article>

</div>

</div>

</section>
<section className="section" id="net-sourcing" aria-labelledby="net-src-title">

<div className="wrap split">

<div className="media-stack">

<div className="main">
<img data-img="plane" alt="Cargo aircraft climbing through a golden morning sky" width="640" height="320" src={images["plane"]} />
</div>
<div className="float">

<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href="#i-boxes">

</use>
</svg>
</span>
<span className="small" style={{"color":"#102747","fontWeight":"700","lineHeight":"1.45"}}>
{"Sea, air and land options compared for every shipment"}
</span>

</div>

</div>
<div className="stack gap-20">

<span className="eyebrow">
{"Strategic Sourcing & Distribution"}
</span>
<h2 id="net-src-title" className="h2">
{"Getting the right products to the right place"}
</h2>
<p className="body">
{"We connect specification, supplier, shipment and sale into one managed flow — so products move efficiently from where they are made to where they are needed."}
</p>
<div className="steps" data-render="sourcing-steps">
<ProcessSteps sourcing />
</div>

</div>

</div>

</section>
<section className="cta-band section-sm" aria-labelledby="net-cta">

<div className="wrap cta-grid on-dark">

<div className="stack gap-12">

<span className="eyebrow">
{"Partnership Enquiries"}
</span>
<h2 id="net-cta" className="h2">
{"Join the BIG INVEST network."}
</h2>
<p className="lead" style={{"maxWidth":"620px"}}>
{"Manufacturers, distributors, logistics providers and investors — we'd like to hear from you."}
</p>

</div>
<div className="cta-actions">

<Link className="btn btn-primary" to="/contact/partnership">
{"Partnership enquiry"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>

</div>

</div>

</section>

</div>);
}
