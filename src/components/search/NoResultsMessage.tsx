
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";

export const NoResultsMessage: React.FC = () => {
  const { hasSearched, searchResults, isLoading } = useSearch();
  
  // Показываем сообщение только если был выполнен поиск, нет результатов и не идет загрузка
  if (!hasSearched || searchResults.length > 0 || isLoading) return null;

  return (
    <div className="py-8 text-center">
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        По вашему запросу ничего не найдено
      </h3>
      <p className="text-gray-500">
        Попробуйте изменить запрос или использовать другие ключевые слова
      </p>
    </div>
  );
};
