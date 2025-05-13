
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { getBrandSuggestions } from "@/services/api/brandSuggestionService";
import { getApiKey } from "@/services/api/openai/config";
import { BrandSuggestion } from "@/services/types";
import { isSupabaseConnected } from "@/services/api/supabase/client";
import { isUsingSupabaseBackend } from "@/services/api/supabase/config";

export const useAiBrandAssistant = () => {
  // Изменили на false по умолчанию как запросил пользователь
  const [isAssistantEnabled, setIsAssistantEnabled] = useState<boolean>(false);
  const [productDescription, setProductDescription] = useState<string>("");
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; enabled: boolean }>({
    connected: false,
    enabled: false
  });
  
  // Используем ref для отслеживания монтирования
  const isMounted = useRef(true);

  // Проверяем статус Supabase при загрузке с оптимизацией
  useEffect(() => {
    // Устанавливаем ref при монтировании
    isMounted.current = true;
    
    const checkSupabaseStatus = async () => {
      // Первая быстрая проверка настроек
      const enabled = isUsingSupabaseBackend();
      
      // Если функция не включена, нет смысла проверять соединение
      if (!enabled && isMounted.current) {
        setSupabaseStatus({ connected: false, enabled: false });
        return;
      }
      
      try {
        // Используем оптимизированную кешированную проверку
        const connected = await isSupabaseConnected();
        
        if (!isMounted.current) return;
        
        setSupabaseStatus({ connected, enabled });
        console.debug('AiBrandAssistant: проверка статуса Supabase:', { connected, enabled });
      } catch (error) {
        if (!isMounted.current) return;
        
        console.error('Ошибка при проверке статуса Supabase:', error);
        setSupabaseStatus({ connected: false, enabled });
      }
    };
    
    // Добавляем задержку для снижения нагрузки
    const timer = setTimeout(() => {
      checkSupabaseStatus();
    }, 1500);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  // Вычисляемое свойство для проверки наличия ошибки
  const hasError = !!errorMessage;

  const handleGetBrandSuggestions = async () => {
    if (!productDescription.trim()) {
      toast.error("Введите описание товара");
      return;
    }

    setIsAssistantLoading(true);
    setErrorMessage("");
    setBrandSuggestions([]);
    
    try {
      console.log(`Запрос бренд-помощнику: "${productDescription}"`);
      
      // Проверка наличия ключа API для внешних сервисов
      if (!getApiKey()) {
        console.warn('API ключ не найден');
      }
      
      const suggestions = await getBrandSuggestions(productDescription);
      console.log('Получены предложения:', suggestions);
      
      if (suggestions && suggestions.length > 0) {
        setBrandSuggestions(suggestions);
        toast.success(`Найдено ${suggestions.length} предложений`);
      } else {
        setErrorMessage("Не удалось получить предложения. Попробуйте другой запрос или уточните описание.");
        toast.error("Не удалось получить предложения");
      }
    } catch (error: any) {
      console.error('Ошибка при получении предложений:', error);
      setErrorMessage(error?.message || "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.");
      toast.error("Ошибка при получении предложений");
    } finally {
      setIsAssistantLoading(false);
    }
  };

  return {
    productDescription,
    setProductDescription,
    isAssistantLoading,
    brandSuggestions,
    errorMessage,
    hasError,
    supabaseStatus,
    isAssistantEnabled,
    setIsAssistantEnabled,
    handleGetBrandSuggestions
  };
};
