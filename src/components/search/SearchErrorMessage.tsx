
import React from 'react';

type SearchErrorMessageProps = {
  hasError: boolean;
  errorMessage: string;
};

export const SearchErrorMessage: React.FC<SearchErrorMessageProps> = ({ 
  hasError, 
  errorMessage 
}) => {
  if (!hasError) return null;
  
  return (
    <div className="mt-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
      <p className="text-sm">{errorMessage || 'Произошла ошибка при выполнении поиска.'}</p>
    </div>
  );
};
