
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Search } from 'lucide-react';
import { toast } from "sonner";
import { fetchFromOpenAI } from '@/services/api/openai/searchService'; 
import { setUseSupabaseBackend, isUsingSupabaseBackend } from '@/services/api/supabase/config';

export const TestSearch = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [usageMode, setUsageMode] = useState<'direct' | 'supabase'>(isUsingSupabaseBackend() ? 'supabase' : 'direct');

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Пожалуйста, введите запрос для поиска');
      return;
    }

    try {
      setIsLoading(true);
      toast.info(`Выполняем поиск через ${usageMode === 'direct' ? 'прямой вызов OpenAI' : 'Supabase Edge Function'}`, { duration: 2000 });
      
      // Установка режима использования Supabase
      setUseSupabaseBackend(usageMode === 'supabase');
      
      const searchResults = await fetchFromOpenAI(query);
      
      setResults(searchResults || []);
      
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        toast.success(`Найдено ${searchResults.length} результатов`);
      } else {
        toast.info('По вашему запросу ничего не найдено');
      }
    } catch (error) {
      console.error('Ошибка при тестовом поиске:', error);
      toast.error(`Ошибка поиска: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = usageMode === 'direct' ? 'supabase' : 'direct';
    setUsageMode(newMode);
    toast.info(`Режим изменен на ${newMode === 'direct' ? 'прямой вызов OpenAI' : 'Supabase Edge Function'}`);
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold">Тестирование поиска товаров</h2>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow">
          <Input 
            placeholder="Введите запрос, например: Nike кроссовки белые" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            className="w-full" 
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !query.trim()} 
          className="min-w-[120px]" 
          variant="default"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader className="animate-spin w-4 h-4" />
              Поиск...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={18} /> Поиск
            </span>
          )}
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm">
          Текущий режим: <span className="font-semibold">{usageMode === 'direct' ? 'Прямой вызов OpenAI' : 'Supabase Edge Function'}</span>
        </div>
        <Button variant="outline" size="sm" onClick={toggleMode}>
          Переключить на {usageMode === 'direct' ? 'Supabase' : 'Прямой вызов'}
        </Button>
      </div>
      
      {results.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium">Результаты поиска:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product, index) => (
              <div key={index} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                {product.image ? (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400?text=Изображение+недоступно";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">Изображение недоступно</span>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm line-clamp-2">{product.title}</h4>
                    <span className="text-brand-600 font-semibold whitespace-nowrap">{product.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{product.subtitle || 'Без категории'}</span>
                    <span>{product.source}</span>
                  </div>
                  <div className="mt-2">
                    {product.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-500" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                        <span>{product.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && query !== '' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 text-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>По вашему запросу ничего не найдено. Пожалуйста, проверьте запрос или попробуйте позже.</p>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <p>Примеры запросов:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Nike кроссовки белые</li>
          <li>Женская сумка кожаная до 10000 рублей</li>
          <li>Умные часы samsung</li>
          <li>Мужская куртка зимняя</li>
        </ul>
      </div>
    </div>
  );
};
