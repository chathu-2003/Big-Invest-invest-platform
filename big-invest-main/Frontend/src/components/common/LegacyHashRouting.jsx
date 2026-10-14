import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LegacyHashRouting() {
  const navigate = useNavigate();
  useEffect(() => {
    const migrate = () => {
      if (window.location.hash.startsWith('#/')) navigate(window.location.hash.slice(1), { replace: true });
    };
    migrate();
    window.addEventListener('hashchange', migrate);
    return () => window.removeEventListener('hashchange', migrate);
  }, [navigate]);
  return null;
}
