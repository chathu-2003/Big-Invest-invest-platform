import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from './Content';

export default function ScrollBehavior() {
  const location = useLocation();
  const first = useRef(true);
  const [visible, setVisible] = useState(window.scrollY >= 640);
  useEffect(() => {
    const updateMetadata = () => {
      const view = document.querySelector('main .view');
      document.title = view?.dataset.title || 'BIG INVEST';
      let description = document.querySelector('meta[name="description"]');
      if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.appendChild(description); }
      description.content = view?.dataset.description || 'BIG INVEST — Global Trade | Business Solutions';
    };
    const observer = new MutationObserver(updateMetadata);
    const main = document.getElementById('main');
    if (main) observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-title', 'data-description'] });
    updateMetadata();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const scroll = () => setVisible(window.scrollY >= 640);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useLayoutEffect(() => {
    const view = document.querySelector('main .view');
    document.title = view?.dataset.title || 'BIG INVEST';
    const parts = location.pathname.split('/').filter(Boolean);
    const section = parts[0] === 'global-network' && parts[1] ? `net-${parts[1]}` : parts[0] === 'insights' && parts[1] === 'newsletter' ? 'newsletter' : parts[0] === 'contact' && parts[1] ? 'enquiry' : null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      const target = section && document.getElementById(section);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (!first.current) view?.querySelector('h1')?.focus({ preventScroll: true });
      }
      first.current = false;
    }, section ? 30 : 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);
  return <button className="to-top" type="button" aria-label="Back to top" hidden={!visible} onClick={() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  }}><Icon name="arrow-up" /></button>;
}
