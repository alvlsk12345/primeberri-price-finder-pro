
import React from 'react';

export const NoSearchResults: React.FC = () => {
  return (
    <div className="text-center p-6" data-testid="no-results">
      <p className="text-lg text-gray-500">Товары не найдены.</p>
    </div>
  );
};
