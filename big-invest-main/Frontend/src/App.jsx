import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { LegalProvider } from './components/common/LegalModal';
import { SocialProvider } from './components/common/Content';
import './styles/reference.css';

export default function App() {
  return <BrowserRouter><LegalProvider><SocialProvider><AppRoutes /></SocialProvider></LegalProvider></BrowserRouter>;
}
