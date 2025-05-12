
import React from 'react';
import { CostCalculator } from "@/components/CostCalculator";
import { ActionButtons } from "@/components/ActionButtons";
import { useSearch } from "@/contexts/SearchContext";

export const ProductDetailsSection: React.FC = () => {
  try {
    // Оборачиваем использование хука в try/catch, чтобы избежать ошибки
    const { selectedProduct, searchQuery } = useSearch();
    
    if (!selectedProduct) {
      return null;
    }
    
    return (
      <div className="mt-6">
        <CostCalculator product={selectedProduct} />
        <ActionButtons product={selectedProduct} query={searchQuery} />
      </div>
    );
  } catch (error) {
    // Если хук useSearch вызывается вне провайдера, просто возвращаем null
    console.log('ProductDetailsSection: Компонент вызван вне контекста SearchProvider');
    return null;
  }
};
