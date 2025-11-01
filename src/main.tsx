import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. ' + 'Make sure there is an element with id="root" in your HTML.'
  );
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Get the base path from the current location
    const basePath = import.meta.env.BASE_URL || '/';
    const swPath = `${basePath}sw.js`.replace(/\/+/g, '/'); // Normalize multiple slashes
    
    navigator.serviceWorker
      .register(swPath, { scope: basePath })
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
