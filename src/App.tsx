
import React from 'react';
import './App.css'
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { SearchProvider } from "@/contexts/SearchContext";

function App() {
  return (
    <>
      <SearchProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SearchProvider>
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </>
  )
}

export default App;
