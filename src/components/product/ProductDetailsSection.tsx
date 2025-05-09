
import React from 'react';
import { CostCalculator } from "@/components/CostCalculator";
import { ActionButtons } from "@/components/ActionButtons";
import { useSearch } from "@/contexts/SearchContext";

export const ProductDetailsSection: React.FC = () => {
  const { selectedProduct, searchQuery } = useSearch();

  if (!selectedProduct) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Расчет стоимости:</h2>
      <CostCalculator product={selectedProduct} />
      
      <ActionButtons 
        selectedProduct={selectedProduct}
        searchQuery={searchQuery}
      />
    </div>
  );
};
