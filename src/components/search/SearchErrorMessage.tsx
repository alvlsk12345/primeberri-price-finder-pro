
import React from 'react';
import { AlertCircle } from 'lucide-react';

type SearchErrorMessageProps = {
  hasError: boolean;
  errorMessage?: string;
};

export const SearchErrorMessage: React.FC<SearchErrorMessageProps> = ({ 
  hasError, 
  errorMessage = "Произошла ошибка при поиске. Пожалуйста, попробуйте еще раз." 
}) => {
  if (!hasError) return null;
  
  return (
    <div className="flex items-center text-red-500 text-sm gap-1 mt-2 p-2 bg-red-50 rounded-md border border-red-200">
      <AlertCircle size={16} />
      <span>{errorMessage}</span>
    </div>
  );
};
