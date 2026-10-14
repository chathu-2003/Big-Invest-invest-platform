import { Link, useNavigate } from 'react-router-dom';

import images from '../data/images';

import { SocialButtons, SocialNote } from '../components/common/Content';

import EnquiryForm from '../components/forms/EnquiryForm';


export default function Contact() {
const navigate = useNavigate();
return (<div className="view" data-view="contact" data-title="Contact — BIG INVEST">

<section className="page-hero on-dark" aria-labelledby="contact-title">

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
{"Contact"}
</span>
</nav>
<span className="eyebrow">
{"Contact Us"}
</span>
<h1 id="contact-title" className="h1" tabIndex="-1">
{"Let's talk about your next market"}
</h1>
<p className="lead">
{"Whether you're sourcing, selling, shipping or investing, tell us what you need and the right person will get back to you."}
</p>

</div>

</div>
<div className="page-hero-stripe" aria-hidden="true">

</div>
<div className="page-hero-media">
<img data-img="plane" alt="Cargo aircraft in a golden morning sky" width="640" height="320" src={images["plane"]} />
</div>

</section>
<section className="section bg-soft" aria-labelledby="contact-form-title">

<div className="wrap contact-grid">

<div className="form-card" id="enquiry">

<div data-render="contact-form-area">
<EnquiryForm />
</div>

</div>
<aside className="stack gap-20" aria-label="Contact details">

<div className="side-card" style={{"padding":"8px 26px"}}>

<div className="info-item">
<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href="#i-phone">

</use>
</svg>
</span><div>
<p className="info-label">
{"Phone"}
</p><p className="info-value">
<span className="ph">
{"Phone number — TBC"}
</span>
</p>
</div>
</div>
<div className="info-item">
<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href="#i-mail">

</use>
</svg>
</span><div>
<p className="info-label">
{"Email"}
</p><p className="info-value">
<span className="ph">
{"Email address — TBC"}
</span>
</p>
</div>
</div>
<div className="info-item">
<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href="#i-map-pin">

</use>
</svg>
</span><div>
<p className="info-label">
{"Office"}
</p><p className="info-value">
<span className="ph">
{"Office address"}
</span><br />{"Colombo, Sri Lanka"}
</p>
</div>
</div>
<div className="info-item">
<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href="#i-clock">

</use>
</svg>
</span><div>
<p className="info-label">
{"Business hours"}
</p><p className="info-value">
<span className="ph">
{"Hours — TBC"}
</span>
</p>
</div>
</div>

</div>
<div className="partner-card on-yellow">

<span className="badge badge-navy">
<svg className="i" aria-hidden="true">
<use href="#i-handshake">

</use>
</svg>
</span>
<h2 className="h3">
{"Partnership enquiries"}
</h2>
<p className="small">
{"Manufacturers, distributors, logistics providers and investors interested in working with BIG INVEST."}
</p>
<div>
<button className="btn btn-navy btn-sm" type="button" data-action="preset-partnership" onClick={() => navigate('/contact/partnership')}>
{"Start a partnership enquiry"}<svg className="i" aria-hidden="true">
<use href="#i-arrow-right">

</use>
</svg>
</button>
</div>

</div>
<div className="side-card stack gap-12">

<h2 className="h4">
{"Follow BIG INVEST"}
</h2>
<div className="socials" data-render="socials">
<SocialButtons scope="contact" />
</div>
<p className="small social-note" role="status" aria-live="polite">
<SocialNote scope="contact" />
</p>

</div>

</aside>

</div>

</section>
<section className="section-sm" aria-labelledby="contact-map-title">

<div className="wrap">

<div className="map-ph">

<div className="map-box" aria-hidden="true">

<img data-img="mapLight" alt="" width="1240" height="560" src={images["mapLight"]} />
<span className="pin" style={{"left":"72.02%","top":"66.43%"}}>
<svg className="i">
<use href="#i-map-pin">

</use>
</svg>
</span>

</div>
<div className="ph-card">

<span className="eyebrow">
{"Our Office"}
</span>
<h2 id="contact-map-title" className="h3">
{"Colombo, Sri Lanka"}
</h2>
<p className="small">
{"An interactive map will be embedded here once the office address is confirmed."}
</p>
<span className="tbc">
<svg className="i" aria-hidden="true">
<use href="#i-info">

</use>
</svg>{"Map placeholder"}
</span>

</div>

</div>

</div>

</section>

</div>);
}
