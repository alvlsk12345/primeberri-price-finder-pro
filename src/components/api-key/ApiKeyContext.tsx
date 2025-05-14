
import React, { createContext, useContext, useState, useEffect } from 'react';

// Типы API ключей
export type ApiKeyType = 'openai' | 'zylalabs' | 'abacus';

// Интерфейс контекста API ключа
export interface ApiKeyContextValue {
  apiKey: string;
  setApiKey: (key: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  saveKey: () => void;
  resetKey?: () => string | undefined;  // Уточняем тип - может вернуть строку или undefined
  keyTitle: string;
  keyPlaceholder: string;
  keyWebsite: string;
}

// Создаем контекст
const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

// Параметры провайдера
interface ApiKeyProviderProps {
  children: React.ReactNode;
  keyType: ApiKeyType;
  getKey: () => string;
  saveKey: (key: string) => boolean | void;
  resetKey?: () => string | undefined;  // Уточняем тип - может вернуть строку или undefined
  defaultKey?: string;
  keyTitle: string;
  keyPlaceholder: string;
  keyWebsite: string;
}

// Провайдер контекста API ключа
export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({
  children,
  keyType,
  getKey,
  saveKey,
  resetKey,
  defaultKey = '',
  keyTitle,
  keyPlaceholder,
  keyWebsite,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Загрузка ключа при инициализации
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setIsLoading(true);
        const key = getKey();
        setApiKey(key);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error(`[ApiKeyContext] Ошибка при получении ${keyType} ключа:`, err);
        setError(`Не удалось получить ${keyTitle} ключ. Проверьте консоль для деталей.`);
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [keyType, keyTitle, getKey]);

  // Переключение видимости ключа
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Сохранение ключа
  const handleSaveKey = () => {
    try {
      if (!apiKey.trim()) {
        setError('Пожалуйста, введите API ключ');
        return;
      }

      const result = saveKey(apiKey.trim());
      if (result !== false) {
        setError(null);
      }
    } catch (err) {
      console.error(`[ApiKeyContext] Ошибка при сохранении ${keyType} ключа:`, err);
      setError(`Ошибка при сохранении ключа ${keyTitle}. Попробуйте еще раз.`);
    }
  };

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        isVisible,
        toggleVisibility,
        error,
        setError,
        isLoading,
        setIsLoading,
        saveKey: handleSaveKey,
        resetKey,
        keyTitle,
        keyPlaceholder,
        keyWebsite,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

// Хук для использования контекста API ключа
export const useApiKey = (): ApiKeyContextValue => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey должен использоваться внутри ApiKeyProvider');
  }
  return context;
};
