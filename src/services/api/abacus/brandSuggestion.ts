
import { BrandSuggestion } from "@/services/types";
import { toast } from "sonner";
import { getApiKey } from "./config";
import { callAbacusAI } from "./apiClient";
import { isUsingSupabaseBackend } from "../supabase/config";
import { fetchBrandSuggestionsViaOpenAI } from "../supabase/aiService";
import { isSupabaseConnected } from "../supabase/client";

// Функция для получения предложений брендов через Abacus.ai
export const fetchBrandSuggestions = async (description: string): Promise<BrandSuggestion[]> => {
  try {
    // Проверяем, используем ли мы Supabase бэкенд
    if (isUsingSupabaseBackend() && await isSupabaseConnected()) {
      console.log('Использование Supabase для получения предложений брендов');
      try {
        // Используем Edge Function для получения предложений брендов
        const result = await fetchBrandSuggestionsViaOpenAI(description);
        return result;
      } catch (error) {
        console.error('Ошибка при использовании Supabase для предложений брендов:', error);
        toast.error(`Ошибка Supabase: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 
                    { duration: 3000 });
        // Продолжаем с прямым вызовом API как запасной вариант
        toast.info('Используем прямой вызов API как запасной вариант', { duration: 2000 });
      }
    }
    
    // Получаем API ключ
    const apiKey = getApiKey();
    if (!apiKey) {
      toast.error("API ключ Abacus.ai не установлен. Пожалуйста, добавьте свой ключ в настройках.");
      throw new Error("API ключ не установлен");
    }
    
    // В данном случае мы эмулируем вызов Abacus API для получения рекомендаций по брендам
    // В реальности нужно заменить на фактический вызов соответствующего API
    
    const mockBrandData = await callAbacusAI('brand/recommend', 'POST', {
      description,
      limit: 5
    });
    
    // Предполагаем, что ответ API содержит массив брендов
    // Форматируем данные для соответствия интерфейсу BrandSuggestion
    return mockBrandData.brands.map((brand: any) => ({
      name: brand.name || 'Unknown Brand',
      logo: brand.logo || 'https://via.placeholder.com/100',
      description: brand.description || 'No description available',
      products: brand.products || ['Sample Product 1', 'Sample Product 2']
    }));
    
  } catch (error) {
    console.error('Ошибка при получении предложений брендов:', error);
    toast.error('Не удалось получить предложения брендов. Пожалуйста, попробуйте позже.', { duration: 3000 });
    
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
};
