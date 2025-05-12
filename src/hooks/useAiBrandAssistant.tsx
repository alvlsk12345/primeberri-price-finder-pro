
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchBrandSuggestions } from "@/services/api/brandSuggestionService";
import { getApiKey } from "@/services/api/openai/config";
import { BrandSuggestion } from "@/services/types";
import { isSupabaseConnected, isUsingSupabaseBackend } from "@/services/api/supabase/client";

export const useAiBrandAssistant = () => {
  const [isAssistantEnabled, setIsAssistantEnabled] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<{connected: boolean; enabled: boolean}>({
    connected: false,
    enabled: false
  });

  const MAX_RETRIES = 2;
  const REQUEST_TIMEOUT = 20000;

  // Проверяем статус Supabase при загрузке компонента
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const connected = await isSupabaseConnected();
        const enabled = await isUsingSupabaseBackend();
        console.log('Статус Supabase в AiBrandAssistant:', { connected, enabled });
        setSupabaseStatus({ connected, enabled });
      } catch (error) {
        console.error('Ошибка при проверке статуса Supabase:', error);
      }
    };
    
    checkSupabaseStatus();
  }, []);

  useEffect(() => {
    if (isAssistantEnabled) {
      const apiKey = getApiKey();
      if (!apiKey && !supabaseStatus.connected) {
        toast.error("Для использования AI-помощника необходим ключ API или подключение к Supabase");
        setIsAssistantEnabled(false);
      }
    }
  }, [isAssistantEnabled, supabaseStatus]);

  // Эффект для отслеживания изменений brandSuggestions
  useEffect(() => {
    console.log('Состояние brandSuggestions обновлено:', brandSuggestions);
  }, [brandSuggestions]);

  const handleGetBrandSuggestions = async () => {
    if (!productDescription.trim()) {
      toast.error("Пожалуйста, введите описание товара");
      return;
    }

    console.log("Запрос поиска товаров с текстом:", productDescription);
    setIsAssistantLoading(true);
    setBrandSuggestions([]); // Очищаем предыдущие результаты
    setHasError(false);
    setErrorMessage("");
    
    // Устанавливаем таймаут для запроса
    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      setIsAssistantLoading(false);
      setHasError(true);
      setErrorMessage("Превышено время ожидания ответа (20 секунд). Попробуйте упростить запрос или повторите попытку позже.");
      toast.error("Превышено время ожидания ответа", { duration: 5000 });
      timeoutId = null;
    }, REQUEST_TIMEOUT);
    
    try {
      // Добавляем запрос на получение 5 результатов в описание
      const enhancedDescription = productDescription + 
        ". Пожалуйста, предложите 5 конкретных товаров с указанием бренда и модели. Описание должно быть кратким.";
      
      console.log(`Отправляем запрос на поиск брендов: "${enhancedDescription}"`);
      
      let suggestions = await fetchBrandSuggestions(enhancedDescription);
      
      // Очищаем таймаут, так как запрос завершился
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      console.log("Получены предложения брендов:", suggestions);
      
      // Проверка на валидность полученных данных
      if (!suggestions) {
        console.warn("Получен пустой ответ от fetchBrandSuggestions");
        suggestions = [];
      }
      
      // Нормализация результатов: если получен один объект вместо массива
      if (suggestions && !Array.isArray(suggestions)) {
        console.log("Получен один объект вместо массива, преобразуем его");
        suggestions = [suggestions];
      }
      
      // Дополнительная проверка для обработки ответа формата {products: [...]}
      if (suggestions && 'products' in suggestions && Array.isArray((suggestions as any).products)) {
        console.log("Получен объект с массивом products, извлекаем его");
        suggestions = (suggestions as any).products;
      }
      
      // Явно устанавливаем состояние на основе полученных данных
      console.log("Устанавливаем состояние brandSuggestions:", suggestions);
      setBrandSuggestions(Array.isArray(suggestions) ? suggestions : []);
      
      if (!suggestions || suggestions.length === 0) {
        setHasError(true);
        setErrorMessage("Не удалось найти подходящие товары для вашего запроса. Попробуйте изменить описание.");
        toast.warning("Не удалось найти подходящие товары для вашего запроса");
      } else {
        // Сбрасываем счетчик повторов при успешном запросе
        setRetryCount(0);
        toast.success(`Найдено ${suggestions.length} предложений товаров`);
      }
    } catch (error: any) {
      // Очищаем таймаут, так как запрос завершился с ошибкой
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      console.error('Ошибка при запросе к AI для получения товаров:', error);
      
      // Проверяем, можно ли повторить запрос
      if (retryCount < MAX_RETRIES && error.message?.includes("Failed to fetch")) {
        // Увеличиваем счетчик попыток
        setRetryCount(prevCount => prevCount + 1);
        
        // Показываем уведомление о повторной попытке
        toast.info(`Проблема соединения. Пробуем еще раз (попытка ${retryCount + 1}/${MAX_RETRIES})...`, {
          duration: 2000
        });
        
        // Небольшая задержка перед повторным запросом
        setTimeout(() => {
          handleGetBrandSuggestions();
        }, 1500);
        
        return;
      }
      
      setHasError(true);
      
      // Обработка других типов ошибок
      if (error.message?.includes("quota")) {
        setErrorMessage("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
        toast.error("Превышен лимит запросов API. Проверьте ваш тарифный план OpenAI.");
      } else if (error.message?.includes("invalid")) {
        setErrorMessage("Недействительный API ключ. Проверьте настройки.");
        toast.error("Недействительный API ключ. Пожалуйста, проверьте его в настройках.");
      } else if (error.message?.includes("API ключ не установлен")) {
        setErrorMessage("Необходимо указать API ключ OpenAI в настройках.");
        toast.error("Необходимо указать API ключ OpenAI в настройках.");
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("Исчерпаны все попытки")) {
        setErrorMessage("Не удалось подключиться к API. Проверьте подключение к интернету.");
        toast.error("Не удалось подключиться к API. Проверьте подключение к интернету или перейдите в настройки для проверки API.");
      } else if (error.message?.includes("время ожидания")) {
        setErrorMessage("Запрос занял слишком много времени. Возможны проблемы с сервером.");
        toast.error("Запрос занял слишком много времени. Попробуйте позже.");
      } else {
        setErrorMessage("Не удалось получить предложения товаров. Попробуйте позже.");
        toast.error("Не удалось получить предложения товаров. Попробуйте позже или проверьте настройки API.");
      }
      
      // При ошибке устанавливаем пустой массив предложений
      setBrandSuggestions([]);
    } finally {
      setIsAssistantLoading(false);
      // Сбрасываем счетчик повторов при любом финальном результате
      setRetryCount(0);
    }
  };

  return {
    isAssistantEnabled,
    setIsAssistantEnabled,
    productDescription,
    setProductDescription,
    brandSuggestions,
    isAssistantLoading,
    hasError,
    errorMessage,
    supabaseStatus,
    handleGetBrandSuggestions
  };
};
