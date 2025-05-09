
import React from 'react';
import { Star } from "lucide-react";

interface ProductCardRatingProps {
  source: string;
  rating: number;
}

export const ProductCardRating: React.FC<ProductCardRatingProps> = ({ 
  source,
  rating
}) => {
  return (
    <div className="text-sm mb-2 flex items-center justify-center">
      <span className="mr-1 text-xs">{source}</span>
      <div className="flex items-center">
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className="text-xs ml-1">{rating}</span>
      </div>
    </div>
  );
};
