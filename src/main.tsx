import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './App.css';
import './index.css';

// Polyfill for SockJS and other libraries that expect 'global' to be defined
if (typeof window !== 'undefined' && !(window as any).global) {
  (window as any).global = window;
}

createRoot(document.getElementById('root')!).render(
    <App />
);
