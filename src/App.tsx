
import React, { useEffect } from 'react';
import './App.css'
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { SearchProvider } from "@/contexts/SearchContext";
import { initConnectionService } from './services/api/supabase/connectionService';

function App() {
  // Инициализируем сервис проверки соединения при загрузке приложения
  useEffect(() => {
    initConnectionService();
  }, []);

  return (
    <>
      <SearchProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SearchProvider>
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </>
  )
}

export default App;
