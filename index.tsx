import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SystemProvider } from './context/SystemContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <SystemProvider>
      <App />
    </SystemProvider>
  </React.StrictMode>
);