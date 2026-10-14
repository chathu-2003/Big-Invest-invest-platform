import { Navigate, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import Industries from '../pages/Industries';
import IndustryDetail from '../pages/IndustryDetail';
import GlobalNetwork from '../pages/GlobalNetwork';
import Insights from '../pages/Insights';
import ArticleDetail from '../pages/ArticleDetail';
import Contact from '../pages/Contact';
import NotFound from '../pages/NotFound';
import { lazy, Suspense } from 'react';

const AdminApp = lazy(() => import('../admin/AdminApp'));

export default function AppRoutes() {
  return <Routes><Route path="admin/*" element={<Suspense fallback={<div role="status">Loading admin workspace…</div>}><AdminApp /></Suspense>} /><Route element={<MainLayout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="services" element={<Services />} />
    <Route path="services/:slug" element={<ServiceDetail />} />
    <Route path="industries" element={<Industries />} />
    <Route path="industries/:slug" element={<IndustryDetail />} />
    <Route path="global-network" element={<GlobalNetwork />} />
    <Route path="global-network/:section" element={<GlobalNetwork />} />
    <Route path="insights" element={<Insights />} />
    <Route path="insights/newsletter" element={<Insights />} />
    <Route path="insights/category/:category" element={<Insights />} />
    <Route path="insights/:slug" element={<ArticleDetail />} />
    <Route path="contact" element={<Contact />} />
    <Route path="contact/:type" element={<Contact />} />
    <Route path="contact/:type/:topic" element={<Contact />} />
    <Route path="index.html" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
