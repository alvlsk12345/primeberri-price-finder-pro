
import React, { useCallback } from 'react';
import { Product } from "@/services/types";

/**
 * Handler for product selection
 */
export const useProductSelectHandler = (
  setSelectedProduct: (product: Product | null) => void
) => {
  return useCallback((product: Product) => {
    setSelectedProduct(product);
  }, [setSelectedProduct]);
};
