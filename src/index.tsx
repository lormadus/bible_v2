import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Ensure .tsx extension for Vite if needed, or App if auto-resolve works

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
