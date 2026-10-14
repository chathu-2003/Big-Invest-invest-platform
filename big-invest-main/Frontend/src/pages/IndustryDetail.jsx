import { useParams } from 'react-router-dom';
import { useCms } from '../cms/ContentProvider';
import { renderIndustry } from '../components/prototypeMarkup';
import PrototypeFragment from '../components/common/PrototypeFragment';
import NotFound from './NotFound';

export default function IndustryDetail() {
const { data } = useCms();
  const { slug } = useParams();
  const entry = data.INDUSTRIES.find(item => item.id === slug);
  if (!entry) return <NotFound />;
  return <div className="view" data-view="industry" data-title={entry.title + ' — BIG INVEST'}><PrototypeFragment html={renderIndustry(slug, data)} /></div>;
}
