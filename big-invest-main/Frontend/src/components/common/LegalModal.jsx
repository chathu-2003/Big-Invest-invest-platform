import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Icon } from './Content';

const LegalContext = createContext(null);
// The provider and its consumer hook share the same private context.
// eslint-disable-next-line react-refresh/only-export-components
export const useLegal = () => useContext(LegalContext);
export function LegalProvider({ children }) {
  const [kind, setKind] = useState(null);
  const lastFocus = useRef(null);
  const dialog = useRef(null);
  const close = () => setKind(null);
  const openLegal = value => { lastFocus.current = document.activeElement; setKind(value); };
  useEffect(() => {
    if (!kind) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.querySelector('button').focus();
    const key = event => {
      if (event.key === 'Escape') { event.preventDefault(); setKind(null); }
      if (event.key === 'Tab') {
        const controls = dialog.current.querySelectorAll('button,a[href],input,select,textarea');
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', key); lastFocus.current?.focus(); };
  }, [kind]);
  const title = kind === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
  return <LegalContext.Provider value={{ openLegal }}>
    {children}
    <div className="modal-backdrop" id="legal-modal" hidden={!kind} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <button className="modal-close" type="button" aria-label="Close" onClick={close}><Icon name="x" /></button>
        <span className="pill">Legal</span><h2 id="legal-title" className="h3" style={{ paddingRight: 40 }}>{title}</h2>
        <p className="body" style={{ fontSize: 15 }}>The full <span data-legal-name>{title}</span> will be supplied by BIG INVEST and reviewed by its legal advisers before launch. This prototype does not collect, store or share any personal data.</p>
        <div className="notice notice-info"><Icon name="info" /><span>Placeholder — content to be confirmed by the client.</span></div>
        <div><button className="btn btn-navy btn-sm" type="button" onClick={close}>Close</button></div>
      </div>
    </div>
  </LegalContext.Provider>;
}
