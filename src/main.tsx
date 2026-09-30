import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  const envUrl = (import.meta as any).env?.VITE_SERVER_URL;
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    (window as any).__VITE_SERVER_URL__ = envUrl.trim();
  } else if (!isLocalDev) {
    // Default production multiplayer server for deployed game
    (window as any).__VITE_SERVER_URL__ = 'https://battlezone-magura.onrender.com';
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
