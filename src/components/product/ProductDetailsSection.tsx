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
    return <div className="product-details-section p-4 bg-white rounded-lg shadow">
        
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Источник: {selectedProduct.source || 'Неизвестный магазин'}
          </p>
          
          {selectedProduct.description && <div className="mt-3">
              <h3 className="font-medium mb-1">Описание:</h3>
              <p className="text-sm">{selectedProduct.description}</p>
            </div>}
        </div>
        
        
      </div>;
  } catch (error) {
    console.log("ProductDetailsSection: SearchContext недоступен", error);
    return null;
  }
};