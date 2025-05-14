
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { fetchBrandSuggestions } from "@/services/api/brandSuggestionService";
import { getApiKey } from "@/services/api/openai/config";
import { BrandSuggestion } from "@/services/types";
import { isSupabaseConnected, clearConnectionCache } from "@/services/api/supabase/client";
import { isUsingSupabaseBackend } from "@/services/api/supabase/config";
import { isOnSettingsPage, getRouteInfo } from "@/utils/navigation";

export const useAiBrandAssistant = () => {
  console.log('[useAiBrandAssistant] Инициализация хука useAiBrandAssistant');
  
  // Определяем, находимся ли мы на странице настроек
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[useAiBrandAssistant] routeInfo = ${JSON.stringify(routeInfo)}, inSettingsPage = ${inSettingsPage}`);
  
  // Изменили на false по умолчанию как запросил пользователь
  const [isAssistantEnabled, setIsAssistantEnabled] = useState<boolean>(false);
  const [productDescription, setProductDescription] = useState<string>("");
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Реф для отслеживания размонтирования компонента
  const isMounted = useRef(true);
  // Реф для отмены запросов при размонтировании
  const abortControllerRef = useRef<AbortController | null>(null);
  // Реф для отслеживания текущего маршрута
  const currentRouteRef = useRef<string>(routeInfo.path);
  
  // Для страницы настроек устанавливаем специальное состояние, которое не вызовет отображение предупреждений
  // Это предотвращает отображение предупреждений о соединении на странице настроек
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; enabled: boolean }>(
    inSettingsPage 
      ? { connected: true, enabled: true } // На странице настроек - считаем, что всё в порядке
      : { connected: false, enabled: false } // На других страницах - значения по умолчанию
  );

  // Настройка эффекта монтирования/размонтирования
  useEffect(() => {
    console.log('[useAiBrandAssistant] useEffect - монтирование компонента');
    
    // Безопасно получаем текущий маршрут
    try {
      const routeInfo = getRouteInfo();
      currentRouteRef.current = routeInfo.path;
      console.log(`[useAiBrandAssistant] Установлен текущий маршрут: ${currentRouteRef.current}`);
    } catch (error) {
      console.error('[useAiBrandAssistant] Ошибка при получении маршрута:', error);
    }
    
    isMounted.current = true;
    
    // Создаем новый контроллер для отмены запросов
    abortControllerRef.current = new AbortController();
    
    return () => {
      // При размонтировании компонента
      console.log('[useAiBrandAssistant] useEffect - размонтирование компонента');
      isMounted.current = false;
      
      // Отменяем все текущие запросы
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Функция для безопасной проверки, находимся ли мы на странице настроек
  const safeCheckIsSettingsPage = (): boolean => {
    try {
      // Первая проверка - через хелпер-функцию
      const isSettings = isOnSettingsPage();
      
      // Вторая проверка - через полную информацию о маршруте
      const routeInfo = getRouteInfo();
      
      // Третья проверка - по data-path атрибуту
      const dataPathIsSettings = document.body.getAttribute('data-path') === '/settings';
      
      // Четвертая проверка - по классу на body
      const hasSettingsClass = document.body.classList.contains('settings-page');
      
      const result = isSettings || routeInfo.isSettings || dataPathIsSettings || hasSettingsClass;
      
      console.log(`[useAiBrandAssistant] safeCheckIsSettingsPage: ${result} (isSettings=${isSettings}, routeInfo.isSettings=${routeInfo.isSettings}, dataPath=${dataPathIsSettings}, hasClass=${hasSettingsClass})`);
      
      return result;
    } catch (error) {
      console.error('[useAiBrandAssistant] Ошибка при проверке страницы настроек:', error);
      // В случае ошибки возвращаем true, чтобы предотвратить нежелательные API вызовы
      return true;
    }
  };

  // Функция для ручной проверки статуса Supabase - будет вызываться только по запросу
  const checkSupabaseStatus = async () => {
    console.log('[useAiBrandAssistant] Вызов checkSupabaseStatus()');
    
    // Если мы на странице настроек, не проверяем статус автоматически
    if (safeCheckIsSettingsPage()) {
      console.log('[useAiBrandAssistant] На странице настроек, возвращаем текущий статус без проверки');
      return supabaseStatus; // Возвращаем текущее состояние без проверки
    }

    try {
      // Без очистки кеша - это должно происходить только на странице настроек или по явному запросу
      const connected = await isSupabaseConnected(true); // Явно запрашиваем проверку с логированием
      const enabled = await isUsingSupabaseBackend();
      const newStatus = { connected, enabled };
      console.log('[useAiBrandAssistant] Новый статус Supabase:', newStatus);
      
      setSupabaseStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('[useAiBrandAssistant] Ошибка при проверке статуса Supabase:', error);
      setSupabaseStatus({ connected: false, enabled: false });
      return { connected: false, enabled: false };
    }
  };

  // Вычисляемое свойство для проверки наличия ошибки
  const hasError = !!errorMessage;

  const handleGetBrandSuggestions = async () => {
    console.log(`[useAiBrandAssistant] ENTER handleGetBrandSuggestions.`);
    
    // Первая проверка - быстрое определение маршрута
    if (safeCheckIsSettingsPage()) {
      console.log("[useAiBrandAssistant] Предотвращен вызов на странице настроек (быстрая проверка)");
      return;
    }
    
    if (!productDescription.trim()) {
      toast.error("Введите описание товара");
      return;
    }

    // Проверяем, не размонтирован ли компонент
    if (!isMounted.current) {
      console.log("[useAiBrandAssistant] Предотвращен вызов на размонтированном компоненте");
      return;
    }
    
    // Вторая проверка - более глубокая проверка маршрута, чтобы иметь тройную защиту
    const routeInfo = getRouteInfo();
    if (routeInfo.isSettings) {
      console.log("[useAiBrandAssistant] Предотвращен вызов на странице настроек (глубокая проверка)");
      return;
    }
    
    setIsAssistantLoading(true);
    setErrorMessage("");
    setBrandSuggestions([]);
    
    // Создаем новый контроллер для отмены запросов
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      // Еще одна проверка перед отправкой запроса
      if (safeCheckIsSettingsPage()) {
        console.log("[useAiBrandAssistant] Прерван на странице настроек (итоговая проверка)");
        setIsAssistantLoading(false);
        return;
      }
      
      console.log('[useAiBrandAssistant] Вызываем fetchBrandSuggestions с описанием:', productDescription);
      
      // Показываем индикатор загрузки
      toast.loading("Получение предложений по брендам...", {
        id: 'brand-suggestions-toast',
        duration: 0 // Бесконечная длительность, закроем вручную
      });
      
      const suggestions = await fetchBrandSuggestions(productDescription);
      
      // Проверяем, не размонтирован ли компонент после завершения запроса
      if (!isMounted.current) {
        console.log("[useAiBrandAssistant] Компонент размонтирован после запроса");
        toast.dismiss('brand-suggestions-toast');
        return;
      }
      
      // Финальная проверка маршрута перед обновлением состояния
      const finalRouteInfo = getRouteInfo();
      if (finalRouteInfo.isSettings) {
        console.log("[useAiBrandAssistant] Маршрут изменился на settings после запроса, прерываем обновление состояния");
        toast.dismiss('brand-suggestions-toast');
        return;
      }
      
      console.log('[useAiBrandAssistant] Получены предложения:', suggestions);
      if (suggestions && suggestions.length > 0) {
        setBrandSuggestions(suggestions);
        toast.dismiss('brand-suggestions-toast');
        toast.success(`Найдено ${suggestions.length} предложений`);
      } else {
        setErrorMessage("Не удалось получить предложения. Попробуйте другой запрос или уточните описание.");
        toast.dismiss('brand-suggestions-toast');
        toast.error("Не удалось получить предложения");
      }
    } catch (error: any) {
      toast.dismiss('brand-suggestions-toast');
      
      // Проверяем, не размонтирован ли компонент
      if (!isMounted.current) return;
      
      // Проверяем, не была ли ошибка вызвана отменой запроса
      if (error.name === 'AbortError') {
        console.log("[useAiBrandAssistant] Запрос был отменен");
        return;
      }
      
      // Финальная проверка маршрута перед обновлением состояния ошибки
      const finalRouteInfo = getRouteInfo();
      if (finalRouteInfo.isSettings) {
        console.log("[useAiBrandAssistant] Маршрут изменился на settings после ошибки, прерываем обновление состояния");
        return;
      }
      
      console.error('[useAiBrandAssistant] Ошибка при получении предложений брендов:', error);
      setErrorMessage(error?.message || "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.");
      toast.error("Ошибка при получении предложений");
    } finally {
      // Закрываем индикатор загрузки, если он еще активен
      toast.dismiss('brand-suggestions-toast');
      
      // Проверяем, не размонтирован ли компонент
      if (isMounted.current) {
        // Финальная проверка маршрута перед обновлением состояния
        const finalRouteInfo = getRouteInfo();
        if (!finalRouteInfo.isSettings) {
          setIsAssistantLoading(false);
        }
      }
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
    checkSupabaseStatus,
    isAssistantEnabled,
    setIsAssistantEnabled,
    handleGetBrandSuggestions
  };
};
