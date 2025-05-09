
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
    <div className="text-sm my-2 flex items-center justify-center h-5">
      <span className="mr-1 text-xs text-center">{source}</span>
      <div className="flex items-center">
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className="text-xs ml-1 text-center">{rating}</span>
      </div>
    </div>
  );
};
