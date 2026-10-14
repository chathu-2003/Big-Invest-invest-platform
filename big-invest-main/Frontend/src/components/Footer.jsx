import { Link } from 'react-router-dom';
import { useLegal } from './common/LegalModal';
import { SocialButtons, SocialNote } from './common/Content';
export default function Footer() { const { openLegal } = useLegal(); return (<footer className="site-footer on-yellow ref-footer">

<div className="wrap">

<div className="rf-top">

<Link className="brand" aria-label="BIG INVEST — home" to="/">

<svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
<circle cx="24" cy="24" r="21.5" fill="#FFC900" stroke="#102747" strokeWidth="2.5">

</circle><path d="M5.5 31.5C15 31 27 24.5 36.5 13.5L33 12.2 44 7.5 42.6 19.2 39.6 16.4C29.6 28.6 17 35.8 7.4 36.6Z" fill="#102747">

</path><path d="M10.6 41.2C20.4 39.4 31 33 40.8 22.6 41.6 27.2 39.6 30.6 37 33 30 39 21.8 42.6 13.6 43.2Z" fill="#102747">

</path>
</svg>
<span>

<span className="brand-name">
{"BIG "}<span className="b2">
{"INVEST"}
</span>
</span>
<span className="brand-tag">
{"GLOBAL TRADE | BUSINESS SOLUTIONS"}
</span>

</span>

</Link>
<nav className="rf-nav" aria-label="Footer">

<Link to="/">
{"Home"}
</Link>
<Link to="/about">
{"About Us"}
</Link>
<Link to="/services">
{"Services"}
</Link>
<Link to="/industries">
{"Industries"}
</Link>
<Link to="/global-network">
{"Global Network"}
</Link>
<Link to="/insights">
{"Insights"}
</Link>
<Link to="/contact">
{"Contact"}
</Link>

</nav>
<ul className="rf-contact" aria-label="Contact details">

<li>
<svg className="i" aria-hidden="true">
<use href="#i-phone">

</use>
</svg><Link to="/contact">
<span className="ph">
{"Phone TBC"}
</span>
</Link>
</li>
<li>
<svg className="i" aria-hidden="true">
<use href="#i-mail">

</use>
</svg><Link to="/contact">
<span className="ph">
{"Email TBC"}
</span>
</Link>
</li>
<li>
<svg className="i" aria-hidden="true">
<use href="#i-map-pin">

</use>
</svg><span>
{"Colombo, Sri Lanka"}
</span>
</li>

</ul>
<div className="socials" data-render="socials">
<SocialButtons scope="footer" />
</div>

</div>
<p className="social-note" role="status" aria-live="polite">
<SocialNote scope="footer" />
</p>
<div className="rf-bottom">

<p>
{"© "}<span data-year={true}>
{new Date().getFullYear()}
</span>{" BIG INVEST (PVT) LTD. All Rights Reserved."}
</p>
<div className="rf-legal">

<button className="text-btn" type="button" data-legal="privacy" onClick={() => openLegal("privacy")}>
{"Privacy Policy"}
</button>
<span aria-hidden="true">
{"|"}
</span>
<button className="text-btn" type="button" data-legal="terms" onClick={() => openLegal("terms")}>
{"Terms & Conditions"}
</button>

</div>

</div>

</div>

</footer>); }
