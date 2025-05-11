import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/sonner";
import { TestSearch } from './components/TestSearch';

function App() {
  // This helps maintain the component state when navigating
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl font-bold mb-4">Поиск товаров с помощью ИИ</h1>
        
        {/* Добавляем компонент для тестирования поиска */}
        <TestSearch />
        
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="bottom-right" closeButton={true} />
      </div>
    </div>
  );
}

export default App;
