
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-fr">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProduct?.id === product.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
