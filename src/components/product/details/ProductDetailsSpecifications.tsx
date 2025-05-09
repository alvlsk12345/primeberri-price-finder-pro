
import React from 'react';

interface ProductDetailsSpecificationsProps {
  specifications: Record<string, string> | undefined;
}

export const ProductDetailsSpecifications: React.FC<ProductDetailsSpecificationsProps> = ({ specifications }) => {
  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-1">Характеристики</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium">{key}: </span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
