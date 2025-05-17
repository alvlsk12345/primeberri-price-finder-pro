
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Link, ExternalLink } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { getProductLink } from "@/services/urlService";
import { Product } from "@/services/types";

type ActionButtonsProps = {
  product: Product;
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({ product }) => {
  const handleGoToPrimeberri = () => {
    if (product) {
      // В реальной реализации здесь будет логика перехода на сайт Primeberri
      window.open('https://primeberri.com/', '_blank');
      toast.success('Переход на сайт Primeberri');
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    // Предотвращаем стандартное поведение для предотвращения перезагрузки страницы
    e.preventDefault();
    
    if (product) {
      // Получаем ссылку на товар из нашего сервиса
      const productLink = getProductLink(product);
      
      navigator.clipboard.writeText(productLink);
      toast.success('Ссылка на товар скопирована!');
      
      // Добавляем логирование для отладки
      console.log(`Скопирована ссылка: ${productLink}`);
      console.log(`Источник товара: ${product.source}`);
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };
  
  // Функция для прямого перехода на страницу товара
  const handleVisitProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (product) {
      const productLink = getProductLink(product);
      
      // Добавляем логирование для отладки
      console.log(`Открываю ссылку в новой вкладке: ${productLink}`);
      console.log(`Источник товара: ${product.source}`);
      
      window.open(productLink, '_blank', 'noopener,noreferrer');
      
      // Показываем уведомление с указанием магазина
      toast.success(`Переход в магазин ${product.source || 'товара'}`);
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };

  // Получаем информацию о типе ссылки для отображения в подсказке
  const isDirectShopLink = (): boolean => {
    return product.link && 
           !product.link.includes('google.com/shopping') && 
           !product.link.includes('shopping.google');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <Button 
        onClick={handleCopyLink} 
        variant="outline" 
        className="flex-1"
      >
        <span className="flex items-center gap-2">
          <Link size={18} /> Копировать ссылку
        </span>
      </Button>
      <Button 
        onClick={handleVisitProduct}
        variant="outline"
        className="flex-1"
      >
        <span className="flex items-center gap-2">
          Перейти к товару <ExternalLink size={18} />
        </span>
      </Button>
      <Button 
        onClick={handleGoToPrimeberri} 
        className="flex-1"
      >
        <span className="flex items-center gap-2">
          Перейти на Primeberri <ArrowRight size={18} />
        </span>
      </Button>
    </div>
  );
};
