
import React from 'react';
import { AlertCircle } from 'lucide-react';

type SearchErrorMessageProps = {
  hasError: boolean;
};

export const SearchErrorMessage: React.FC<SearchErrorMessageProps> = ({ hasError }) => {
  if (!hasError) return null;
  
  return (
    <div className="flex items-center text-red-500 text-sm gap-1">
      <AlertCircle size={14} />
      <span>Произошла ошибка при поиске. Пожалуйста, попробуйте еще раз.</span>
    </div>
  );
};
