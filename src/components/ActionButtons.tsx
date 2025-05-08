
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
};

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

  const handleCopyLink = () => {
    if (selectedProduct) {
      // В реальной реализации здесь будет логика копирования ссылки
      navigator.clipboard.writeText(searchQuery);
      toast.success('Ссылка скопирована!');
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
        Копировать ссылку
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
