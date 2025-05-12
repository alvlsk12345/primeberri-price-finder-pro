
import React from 'react';
import { Product } from "@/services/types";
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, selectedProduct, onSelect }) => {
  console.log(`Отрисовка списка товаров, количество: ${products?.length || 0}`);
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Нет товаров для отображения в данном представлении</p>
      </div>
    );
  }
  
  return (
    // Улучшаем отзывчивость сетки, добавляя больше точек перелома для лучшей поддержки разных экранов
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <div key={product.id} className="flex h-full w-full">
          <ProductCard
            product={product}
            isSelected={selectedProduct?.id === product.id}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
};
