
import React from 'react';
import { CostCalculator } from "@/components/CostCalculator";
import { ActionButtons } from "@/components/ActionButtons";
import { useSearch } from "@/contexts/SearchContext";

export const ProductDetailsSection: React.FC = () => {
  // Используем try/catch для обработки случаев, когда контекст может быть недоступен
  try {
    const { selectedProduct, searchQuery } = useSearch();
    
    if (!selectedProduct) {
      return null;
    }
    
    return (
      <div className="mt-6 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Детали выбранного товара</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CostCalculator product={selectedProduct} />
          <ActionButtons selectedProduct={selectedProduct} searchQuery={searchQuery} />
        </div>
      </div>
    );
  } catch (error) {
    // Возвращаем null, если контекст недоступен
    console.log("ProductDetailsSection: SearchContext недоступен", error);
    return null;
  }
};
