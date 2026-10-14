import { useSyncExternalStore } from 'react';
import images from '../content/images.json';

function subscribe(callback) {
  window.addEventListener('popstate', callback);
  window.addEventListener('big-invest:navigate', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('big-invest:navigate', callback);
  };
}
// Legacy fragment helpers share their route subscription with the components.
// eslint-disable-next-line react-refresh/only-export-components
export function useSelectedEntry(entries, segment) {
  const path = useSyncExternalStore(subscribe, () => window.location.pathname, () => '/');
  const parts = path.split('/').filter(Boolean);
  let slug = parts[1];
  try { slug = decodeURIComponent(slug || ''); } catch { slug = ''; }
  return entries.find(entry => parts[0] === segment && entry.id === slug) || entries[0];
}
export function Icon({ name, className = '' }) {
  return <svg className={`i ${className}`} aria-hidden="true"><use href={`#i-${name}`} /></svg>;
}
export function PageHero({ id, title, eyebrow, lead, image, crumbs, children, className = '' }) {
  return <section className={`page-hero on-dark ${className}`} aria-labelledby={id}>
    <div className="page-hero-glow" aria-hidden="true" />
    <div className="wrap page-hero-inner"><div className="page-hero-copy">
      <nav className="crumbs" aria-label="Breadcrumb">{crumbs.map(([label, href], index) => <span key={`${label}-${index}`}>
        {index > 0 && <span className="sep" aria-hidden="true"> / </span>}
        {href ? <a href={href}>{label}</a> : <span aria-current="page">{label}</span>}
      </span>)}</nav>
      <span className="eyebrow">{eyebrow}</span><h1 id={id} className="h1" tabIndex={-1}>{title}</h1>
      {lead && <p className="lead">{lead}</p>}{children}
    </div></div>
    <div className="page-hero-stripe" aria-hidden="true" />
    <div className="page-hero-media"><img src={images[image]} alt="" /></div>
  </section>;
}
export function Steps({ steps }) {
  return <div className="steps mt-24">{steps.map((step, index) => <div className="step" key={step.title}>
    <span className="step-num">{String(index + 1).padStart(2, '0')}</span>
    <h3 className="h4">{step.title}</h3><p className="small">{step.text}</p>
  </div>)}</div>;
}
export function ArticleCard({ article, category }) {
  return <article className="post-card card-lift"><a className="post-img" href={`/insights/${article.id}`}>
    <img src={images[article.img]} alt="" loading="lazy" /></a><div className="post-body">
    <span className="post-cat">{category}</span><h3 className="h3"><a href={`/insights/${article.id}`}>{article.title}</a></h3>
    <p className="small">{article.excerpt}</p><a className="link-arrow" href={`/insights/${article.id}`}>Read article <Icon name="arrow-right" /></a>
  </div></article>;
}
