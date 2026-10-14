import { useParams } from 'react-router-dom';
import { useCms } from '../cms/ContentProvider';
import { renderArticle } from '../components/prototypeMarkup';
import PrototypeFragment from '../components/common/PrototypeFragment';
import NotFound from './NotFound';

export default function ArticleDetail() {
const { data } = useCms();
  const { slug } = useParams();
  const entry = data.ARTICLES.find(item => item.id === slug);
  if (!entry) return <NotFound />;
  return <div className="view" data-view="article" data-title={entry.title + ' — BIG INVEST'}><PrototypeFragment html={renderArticle(slug, data)} /></div>;
}
