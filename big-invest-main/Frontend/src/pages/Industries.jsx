import { Link } from 'react-router-dom';
import { useState } from 'react';
import images from '../data/images';
import { useCms } from '../cms/ContentProvider';
import { IndustryCards, IndustryFilters } from '../components/common/Content';




export default function Industries() {
const { data } = useCms();
const [group, setGroup] = useState('all');
const industryList = data.INDUSTRIES.filter(item => group === 'all' || item.group === group);
return (<div className="view" data-view="industries" data-title="Industries — BIG INVEST">

<section className="page-hero on-dark" aria-labelledby="industries-title">

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
{"Industries"}
</span>
</nav>
<span className="eyebrow">
{"Industries We Serve"}
</span>
<h1 id="industries-title" className="h1" tabIndex="-1">
{"Sector focus, global perspective"}
</h1>
<p className="lead">
{"From healthcare and consumer goods to commodities and industrial supply, we help businesses source, sell and grow across borders."}
</p>
<div className="btn-row mt-8">

<a className="btn btn-primary" href="#industry-directory">
{"Explore industries"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</a>
<Link className="btn btn-ghost" to="/contact/industry">
{"Discuss your sector"}
</Link>

</div>

</div>

</div>
<div className="page-hero-stripe" aria-hidden="true">

</div>
<div className="page-hero-media">

<div className="mosaic" aria-hidden="true">

<img data-img="pharma" alt="" src={images["pharma"]} /><img data-img="medical" alt="" src={images["medical"]} /><img data-img="cosmetics" alt="" src={images["cosmetics"]} /><img data-img="apparel" alt="" src={images["apparel"]} /><img data-img="commodities" alt="" src={images["commodities"]} /><img data-img="industrial" alt="" src={images["industrial"]} />

</div>

</div>

</section>
<section className="section bg-soft" id="industry-directory" aria-labelledby="ind-dir-title">

<div className="wrap">

<div className="sec-row">

<div className="sec-head">

<span className="eyebrow">
{"Industry Directory"}
</span>
<h2 id="ind-dir-title" className="h2">
{"Choose a sector to see where we can help"}
</h2>

</div>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href="#i-info">

</use>
</svg>{"Industry list subject to client confirmation"}
</p>

</div>
<div className="chips mt-24" role="group" aria-label="Filter industries" data-render="industry-filters">
<IndustryFilters group={group} onChange={setGroup} />
</div>
<p className="sr-only" role="status" aria-live="polite" id="industry-count">
{industryList.length + (industryList.length === 1 ? " industry shown" : " industries shown")}
</p>
<div className="ind-dir mt-24" data-render="industry-grid">
<IndustryCards entries={industryList} />
</div>

</div>

</section>
<section className="section" aria-labelledby="ind-how">

<div className="wrap split">

<div className="stack gap-20">

<span className="eyebrow">
{"Across Every Sector"}
</span>
<h2 id="ind-how" className="h2">
{"The same disciplined approach, adapted to your industry"}
</h2>
<p className="body">
{"Every sector has its own standards, partners and practicalities. We start by understanding yours, then bring in the right suppliers, logistics partners and specialist advisers."}
</p>
<ul className="checks">

<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Requirements captured before any search begins"}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Regulatory questions mapped with qualified local advisers"}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href="#i-check">

</use>
</svg>
</span>{"Partners and suppliers assessed against agreed criteria"}
</li>

</ul>
<div className="btn-row mt-8">
<Link className="btn btn-navy" to="/services">
{"See our services"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
</div>

</div>
<div className="media-stack">

<div className="main">
<img data-img="sunset" alt="Port and city skyline at sunrise over calm water" width="640" height="368" src={images["sunset"]} />
</div>
<div className="float">

<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href="#i-layers">

</use>
</svg>
</span>
<span className="small" style={{"color":"#102747","fontWeight":"700","lineHeight":"1.45"}}>
{"Six focus sectors, plus additional categories on request"}
</span>

</div>

</div>

</div>

</section>
<section className="cta-band section-sm" aria-labelledby="ind-cta">

<div className="wrap cta-grid on-dark">

<div className="stack gap-12">

<span className="eyebrow">
{"Don't see your sector?"}
</span>
<h2 id="ind-cta" className="h2">
{"Tell us what you want to buy, sell or invest in."}
</h2>

</div>
<div className="cta-actions">

<Link className="btn btn-primary" to="/contact/industry">
{"Start a conversation"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>

</div>

</div>

</section>

</div>);
}
