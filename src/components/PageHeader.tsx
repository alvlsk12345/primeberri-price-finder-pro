
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';

export const PageHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          EuroShop Сравнение
        </Link>
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            <Settings size={18} className="mr-2" />
            Настройки
          </Button>
        </Link>
      </div>
    </header>
  );
};
