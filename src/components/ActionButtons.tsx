import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Link } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { getProductLink } from "@/services/urlService";
import { Product } from "@/services/types";

type ActionButtonsProps = {
  selectedProduct: Product | null;
  searchQuery: string;
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  selectedProduct,
  searchQuery 
}) => {
  const handleGoToPrimeberri = () => {
    if (selectedProduct) {
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
    
    if (selectedProduct) {
      // Получаем ссылку на товар из нашего сервиса
      const productLink = getProductLink(selectedProduct);
      
      navigator.clipboard.writeText(productLink);
      toast.success('Ссылка на товар скопирована!');
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
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
