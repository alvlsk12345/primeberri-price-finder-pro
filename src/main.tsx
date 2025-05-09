
import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Используем HashRouter вместо BrowserRouter для предотвращения проблем с полными перезагрузками
// и для сохранения состояния при возвращении с внешних сайтов
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
