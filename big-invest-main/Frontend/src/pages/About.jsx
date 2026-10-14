import { useCms } from '../cms/ContentProvider';
import NotFound from './NotFound';
import { Link } from 'react-router-dom';


import { Statistics } from '../components/common/Content';




export default function About() {
const cms = useCms();
const page = cms.pages.about;
if (!page) return <NotFound />;

return (<div className="view" data-view="about" data-title={page.seo_title || "About Us — BIG INVEST"} data-description={page.seo_description || ''}>

<section className="page-hero on-dark" aria-labelledby="about-title">

<div className="page-hero-glow" aria-hidden="true">

</div>
<div className="wrap page-hero-inner">

<div className="page-hero-copy">

<nav className="crumbs" aria-label="Breadcrumb">
<Link to={page.fields["link106"]}>
{page.fields["text001"]}
</Link><span className="sep" aria-hidden="true">
{page.fields["text002"]}
</span><span aria-current="page">
{page.fields["text003"]}
</span>
</nav>
<span className="eyebrow">
{page.fields["text004"]}
</span>
<h1 id="about-title" className="h1" tabIndex="-1">
{page.fields["text005"]}
</h1>
<p className="lead">
{page.fields["text006"]}
</p>
<div className="btn-row mt-8">

<Link className="btn btn-primary" to={page.fields["link107"]}>
{page.fields["text007"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link108"]}>

</use>
</svg>
</Link>
<Link className="btn btn-ghost" to={page.fields["link109"]}>
{page.fields["text008"]}
</Link>

</div>

</div>

</div>
<div className="page-hero-stripe" aria-hidden="true">

</div>
<div className="page-hero-media">
<img data-img="skyline" alt="Modern city skyline and container terminal at sunrise" width="888" height="360" src={page.fields["image102"]} />
</div>

</section>
<section className="section" aria-labelledby="about-who">

<div className="wrap split">

<div className="about-media">

<div className="frame">
<img data-img="ship" alt="Fully loaded container ship alongside port cranes" width="800" height="540" src={page.fields["image103"]} />
</div>
<div className="about-badge">

<p className="script">
{page.fields["text009"]}
</p>
<p className="small" style={{"color":"#C9D3E1","marginTop":"8px"}}>
{page.fields["text010"]}
</p>

</div>

</div>
<div className="stack gap-20">

<span className="eyebrow">
{page.fields["text011"]}
</span>
<h2 id="about-who" className="h2">
{page.fields["text012"]}
</h2>
<p className="body">
{page.fields["text013"]}
</p>
<p className="body">
{page.fields["text014"]}
</p>
<ul className="checks">

<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link110"]}>

</use>
</svg>
</span>{page.fields["text015"]}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link111"]}>

</use>
</svg>
</span>{page.fields["text016"]}
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link112"]}>

</use>
</svg>
</span>{page.fields["text017"]}
</li>

</ul>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href={page.fields["link113"]}>

</use>
</svg>{page.fields["text018"]}
</p>

</div>

</div>

</section>
<section className="section bg-soft" aria-labelledby="about-vm">

<div className="wrap">

<div className="sec-row">

<div className="sec-head">

<span className="eyebrow">
{page.fields["text019"]}
</span>
<h2 id="about-vm" className="h2">
{page.fields["text020"]}
</h2>

</div>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href={page.fields["link114"]}>

</use>
</svg>{page.fields["text021"]}
</p>

</div>
<div className="grid cols-2 mt-32">

<article className="vm-card vm-navy on-dark">

<span className="badge badge-glass">
<svg className="i" aria-hidden="true">
<use href={page.fields["link115"]}>

</use>
</svg>
</span>
<span className="eyebrow">
{page.fields["text022"]}
</span>
<p className="statement">
{page.fields["text023"]}
</p>

</article>
<article className="vm-card vm-yellow on-yellow">

<span className="badge badge-navy">
<svg className="i" aria-hidden="true">
<use href={page.fields["link116"]}>

</use>
</svg>
</span>
<span className="eyebrow">
{page.fields["text024"]}
</span>
<p className="statement">
{page.fields["text025"]}
</p>

</article>

</div>

</div>

</section>
<section className="section" aria-labelledby="about-obj">

<div className="wrap">

<div className="sec-head">

<span className="eyebrow">
{page.fields["text026"]}
</span>
<h2 id="about-obj" className="h2">
{page.fields["text027"]}
</h2>

</div>
<div className="grid g4 mt-32">

<article className="tile">
<span className="big-num">
{page.fields["text028"]}
</span><h3 className="h4">
{page.fields["text029"]}
</h3><p className="small">
{page.fields["text030"]}
</p>
</article>
<article className="tile">
<span className="big-num">
{page.fields["text031"]}
</span><h3 className="h4">
{page.fields["text032"]}
</h3><p className="small">
{page.fields["text033"]}
</p>
</article>
<article className="tile">
<span className="big-num">
{page.fields["text034"]}
</span><h3 className="h4">
{page.fields["text035"]}
</h3><p className="small">
{page.fields["text036"]}
</p>
</article>
<article className="tile">
<span className="big-num">
{page.fields["text037"]}
</span><h3 className="h4">
{page.fields["text038"]}
</h3><p className="small">
{page.fields["text039"]}
</p>
</article>

</div>

</div>

</section>
<section className="section bg-soft" aria-labelledby="about-lead">

<div className="wrap split" style={{"gridTemplateColumns":"minmax(0,.8fr) minmax(0,1.2fr)"}}>

<div className="portrait on-dark">

<img data-img="mapDark" alt="" width="1240" height="560" src={page.fields["image104"]} />
<span className="ring">
<svg className="i" aria-hidden="true">
<use href={page.fields["link117"]}>

</use>
</svg>
</span>
<span className="tbc">
{page.fields["text040"]}
</span>

</div>
<div className="stack gap-20">

<span className="eyebrow">
{page.fields["text041"]}
</span>
<h2 id="about-lead" className="h2">
{page.fields["text042"]}
</h2>
<svg className="i quote-icon" aria-hidden="true">
<use href={page.fields["link118"]}>

</use>
</svg>
<p className="quote-ph">
<span className="ph">
{page.fields["text043"]}
</span>
</p>
<div>

<p className="h4">
<span className="ph">
{page.fields["text044"]}
</span>
</p>
<p className="small">
<span className="ph">
{page.fields["text045"]}
</span>{page.fields["text046"]}
</p>

</div>

</div>

</div>

</section>
<section className="section bg-navy on-dark" aria-labelledby="about-values">

<div className="wrap">

<div className="sec-head center">

<span className="eyebrow">
{page.fields["text047"]}
</span>
<h2 id="about-values" className="h2">
{page.fields["text048"]}
</h2>
<p className="lead">
{page.fields["text049"]}
</p>

</div>
<div className="grid g3 mt-48">

<article className="tile tile-dark">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link119"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text050"]}
</h3><p className="small">
{page.fields["text051"]}
</p>
</article>
<article className="tile tile-dark">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link120"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text052"]}
</h3><p className="small">
{page.fields["text053"]}
</p>
</article>
<article className="tile tile-dark">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link121"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text054"]}
</h3><p className="small">
{page.fields["text055"]}
</p>
</article>
<article className="tile tile-dark">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link122"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text056"]}
</h3><p className="small">
{page.fields["text057"]}
</p>
</article>
<article className="tile tile-dark">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link123"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text058"]}
</h3><p className="small">
{page.fields["text059"]}
</p>
</article>
<article className="tile tile-dark">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link124"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text060"]}
</h3><p className="small">
{page.fields["text061"]}
</p>
</article>

</div>

</div>

</section>
<section className="section" aria-labelledby="about-why">

<div className="wrap split">

<div className="media-stack">

<div className="main">
<img data-img="dock" alt="Stacked shipping containers and gantry cranes at a waterfront terminal" width="428" height="300" src={page.fields["image105"]} />
</div>
<div className="float">

<span className="badge badge-sm">
<svg className="i" aria-hidden="true">
<use href={page.fields["link125"]}>

</use>
</svg>
</span>
<span className="small" style={{"color":"#102747","fontWeight":"700","lineHeight":"1.45"}}>
{page.fields["text062"]}
</span>

</div>

</div>
<div className="stack gap-20">

<span className="eyebrow">
{page.fields["text063"]}
</span>
<h2 id="about-why" className="h2">
{page.fields["text064"]}
</h2>
<ul className="reasons">

<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link126"]}>

</use>
</svg>
</span><div>
<p className="r-title">
{page.fields["text065"]}
</p><p className="r-text">
{page.fields["text066"]}
</p>
</div>
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link127"]}>

</use>
</svg>
</span><div>
<p className="r-title">
{page.fields["text067"]}
</p><p className="r-text">
{page.fields["text068"]}
</p>
</div>
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link128"]}>

</use>
</svg>
</span><div>
<p className="r-title">
{page.fields["text069"]}
</p><p className="r-text">
{page.fields["text070"]}
</p>
</div>
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link129"]}>

</use>
</svg>
</span><div>
<p className="r-title">
{page.fields["text071"]}
</p><p className="r-text">
{page.fields["text072"]}
</p>
</div>
</li>
<li>
<span className="tick">
<svg className="i" aria-hidden="true">
<use href={page.fields["link130"]}>

</use>
</svg>
</span><div>
<p className="r-title">
{page.fields["text073"]}
</p><p className="r-text">
{page.fields["text074"]}
</p>
</div>
</li>

</ul>

</div>

</div>

</section>
<section className="section bg-soft" aria-labelledby="about-cap">

<div className="wrap">

<div className="sec-row">

<div className="sec-head">

<span className="eyebrow">
{page.fields["text075"]}
</span>
<h2 id="about-cap" className="h2">
{page.fields["text076"]}
</h2>

</div>
<Link className="link-arrow" to={page.fields["link131"]}>
{page.fields["text077"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link132"]}>

</use>
</svg>
</Link>

</div>
<div className="grid g3 mt-32">

<Link className="tile card-lift" style={{"textDecoration":"none"}} to={page.fields["link133"]}>
<span className="badge badge-soft">
<svg className="i" aria-hidden="true">
<use href={page.fields["link134"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text078"]}
</h3><p className="small">
{page.fields["text079"]}
</p><span className="link-arrow">
{page.fields["text080"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link135"]}>

</use>
</svg>
</span>
</Link>
<Link className="tile card-lift" style={{"textDecoration":"none"}} to={page.fields["link136"]}>
<span className="badge badge-soft">
<svg className="i" aria-hidden="true">
<use href={page.fields["link137"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text081"]}
</h3><p className="small">
{page.fields["text082"]}
</p><span className="link-arrow">
{page.fields["text083"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link138"]}>

</use>
</svg>
</span>
</Link>
<Link className="tile card-lift" style={{"textDecoration":"none"}} to={page.fields["link139"]}>
<span className="badge badge-soft">
<svg className="i" aria-hidden="true">
<use href={page.fields["link140"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text084"]}
</h3><p className="small">
{page.fields["text085"]}
</p><span className="link-arrow">
{page.fields["text086"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link141"]}>

</use>
</svg>
</span>
</Link>
<Link className="tile card-lift" style={{"textDecoration":"none"}} to={page.fields["link142"]}>
<span className="badge badge-soft">
<svg className="i" aria-hidden="true">
<use href={page.fields["link143"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text087"]}
</h3><p className="small">
{page.fields["text088"]}
</p><span className="link-arrow">
{page.fields["text089"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link144"]}>

</use>
</svg>
</span>
</Link>
<Link className="tile card-lift" style={{"textDecoration":"none"}} to={page.fields["link145"]}>
<span className="badge badge-soft">
<svg className="i" aria-hidden="true">
<use href={page.fields["link146"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text090"]}
</h3><p className="small">
{page.fields["text091"]}
</p><span className="link-arrow">
{page.fields["text092"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link147"]}>

</use>
</svg>
</span>
</Link>
<Link className="tile card-lift" style={{"textDecoration":"none"}} to={page.fields["link148"]}>
<span className="badge badge-soft">
<svg className="i" aria-hidden="true">
<use href={page.fields["link149"]}>

</use>
</svg>
</span><h3 className="h4">
{page.fields["text093"]}
</h3><p className="small">
{page.fields["text094"]}
</p><span className="link-arrow">
{page.fields["text095"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link150"]}>

</use>
</svg>
</span>
</Link>

</div>

</div>

</section>
<section className="section-sm" aria-label="BIG INVEST at a glance">

<div className="wrap">

<div className="stats-card">

<div className="why-stats" data-render="stats">
<Statistics />
</div>
<p className="tbc" style={{"alignSelf":"center"}}>
<svg className="i" aria-hidden="true">
<use href={page.fields["link151"]}>

</use>
</svg>{page.fields["text096"]}
</p>

</div>

</div>

</section>
<section className="cta-band section-sm" aria-labelledby="about-cta">

<div className="wrap cta-grid on-dark">

<div className="stack gap-12">

<span className="eyebrow">
{page.fields["text097"]}
</span>
<h2 id="about-cta" className="h2">
{page.fields["text098"]}
</h2>
<p className="lead" style={{"maxWidth":"620px"}}>
{page.fields["text099"]}
</p>

</div>
<div className="cta-actions">

<Link className="btn btn-primary" to={page.fields["link152"]}>
{page.fields["text100"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link153"]}>

</use>
</svg>
</Link>
<Link className="btn btn-white" to={page.fields["link154"]}>
{page.fields["text101"]}
</Link>

</div>

</div>

</section>

</div>);
}
