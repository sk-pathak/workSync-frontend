import './lib/polyfills';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './App.css';
import './index.css';
import 'primereact/resources/themes/lara-dark-purple/theme.css';
import 'primereact/resources/primereact.min.css';


createRoot(document.getElementById('root')!).render(
    <App />
);
