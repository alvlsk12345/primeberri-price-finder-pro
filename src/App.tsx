
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
