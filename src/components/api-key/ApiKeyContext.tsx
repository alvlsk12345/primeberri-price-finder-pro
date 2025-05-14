
import React, { createContext, useContext, useState, useEffect } from 'react';

// Типы API ключей - добавляем новый тип "anthropic"
export type ApiKeyType = 'openai' | 'zylalabs' | 'abacus' | 'anthropic';

// Контекст для хранения состояния API ключа
export interface ApiKeyContextType {
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
  getKey: () => string;
}

// Пропсы для провайдера контекста API ключа
export interface ApiKeyProviderProps {
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

// Создание контекста API ключа с дефолтными значениями
const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: '',
  setApiKey: () => {},
  isVisible: false,
  toggleVisibility: () => {},
  error: null,
  setError: () => {},
  isLoading: true,
  setIsLoading: () => {},
  saveKey: () => {},
  keyTitle: '',
  keyPlaceholder: '',
  keyWebsite: '',
  getKey: () => '',
});

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

  // Загрузка API ключа при монтировании компонента
  useEffect(() => {
    try {
      console.log(`[ApiKeyContext] Загрузка ${keyType} API ключа`);
      const storedKey = getKey();
      setApiKey(storedKey || defaultKey);
      setError(null);
    } catch (err) {
      console.error(`[ApiKeyContext] Ошибка при загрузке ${keyType} API ключа:`, err);
      setError('Не удалось загрузить API ключ');
      setApiKey(defaultKey);
    } finally {
      setIsLoading(false);
    }
  }, [keyType, getKey, defaultKey]);

  // Переключение видимости API ключа
  const toggleVisibility = () => setIsVisible(!isVisible);

  // Сохранение API ключа
  const handleSaveKey = () => {
    try {
      console.log(`[ApiKeyContext] Сохранение ${keyType} API ключа`);
      const result = saveKey(apiKey);
      
      if (result === false) {
        // Если функция saveKey возвращает false, значит сохранение не удалось
        setError('Не удалось сохранить API ключ');
      } else {
        // Успешное сохранение
        setError(null);
      }
    } catch (err) {
      console.error(`[ApiKeyContext] Ошибка при сохранении ${keyType} API ключа:`, err);
      setError('Произошла ошибка при сохранении API ключа');
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
        getKey
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

// Хук для использования контекста API ключа
export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey должен использоваться внутри ApiKeyProvider');
  }
  return context;
};
