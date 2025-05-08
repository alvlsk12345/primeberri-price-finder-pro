
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Используем HashRouter вместо BrowserRouter для предотвращения проблем с полными перезагрузками
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);
