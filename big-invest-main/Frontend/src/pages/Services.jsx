import { Link } from 'react-router-dom';

import images from '../data/images';

import { ProcessSteps, ServiceCards } from '../components/common/Content';




export default function Services() {

return (<div className="view" data-view="services" data-title="Services — BIG INVEST">

<section className="page-hero on-dark" aria-labelledby="services-title">

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
{"Services"}
</span>
</nav>
<span className="eyebrow">
{"Our Services"}
</span>
<h1 id="services-title" className="h1" tabIndex="-1">
{"Trade and investment solutions, end to end"}
</h1>
<p className="lead">
{"From sourcing and logistics to partnerships and market entry — one coordinated team supporting every step of your international business."}
</p>
<div className="btn-row mt-8">

<Link className="btn btn-primary" to="/contact/services">
{"Enquire Now"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
<a className="btn btn-ghost" href="#services-list">
{"Browse services"}
</a>

</div>

</div>

</div>
<div className="page-hero-stripe" aria-hidden="true">

</div>
<div className="page-hero-media">
<img data-img="cranes" alt="Yellow gantry cranes over stacked containers on a vessel" width="660" height="392" src={images["cranes"]} />
</div>

</section>
<section className="section bg-soft" id="services-list" aria-labelledby="services-list-title">

<div className="wrap">

<div className="sec-row">

<div className="sec-head">

<span className="eyebrow">
{"What We Do"}
</span>
<h2 id="services-list-title" className="h2">
{"Eight ways we help businesses trade and grow"}
</h2>
<p className="body">
{"Choose a service to see what's included, the benefits and how an engagement works."}
</p>

</div>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href="#i-info">

</use>
</svg>{"Proposed service list — for client approval"}
</p>

</div>
<div className="grid g4 mt-32" data-render="services-grid">
<ServiceCards />
</div>

</div>

</section>
<section className="section" aria-labelledby="services-process">

<div className="wrap">

<div className="sec-head center">

<span className="eyebrow">
{"How We Work"}
</span>
<h2 id="services-process" className="h2">
{"A clear process from first call to delivery"}
</h2>

</div>
<div className="steps mt-48" data-render="steps">
<ProcessSteps />
</div>

</div>

</section>
<section className="cta-band section-sm" aria-labelledby="services-cta">

<div className="wrap cta-grid on-dark">

<div className="stack gap-12">

<span className="eyebrow">
{"Not sure where to start?"}
</span>
<h2 id="services-cta" className="h2">
{"Tell us your goal — we'll recommend the right mix."}
</h2>

</div>
<div className="cta-actions">

<Link className="btn btn-primary" to="/contact/services">
{"Enquire Now"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</Link>
<Link className="btn btn-white" to="/industries">
{"Industries we serve"}
</Link>

</div>

</div>

</section>

</div>);
}
