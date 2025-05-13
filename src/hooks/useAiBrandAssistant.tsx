
import { useState } from 'react';
import { toast } from "sonner";
import { fetchBrandSuggestions } from "@/services/api/brandSuggestionService";
import { getApiKey } from "@/services/api/openai/config";
import { BrandSuggestion } from "@/services/types";
import { isSupabaseConnected } from "@/services/api/supabase/client";
import { isUsingSupabaseBackend } from "@/services/api/supabase/config";

// Функция для проверки, находимся ли мы на странице настроек
const isOnSettingsPage = () => {
  if (typeof window === 'undefined') return false;
  
  // Проверяем все возможные варианты URL страницы настроек
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  
  return pathname === "/settings" || 
         pathname.endsWith("/settings") || 
         hash === "#/settings" || 
         hash.includes("/settings") ||
         document.body.getAttribute('data-path') === '/settings';
};

export const useAiBrandAssistant = () => {
  // Изменили на false по умолчанию как запросил пользователь
  const [isAssistantEnabled, setIsAssistantEnabled] = useState<boolean>(false);
  const [productDescription, setProductDescription] = useState<string>("");
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Определяем, находимся ли мы на странице настроек
  const inSettingsPage = isOnSettingsPage();
  
  // Для страницы настроек устанавливаем специальное состояние, которое не вызовет отображение предупреждений
  // Это предотвращает отображение предупреждений о соединении на странице настроек
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; enabled: boolean }>(
    inSettingsPage 
      ? { connected: true, enabled: true } // На странице настроек - считаем, что всё в порядке
      : { connected: false, enabled: false } // На других страницах - значения по умолчанию
  );

  // Функция для ручной проверки статуса Supabase - будет вызываться только по запросу
  const checkSupabaseStatus = async () => {
    // Если мы на странице настроек, не проверяем статус автоматически
    if (inSettingsPage) {
      return supabaseStatus; // Возвращаем текущее состояние без проверки
    }

    try {
      const connected = await isSupabaseConnected(true); // Явно запрашиваем проверку
      const enabled = await isUsingSupabaseBackend();
      const newStatus = { connected, enabled };
      setSupabaseStatus(newStatus);
      return newStatus;
    } catch (error) {
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
      // Если мы на странице настроек, не выполняем запрос
      if (inSettingsPage) {
        setIsAssistantLoading(false);
        return;
      }
      
      const suggestions = await fetchBrandSuggestions(productDescription);
      
      if (suggestions && suggestions.length > 0) {
        setBrandSuggestions(suggestions);
        toast.success(`Найдено ${suggestions.length} предложений`);
      } else {
        setErrorMessage("Не удалось получить предложения. Попробуйте другой запрос или уточните описание.");
        toast.error("Не удалось получить предложения");
      }
    } catch (error: any) {
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
