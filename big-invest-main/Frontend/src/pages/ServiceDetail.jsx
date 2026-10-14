import { useParams } from 'react-router-dom';
import { useCms } from '../cms/ContentProvider';
import { renderService } from '../components/prototypeMarkup';
import PrototypeFragment from '../components/common/PrototypeFragment';
import NotFound from './NotFound';

export default function ServiceDetail() {
const { data } = useCms();
  const { slug } = useParams();
  const entry = data.SERVICES.find(item => item.id === slug);
  if (!entry) return <NotFound />;
  return <div className="view" data-view="service" data-title={entry.title + ' — BIG INVEST'}><PrototypeFragment html={renderService(slug, data)} /></div>;
}
