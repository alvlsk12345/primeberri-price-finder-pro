import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, Home } from "lucide-react";
export const PageHeader: React.FC = () => {
  // Используем Link вместо тега <a> для предотвращения перезагрузки страницы
  return <header className="bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-90 transition-opacity">
          <span> Поиск товаров для заказа на PrimeBerri</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home size={18} />
              <span>Главная</span>
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings size={18} />
              <span>Настройки</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>;
};