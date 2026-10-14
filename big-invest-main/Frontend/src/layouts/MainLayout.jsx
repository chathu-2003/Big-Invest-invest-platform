
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from '../components/Footer';
import IconSprite from '../components/common/IconSprite';
import ScrollBehavior from '../components/common/ScrollBehavior';
import LegacyHashRouting from '../components/common/LegacyHashRouting';
import { ContentProvider } from '../cms/ContentProvider';

function MainLayout() {
  return (
    <ContentProvider><div className="bi-page">
      <IconSprite />
      <LegacyHashRouting />
      <a className="skip-link" href="#main" onClick={() => requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }))}>Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}><Outlet /></main>
      <Footer />
      <ScrollBehavior />
    </div></ContentProvider>
  );
}

export default MainLayout;
