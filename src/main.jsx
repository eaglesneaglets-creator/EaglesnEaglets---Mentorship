import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { validateEnv } from './lib/env'
import { initSentry } from './lib/sentry'

// Initialize Sentry before rendering (no-op if VITE_SENTRY_DSN is not set)
initSentry()

// Validate required environment variables before rendering
validateEnv()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
