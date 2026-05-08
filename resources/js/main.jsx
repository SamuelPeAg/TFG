import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './app'; // Load bootstrap and select2-init
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import '../css/index.css'

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  // Detectar si estamos en una subcarpeta (ej: /public/)
  const basename = window.location.pathname.startsWith('/public') ? '/public' : '';
  
  root.render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>,
  )
}
