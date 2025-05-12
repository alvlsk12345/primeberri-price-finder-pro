
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/sonner";
import { SearchProvider } from "@/contexts/SearchContext";

function App() {
  // This helps maintain the component state when navigating
  const location = useLocation();
  
  return (
    <>
      {/* Оборачиваем все маршруты в SearchProvider */}
      <SearchProvider>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SearchProvider>
      <Toaster position="bottom-right" closeButton={true} />
    </>
  );
}

export default App;
