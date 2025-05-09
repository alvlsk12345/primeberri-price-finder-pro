
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export const PageFooter: React.FC = () => {
  return (
    <footer className="mt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <span className="text-brand-red font-bold text-2xl">P</span>
                <span className="text-brand-darkBlue font-bold text-2xl">B</span>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-bold text-brand-red text-sm uppercase tracking-tight">Price</span>
                <span className="font-bold text-brand-darkBlue text-sm uppercase tracking-tight">Finder</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Сервис для поиска и доставки товаров из европейских магазинов по выгодным ценам
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>Сделано с</span>
              <Heart size={16} className="fill-brand-red text-brand-red" />
              <span>командой</span>
              <span className="font-medium">PriceFinder</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-lg">Навигация</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/" className="text-gray-600 hover:text-brand-red transition-colors">Главная</Link>
              <Link to="/how" className="text-gray-600 hover:text-brand-red transition-colors">Как это работает</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-brand-red transition-colors">Тарифы</Link>
              <Link to="/stores" className="text-gray-600 hover:text-brand-red transition-colors">Магазины</Link>
              <Link to="/services" className="text-gray-600 hover:text-brand-red transition-colors">Услуги</Link>
              <Link to="/faq" className="text-gray-600 hover:text-brand-red transition-colors">FAQ</Link>
              <Link to="/reviews" className="text-gray-600 hover:text-brand-red transition-colors">Отзывы</Link>
              <Link to="/contact" className="text-gray-600 hover:text-brand-red transition-colors">Контакты</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-lg">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-brand-red" />
                <a href="mailto:info@pricefinder.ru" className="text-gray-600 hover:text-brand-red transition-colors">
                  info@pricefinder.ru
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-brand-red" />
                <a href="tel:+74951234567" className="text-gray-600 hover:text-brand-red transition-colors">
                  +7 (495) 123-45-67
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-brand-red flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  г. Москва, ул. Примерная, д. 123, офис 456
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} PriceFinder. Все права защищены.
        </div>
      </div>
    </footer>
  );
};
