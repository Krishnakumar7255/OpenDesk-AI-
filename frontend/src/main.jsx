import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

// Entry point only: app logic lives in App.jsx and feature modules.
createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
