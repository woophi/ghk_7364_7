import React from 'react';
import ReactDOM from 'react-dom/client';
import 'swiper/css';
import { App } from './App.tsx';
import './index.css';

let root: ReactDOM.Root | null = null;

export const mountApp = () => {
  const rootEl = document.getElementById('root');

  if (!rootEl) {
    return;
  }

  if (!root) {
    root = ReactDOM.createRoot(rootEl);
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};
