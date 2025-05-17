import React from 'react';
import { CostCalculator } from "@/components/CostCalculator";
import { ActionButtons } from "@/components/ActionButtons";
import { useSearch } from "@/contexts/SearchContext";
export const ProductDetailsSection: React.FC = () => {
  try {
    const {
      selectedProduct,
      searchQuery
    } = useSearch();
    if (!selectedProduct) {
      return null;
    }
    return;
  } catch (error) {
    console.log("ProductDetailsSection: SearchContext недоступен", error);
    return null;
  }
};