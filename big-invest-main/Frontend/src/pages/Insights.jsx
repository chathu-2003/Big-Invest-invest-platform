import { Link, useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import images from '../data/images';
import { useCms } from '../cms/ContentProvider';
import { InsightFilters, FeaturedArticle, ArticleCards } from '../components/common/Content';


import Newsletter from '../components/forms/Newsletter';

export default function Insights() {
const { data } = useCms();
const [page,setPage] = useState(1);
const { category: requestedCategory } = useParams();
const routeCategory = data.CATEGORIES.some(item => item.id === requestedCategory) ? requestedCategory : 'all';
const { pathname } = useLocation();
const [filter, setFilter] = useState({ path: pathname, category: routeCategory, query: '' });
const category = filter.path === pathname ? filter.category : routeCategory;
const query = filter.path === pathname ? filter.query : '';
const setCategory = category => {setPage(1);setFilter({ path: pathname, category, query });};
const setQuery = query => {setPage(1);setFilter({ path: pathname, category, query });};
const clearFilters = () => {setPage(1);setFilter({ path: pathname, category: 'all', query: '' });};
const featuredEnabled = category === 'all' && !query.trim() && data.ARTICLES.length>0;
const showFeatured = featuredEnabled && page===1;
const articleList = data.ARTICLES.filter(article => !(featuredEnabled && article === data.ARTICLES[0]) && (category === 'all' || article.cat === category) && (!query.trim() || (article.title + ' ' + article.excerpt + ' ' + data.CATEGORIES.find(item => item.id === article.cat)?.label).toLowerCase().includes(query.trim().toLowerCase())));
return (<div className="view" data-view="insights" data-title="Insights — BIG INVEST">

<section className="page-hero on-dark" aria-labelledby="insights-title">

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
{"Insights"}
</span>
</nav>
<span className="eyebrow">
{"Insights"}
</span>
<h1 id="insights-title" className="h1" tabIndex="-1">
{"Practical thinking on trade, logistics and growth"}
</h1>
<p className="lead">
{"Guides and perspectives for businesses buying, selling and investing across borders."}
</p>
<p className="tbc">
<svg className="i" aria-hidden="true">
<use href="#i-info">

</use>
</svg>{"Sample articles for the prototype — not published company content"}
</p>

</div>

</div>
<div className="page-hero-stripe" aria-hidden="true">

</div>
<div className="page-hero-media">
<img data-img="sunset" alt="Harbour at sunrise with a container ship and city skyline" width="640" height="368" src={images["sunset"]} />
</div>

</section>
<section className="section bg-soft" aria-labelledby="insights-list-title">

<div className="wrap">

<h2 id="insights-list-title" className="sr-only">
{"Articles"}
</h2>
<div className="sec-row" style={{"alignItems":"center"}}>

<div className="chips" role="group" aria-label="Filter by category" data-render="insight-filters">
<InsightFilters category={category} onChange={setCategory} />
</div>
<form className="search" role="search" data-form="insight-search" onSubmit={event => event.preventDefault()}>

<label className="sr-only" htmlFor="insight-q">
{"Search insights"}
</label>
<svg className="i" aria-hidden="true">
<use href="#i-search">

</use>
</svg>
<input className="input" id="insight-q" type="search" placeholder="Search articles" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} />

</form>

</div>
<p className="sr-only" role="status" aria-live="polite" id="insight-count">
{(articleList.length + (showFeatured ? 1 : 0)) + " articles shown"}
</p>
<div className="mt-32" data-render="insight-featured" hidden={!showFeatured}>
<FeaturedArticle />
</div>
<div className="grid g3 mt-24" data-render="insight-grid">
<ArticleCards entries={articleList.slice((Math.min(page,Math.max(1,Math.ceil(articleList.length/9)))-1)*9,Math.min(page,Math.max(1,Math.ceil(articleList.length/9)))*9)} onClear={clearFilters} />
</div>
{articleList.length>9&&<nav className="btn-row mt-24" aria-label="Article pages"><button className="btn btn-outline btn-sm" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><span className="small">Page {page} of {Math.ceil(articleList.length/9)}</span><button className="btn btn-outline btn-sm" disabled={page>=Math.ceil(articleList.length/9)} onClick={()=>setPage(page+1)}>Next</button></nav>}
</div>

</section>
<section className="section-sm" id="newsletter" aria-labelledby="newsletter-title">

<div className="wrap">

<div className="newsletter-band on-dark">

<div className="split" style={{"alignItems":"center"}}>

<div className="stack gap-12">

<span className="eyebrow">
{"Newsletter"}
</span>
<h2 id="newsletter-title" className="h2">
{"Insights in your inbox"}
</h2>
<p className="lead">
{"Occasional, practical updates on global trade, logistics and investment. No spam."}
</p>

</div>
<Newsletter />

</div>

</div>

</div>

</section>

</div>);
}
