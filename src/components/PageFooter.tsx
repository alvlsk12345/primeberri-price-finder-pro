
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const PageFooter: React.FC = () => {
  return (
    <footer className="mt-12 pb-8 text-center text-gray-500">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <span>Сделано с</span>
          <Heart size={16} className="fill-red-500 text-red-500" />
          <span>командой</span>
          <Link to="/" className="text-primary hover:underline">
            PriceFinder
          </Link>
        </div>
        <div className="text-xs">
          &copy; {new Date().getFullYear()} PriceFinder. Все права защищены.
        </div>
      </div>
    </footer>
  );
};
