
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
    // Улучшенная отзывчивая сетка для карточек товаров с поддержкой до 36 товаров на странице
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 pb-2">
      {products.map((product) => (
        <div key={product.id} className="h-full flex">
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
