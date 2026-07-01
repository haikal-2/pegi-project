import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TransactionProvider } from './context/TransactionContext'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

// Ini fungsi buat ngejalanin Service Worker dari Vite PWA
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TransactionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TransactionProvider>
  </React.StrictMode>,
)