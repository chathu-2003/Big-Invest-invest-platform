import { createContext, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import data from '../../data/prototype';
import images from '../../data/images';
import { useCms } from '../../cms/ContentProvider';
const imageSrc = value => images[value] || value || undefined; 

export function Icon({ name, className = '' }) {
  return <svg className={`i ${className}`} aria-hidden="true"><use href={`#i-${name}`} /></svg>;
}
export function Statistics() {
  return data.STATS.map(stat => <div className="stat" key={stat.label}><span className="badge badge-sm"><Icon name={stat.icon} /></span>
    <span className="stat-num">{stat.num}</span><span className="stat-label">{stat.label}<br />{stat.sub}</span></div>);
}
export function ProcessSteps({ sourcing = false }) {
  return (sourcing ? data.SOURCING_STEPS : data.STEPS).map((step, index) => <article className="step" key={step.title}>
    <span className="step-num">{String(index + 1).padStart(2, '0')}</span><h3 className="h4">{step.title}</h3><p className="small">{step.text}</p></article>);
}
export function ServiceCards() {
  const { data } = useCms();
  return data.SERVICES.map(service => <article className="svc-card card-lift" key={service.id}>
    <Link className="media" to={`/services/${service.id}`} tabIndex={-1} aria-hidden="true"><img src={imageSrc(service.img)} alt="" style={service.imgPos ? { objectPosition: service.imgPos } : undefined} /></Link>
    <div className="svc-body"><span className="badge"><Icon name={service.icon} /></span>
      <h3 className="h3"><Link to={`/services/${service.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{service.title}</Link></h3><p className="small">{service.short}</p>
      <ul className="checks">{service.points.map(point => <li key={point}><span className="tick"><Icon name="check" /></span>{point}</li>)}</ul>
      <div className="svc-actions"><Link className="link-arrow" to={`/services/${service.id}`} aria-label={`Learn more about ${service.title}`}>Learn more<Icon name="arrow-right" /></Link>
        <Link className="link-arrow" to={`/contact/${service.type}/${service.id}`} aria-label={`Enquire about ${service.title}`} style={{ color: '#526078' }}>Enquire</Link></div>
    </div></article>);
}
export function IndustryCards({ entries, home = false }) {
  const { data } = useCms();
  entries = entries || data.INDUSTRIES;
  return entries.filter(industry => !home || !industry.plain).map(industry => <Link className={`photo-card${!home && industry.plain ? ' is-plain' : ''}`} to={`/industries/${industry.id}`} key={industry.id}>
    <img src={imageSrc(industry.img)} alt="" /><span className="pc-body"><Icon name={industry.icon} className={home ? 'i-lg' : 'i-xl'} />
      {home ? <span className="pc-row"><span className="pc-txt"><span className="pc-title">{industry.id === 'commodities' ? 'Commodities' : industry.id === 'apparel' ? 'Apparel' : industry.short}</span>
        <span className="pc-text">{industry.tagline}</span></span><span className="arrow-dot"><Icon name="arrow-right" /></span></span> : <>
        <span className="pc-title">{industry.title}</span><span className="pc-desc">{industry.tagline}</span><span className="row" style={{ justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
          <span className="small" style={{ color: '#FFD500', fontWeight: 700 }}>View industry</span><span className="arrow-dot"><Icon name="arrow-right" /></span></span></>}
    </span></Link>);
}
export function IndustryFilters({ group, onChange }) {
  const { data } = useCms();
  return data.IND_GROUPS.map(item => <button className="chip" type="button" data-ind-group={item.id} aria-pressed={group === item.id} onClick={() => onChange(item.id)} key={item.id}>
    {item.label} <span className="count">{item.id === 'all' ? data.INDUSTRIES.length : data.INDUSTRIES.filter(industry => industry.group === item.id).length}</span></button>);
}
export function InsightFilters({ category, onChange }) {
  const { data } = useCms();
  return data.CATEGORIES.map(item => <button className="chip" type="button" data-ins-cat={item.id} aria-pressed={category === item.id} onClick={() => onChange(item.id)} key={item.id}>{item.label}</button>);
}
const categoryLabel = (data, id) => data.CATEGORIES.find(item => item.id === id)?.label || id;
export function ArticleCard({ article }) {
  const { data } = useCms();
  return <Link className="post card-lift" to={`/insights/${article.id}`}><span className="media"><img src={imageSrc(article.img)} alt="" /></span>
    <span className="post-body"><span className="row" style={{ justifyContent: 'space-between', gap: 10 }}><span className="pill">{categoryLabel(data, article.cat)}</span>{article.sample && <span className="tbc">Sample</span>}</span>
      <span className="post-title">{article.title}</span><span className="small">{article.excerpt}</span><span className="meta" style={{ marginTop: 'auto' }}>
        <span><Icon name="clock" />{`${article.read} min read`}</span><span><Icon name="file-text" />{article.sample ? 'Sample article' : article.author || 'BIG INVEST'}</span></span></span></Link>;
}
export function FeaturedArticle() {
  const { data } = useCms();
  const article = data.ARTICLES[0];
  if (!article) return null;
  return <article className="feature card-lift"><Link className="media" to={`/insights/${article.id}`} tabIndex={-1} aria-hidden="true"><img src={imageSrc(article.img)} alt="" /></Link>
    <div className="feat-body"><div className="flag-row"><span className="pill pill-dark">Featured</span><span className="pill">{categoryLabel(data, article.cat)}</span>{article.sample && <span className="tbc">Sample article</span>}</div>
      <h3 className="h2" style={{ fontSize: 'clamp(24px,2.2vw,32px)' }}><Link to={`/insights/${article.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{article.title}</Link></h3>
      <p className="body">{article.excerpt}</p><span className="meta"><span><Icon name="clock" />{`${article.read} min read`}</span></span>
      <div><Link className="btn btn-navy btn-sm" to={`/insights/${article.id}`}>Read article<Icon name="arrow-right" /></Link></div></div></article>;
}
export function ArticleCards({ entries, onClear }) {
  return entries.length ? entries.map(article => <ArticleCard article={article} key={article.id} />) :
    <div className="empty" style={{ gridColumn: '1/-1' }}><span className="badge badge-soft"><Icon name="search" /></span><h3 className="h4">No articles match your search</h3>
      <p className="small">Try a different keyword or category.</p><button className="btn btn-outline btn-sm" type="button" data-clear-insights onClick={onClear}>Clear filters</button></div>;
}
const SocialContext = createContext(null);
export function SocialProvider({ children }) {
  const [selected, setSelected] = useState({});
  return <SocialContext.Provider value={{ selected, setSelected }}>{children}</SocialContext.Provider>;
}
export function SocialButtons({ scope }) {
  const { selected, setSelected } = useContext(SocialContext);
  return data.SOCIALS.map(social => <button className="social" type="button" data-social={social.id} aria-label={social.label} aria-pressed={selected[scope] === social.id}
    onClick={() => setSelected(previous => ({ ...previous, [scope]: previous[scope] === social.id ? null : social.id }))} key={social.id}><Icon name={social.icon} className="i-fill" /></button>);
}
export function SocialNote({ scope }) {
  const { selected } = useContext(SocialContext);
  const social = data.SOCIALS.find(item => item.id === selected[scope]);
  return social ? `${social.label} profile link will be added once BIG INVEST confirms the account.` : null;
}
