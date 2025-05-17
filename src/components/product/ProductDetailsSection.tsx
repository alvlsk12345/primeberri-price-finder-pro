
import React from 'react';
import { CostCalculator } from "@/components/CostCalculator";
import { ActionButtons } from "@/components/ActionButtons";
import { useSearch } from "@/contexts/SearchContext";

export const ProductDetailsSection: React.FC = () => {
  try {
    const {
      selectedProduct
    } = useSearch();
    
    if (!selectedProduct) {
      return null;
    }
    
    return (
      <div className="space-y-4">
        <CostCalculator product={selectedProduct} />
        <ActionButtons product={selectedProduct} />
      </div>
    );
  } catch (error) {
    console.log("ProductDetailsSection: SearchContext недоступен", error);
    return null;
  }
};
