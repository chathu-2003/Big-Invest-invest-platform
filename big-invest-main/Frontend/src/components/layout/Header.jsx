import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderMarkup from './HeaderMarkup';

export default function Header() {
  const location = useLocation();
  const [dropdown, setDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groups, setGroups] = useState({});
  const [scrolled, setScrolled] = useState(window.scrollY > 8);
  const root = useRef(null);
  useEffect(() => {
    const close = () => { setDropdown(null); setMobileOpen(false); };
    close();
  }, [location.pathname]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 8);
    const resize = () => { if (window.innerWidth >= 1000) setMobileOpen(false); };
    const click = event => { if (!event.target.closest('.nav-item.has-dd')) setDropdown(null); };
    const key = event => {
      if (event.key !== 'Escape') return;
      if (dropdown) { root.current?.querySelector('.dd-toggle[aria-expanded="true"]')?.focus(); setDropdown(null); }
      else if (mobileOpen) { setMobileOpen(false); root.current?.querySelector('.burger')?.focus(); }
    };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('click', click);
    document.addEventListener('keydown', key);
    return () => { window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize); document.removeEventListener('click', click); document.removeEventListener('keydown', key); };
  }, [dropdown, mobileOpen]);
  return <div ref={root} style={{ display: 'contents' }}><HeaderMarkup {...{ dropdown, setDropdown, mobileOpen, setMobileOpen, groups, setGroups, scrolled }} /></div>;
}
