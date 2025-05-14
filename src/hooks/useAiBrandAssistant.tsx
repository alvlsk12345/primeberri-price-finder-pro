
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
  
  // Определяем, находимся ли мы на странице настроек
  const routeInfo = getRouteInfo();
  const inSettingsPage = routeInfo.isSettings;
  
  console.log(`[useAiBrandAssistant] routeInfo = ${JSON.stringify(routeInfo)}, inSettingsPage = ${inSettingsPage}`);
  
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

  // Функция для ручной проверки статуса Supabase - будет вызываться только по запросу
  const checkSupabaseStatus = async () => {
    console.log('[useAiBrandAssistant] Вызов checkSupabaseStatus()');
    
    // Если мы на странице настроек, не проверяем статус автоматически
    if (isOnSettingsPage()) {
      console.log('[useAiBrandAssistant] На странице настроек, возвращаем текущий статус без проверки');
      return supabaseStatus; // Возвращаем текущее состояние без проверки
    }

    try {
      // Очищаем кеш перед проверкой
      clearConnectionCache();
      
      const connected = await isSupabaseConnected(true); // Явно запрашиваем проверку
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
    console.log(`[useAiBrandAssistant] ВЫЗОВ handleGetBrandSuggestions. isOnSettingsPage()=${isOnSettingsPage()}, window.location.hash="${window.location.hash}", document.body.getAttribute('data-path')="${document.body.getAttribute('data-path')}"`);
    
    // Защита от вызовов на странице настроек
    if (isOnSettingsPage()) {
      console.log("[useAiBrandAssistant] Предотвращен вызов на странице настроек");
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
    
    setIsAssistantLoading(true);
    setErrorMessage("");
    setBrandSuggestions([]);
    
    // Создаем новый контроллер для отмены запросов
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      // Повторно проверяем, не на странице ли настроек мы (двойная проверка для надежности)
      if (isOnSettingsPage()) {
        console.log("[useAiBrandAssistant] Прерван на странице настроек (двойная проверка)");
        setIsAssistantLoading(false);
        return;
      }
      
      console.log('[useAiBrandAssistant] Вызываем fetchBrandSuggestions с описанием:', productDescription);
      const suggestions = await fetchBrandSuggestions(productDescription);
      
      // Проверяем, не размонтирован ли компонент после завершения запроса
      if (!isMounted.current) {
        console.log("[useAiBrandAssistant] Компонент размонтирован после запроса");
        return;
      }
      
      console.log('[useAiBrandAssistant] Получены предложения:', suggestions);
      if (suggestions && suggestions.length > 0) {
        setBrandSuggestions(suggestions);
        toast.success(`Найдено ${suggestions.length} предложений`);
      } else {
        setErrorMessage("Не удалось получить предложения. Попробуйте другой запрос или уточните описание.");
        toast.error("Не удалось получить предложения");
      }
    } catch (error: any) {
      // Проверяем, не размонтирован ли компонент
      if (!isMounted.current) return;
      
      // Проверяем, не была ли ошибка вызвана отменой запроса
      if (error.name === 'AbortError') {
        console.log("[useAiBrandAssistant] Запрос был отменен");
        return;
      }
      
      console.error('[useAiBrandAssistant] Ошибка при получении предложений брендов:', error);
      setErrorMessage(error?.message || "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.");
      toast.error("Ошибка при получении предложений");
    } finally {
      // Проверяем, не размонтирован ли компонент
      if (isMounted.current) {
        setIsAssistantLoading(false);
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
