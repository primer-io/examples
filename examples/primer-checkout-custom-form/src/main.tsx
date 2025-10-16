import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles.css';
import { loadPrimer } from '@primer-io/primer-js';

(async function () {
  await loadPrimer();
})();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
