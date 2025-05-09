
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, Home } from "lucide-react";

export const PageHeader: React.FC = () => {
  // Используем Link вместо тега <a> для предотвращения перезагрузки страницы
  return <header className="bg-brand text-brand-foreground shadow-sm">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-90 transition-opacity">
          <a href="https://primeberri.com/" target="_blank" rel="noopener noreferrer">
            <img 
              src="/lovable-uploads/d8c27061-2512-430e-8d4b-3f4e2f580be1.png" 
              alt="Primeberri Logo" 
              className="h-8 w-auto"
            />
          </a>
          <span>Поиск товаров для заказа на PrimeBerri</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home size={18} />
              <span>Главная</span>
            </Link>
          </Button>
          
          <Button variant="brand-outline" size="sm" asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings size={18} />
              <span>Настройки</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>;
};
