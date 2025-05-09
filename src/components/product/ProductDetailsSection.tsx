
import React from 'react';
import { useSearch } from "@/contexts/search";

export const ProductDetailsSection: React.FC = () => {
  const { selectedProduct } = useSearch();
  
  // Мы удаляем весь раздел с расчетом стоимости
  // и кнопками действий, как было запрошено
  
  return null;
};
