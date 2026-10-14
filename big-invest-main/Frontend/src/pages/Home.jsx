import { useCms } from '../cms/ContentProvider';
import NotFound from './NotFound';
import { Link } from 'react-router-dom';


import { Statistics, IndustryCards } from '../components/common/Content';
import { WorldMap } from '../components/network/WorldMap';



export default function Home() {
const cms = useCms();
const page = cms.pages.home;
if (!page) return <NotFound />;

return (<div className="view home-ref" data-view="home" data-title={page.seo_title || "BIG INVEST — Global Trade | Business Solutions"} data-description={page.seo_description || ''}>

<section className="hero" aria-labelledby="home-title">

<div className="hero-media">

<img data-img="hero" alt="Container ship beneath port cranes at sunrise, with a cargo aircraft climbing over a city skyline" width="1818" height="616" src={page.fields["image039"]} />
<p className="hero-script">
{page.fields["text001"]}<br />{page.fields["text002"]}<svg className="hero-swoosh" viewBox="0 0 220 26" aria-hidden="true">
<path d="M6 20 C 70 8, 140 3, 214 7">

</path>
</svg>
</p>

</div>
<span className="hero-chevron" aria-hidden="true">

</span>
<span className="hero-corner" aria-hidden="true">

</span>
<div className="wrap hero-inner">

<div className="hero-copy">

<span className="eyebrow eyebrow-split">
<span>
<span className="hl">
{page.fields["text003"]}
</span>{page.fields["text004"]}
</span>
</span>
<h1 id="home-title" className="display" tabIndex="-1">
{page.fields["text005"]}<span className="accent-line">
{page.fields["text006"]}
</span>
</h1>
<p className="lead">
{page.fields["text007"]}
</p>
<div className="btn-row">

<Link className="btn btn-primary" to={page.fields["link041"]}>
{page.fields["text008"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link042"]}>

</use>
</svg>
</Link>
<Link className="btn btn-outline" to={page.fields["link043"]}>
{page.fields["text009"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link044"]}>

</use>
</svg>
</Link>

</div>

</div>

</div>

</section>
<section className="ref-values" aria-labelledby="home-values">

<div className="wrap">

<div className="values">

<div className="values-intro">

<span className="eyebrow">
{page.fields["text010"]}
</span>
<h2 id="home-values" className="h2">
{page.fields["text011"]}
</h2>
<p className="small">
{page.fields["text012"]}
</p>

</div>
<div className="value">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link045"]}>

</use>
</svg>
</span><div>
<h3 className="h4">
{page.fields["text013"]}
</h3><p className="small">
{page.fields["text014"]}
</p>
</div>
</div>
<div className="value">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link046"]}>

</use>
</svg>
</span><div>
<h3 className="h4">
{page.fields["text015"]}
</h3><p className="small">
{page.fields["text016"]}
</p>
</div>
</div>
<div className="value">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link047"]}>

</use>
</svg>
</span><div>
<h3 className="h4">
{page.fields["text017"]}
</h3><p className="small">
{page.fields["text018"]}
</p>
</div>
</div>
<div className="value">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link048"]}>

</use>
</svg>
</span><div>
<h3 className="h4">
{page.fields["text019"]}
</h3><p className="small">
{page.fields["text020"]}
</p>
</div>
</div>
<div className="value">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link049"]}>

</use>
</svg>
</span><div>
<h3 className="h4">
{page.fields["text021"]}
</h3><p className="small">
{page.fields["text022"]}
</p>
</div>
</div>
<div className="value">
<span className="badge">
<svg className="i" aria-hidden="true">
<use href={page.fields["link050"]}>

</use>
</svg>
</span><div>
<h3 className="h4">
{page.fields["text023"]}
</h3><p className="small">
{page.fields["text024"]}
</p>
</div>
</div>

</div>

</div>

</section>
<section className="ref-industries" aria-labelledby="home-ind">

<div className="wrap ind-row">

<div className="ind-intro">

<span className="eyebrow">
{page.fields["text025"]}
</span>
<h2 id="home-ind" className="h2">
{page.fields["text026"]}
</h2>
<p className="small">
{page.fields["text027"]}
</p>
<Link className="btn btn-primary btn-sm" to={page.fields["link051"]}>
{page.fields["text028"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link052"]}>

</use>
</svg>
</Link>

</div>
<div className="ind-cards" data-render="home-industries">
<IndustryCards home />
</div>

</div>

</section>
<section className="ref-band" aria-label="Why BIG INVEST and our global network">

<div className="rb-why">

<div className="rb-photo">
<img data-img="coast" alt="Lighthouse on a green coastal headland overlooking the Indian Ocean" width="338" height="471" src={page.fields["image040"]} />
</div>
<div className="rb-panel on-yellow">

<span className="eyebrow">
{page.fields["text029"]}
</span>
<h2 className="h2">
{page.fields["text030"]}<span style={{"display":"block"}}>
{page.fields["text031"]}
</span>
</h2>
<p>
{page.fields["text032"]}
</p>
<Link className="btn btn-white btn-sm" to={page.fields["link053"]}>
{page.fields["text033"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link054"]}>

</use>
</svg>
</Link>

</div>

</div>
<div className="rb-stats">

<div className="why-stats" data-render="stats">
<Statistics />
</div>
<p className="rb-note">
{page.fields["text034"]}
</p>

</div>
<div className="rb-map">

<WorldMap className="map map-solid" role="img" aria-label="Illustrative world map with glowing trade routes radiating from Sri Lanka" data-render="map" data-map="solid" mode="solid" />

</div>
<div className="rb-net">

<h2 className="h3">
{page.fields["text035"]}<span style={{"display":"block"}}>
{page.fields["text036"]}
</span>
</h2>
<p className="small">
{page.fields["text037"]}
</p>
<Link className="btn btn-primary btn-sm" to={page.fields["link055"]}>
{page.fields["text038"]}<svg className="i" aria-hidden="true">
<use href={page.fields["link056"]}>

</use>
</svg>
</Link>

</div>

</section>

</div>);
}
