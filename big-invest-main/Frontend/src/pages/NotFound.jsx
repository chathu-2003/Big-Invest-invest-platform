import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Content';

export default function NotFound() {
  return <div className="view" data-title="Page not found — BIG INVEST"><section className="page-hero on-dark">
    <div className="page-hero-glow" aria-hidden="true" /><div className="wrap page-hero-inner"><div className="page-hero-copy">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span className="sep">/</span><span aria-current="page">Page not found</span></nav>
      <span className="eyebrow">404</span><h1 className="h1" tabIndex={-1}>We couldn’t find that page</h1>
      <p className="lead">Explore our services and industries, or contact the BIG INVEST team to discuss your next opportunity.</p>
      <div className="btn-row"><Link className="btn btn-primary" to="/">Back to home<Icon name="arrow-right" /></Link><Link className="btn btn-ghost" to="/contact">Contact us</Link></div>
    </div></div></section><section className="section"><div className="wrap grid g3">
      {[['Services', '/services', 'Trade, sourcing, logistics and business development.'], ['Industries', '/industries', 'Find the capabilities relevant to your sector.'], ['Global Network', '/global-network', 'Explore potential connections across international markets.']].map(([title, path, text]) =>
        <Link className="tile card-lift" to={path} key={path} style={{ textDecoration: 'none' }}><h2 className="h3">{title}</h2><p className="body">{text}</p><span className="link-arrow">Explore<Icon name="arrow-right" /></span></Link>)}
    </div></section></div>;
}
