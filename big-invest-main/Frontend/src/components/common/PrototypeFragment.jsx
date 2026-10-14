import { useNavigate } from 'react-router-dom';

// Only pure renderers of trusted prototype content are passed here. They escape text.
export default function PrototypeFragment({ html }) {
  const navigate = useNavigate();
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} onClick={event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//')) { event.preventDefault(); navigate(href); }
  }} />;
}
