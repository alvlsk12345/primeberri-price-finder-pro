
import { useState } from 'react';
import { toast } from "sonner";
import { fetchBrandSuggestions } from "@/services/api/brandSuggestionService";
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
  // Сохраняем состояние, но не выполняем автоматическую проверку
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; enabled: boolean }>({
    connected: false,
    enabled: false
  });

  // Функция для ручной проверки статуса Supabase - будет вызываться только по запросу
  const checkSupabaseStatus = async () => {
    try {
      // Проверяем, находимся ли мы на странице настроек
      const isSettingsPage = window.location.pathname === "/settings";
      if (isSettingsPage) {
        console.log('Автоматическая проверка Supabase отключена на странице настроек');
        return supabaseStatus; // Возвращаем текущее состояние без проверки
      }

      const connected = await isSupabaseConnected(true); // Явно запрашиваем проверку
      const enabled = await isUsingSupabaseBackend();
      const newStatus = { connected, enabled };
      setSupabaseStatus(newStatus);
      
      console.log('AiBrandAssistant: проверка статуса Supabase:', newStatus);
      return newStatus;
    } catch (error) {
      console.error('Ошибка при проверке статуса Supabase:', error);
      setSupabaseStatus({ connected: false, enabled: false });
      return { connected: false, enabled: false };
    }
  };

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
      
      const suggestions = await fetchBrandSuggestions(productDescription);
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
    checkSupabaseStatus,
    isAssistantEnabled,
    setIsAssistantEnabled,
    handleGetBrandSuggestions
  };
};
