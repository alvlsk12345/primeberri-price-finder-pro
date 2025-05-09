
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Home, Settings, Search, User } from "lucide-react";

export const PageHeader: React.FC = () => {
  return (
    <header className="bg-brand-lightBlue shadow-sm py-4 border-b border-white/20">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="flex items-center">
            <span className="text-brand-red font-bold text-3xl">P</span>
            <span className="text-brand-darkBlue font-bold text-3xl">B</span>
          </div>
          <div className="flex flex-col -space-y-1 text-left">
            <span className="font-bold text-brand-red text-sm uppercase tracking-tight">Price</span>
            <span className="font-bold text-brand-darkBlue text-sm uppercase tracking-tight">Finder</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-5 text-foreground">
          <Link to="/" className="font-medium text-sm hover:text-brand-red transition-colors">
            Как это работает
          </Link>
          <Link to="/pricing" className="font-medium text-sm hover:text-brand-red transition-colors">
            Тарифы
          </Link>
          <Link to="/stores" className="font-medium text-sm hover:text-brand-red transition-colors">
            Магазины
          </Link>
          <Link to="/services" className="font-medium text-sm hover:text-brand-red transition-colors">
            Услуги
          </Link>
          <Link to="/faq" className="font-medium text-sm hover:text-brand-red transition-colors">
            FAQ
          </Link>
          <Link to="/reviews" className="font-medium text-sm hover:text-brand-red transition-colors">
            Отзывы
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/20 hover:text-brand-red">
            <User size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/20 hover:text-brand-red">
            <ShoppingBag size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};
