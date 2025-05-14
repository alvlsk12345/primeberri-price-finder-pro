
import React from 'react';
import { toast } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ApiKeyProvider, ApiKeyType, useApiKey } from './ApiKeyContext';

// Импортируем компоненты формы
import { ApiKeyFormContent } from './ApiKeyFormContent';
import { ApiKeyFormLoading } from './ApiKeyFormLoading';
import { ApiKeyFormError } from './ApiKeyFormError';

// Импортируем функции для работы с API ключами
import { getApiKey as getZylalabsApiKey, setApiKey as setZylalabsApiKey, resetApiKey as resetZylalabsApiKey, ZYLALABS_API_KEY } from '@/services/api/zylalabs/config';
import { getApiKey as getOpenAIApiKey, setApiKey as setOpenAIApiKey } from '@/services/api/openai/config';
import { getApiKey as getAbacusApiKey, setApiKey as setAbacusApiKey } from '@/services/api/abacus/config';

// Интерфейс для пропсов компонента ApiKeyForm
export interface ApiKeyFormProps {
  keyType: ApiKeyType;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ keyType }) => {
  // Определяем параметры в зависимости от типа ключа
  const keyTitle = 
    keyType === 'openai' ? 'OpenAI API' : 
    keyType === 'abacus' ? 'Abacus.ai API' : 
    'Zylalabs API';
    
  const keyPlaceholder = 
    keyType === 'openai' ? 'sk-...' : 
    keyType === 'abacus' ? 'abacus_api_key_...' : 
    '1234|...';
    
  const keyWebsite = 
    keyType === 'openai' ? 'https://platform.openai.com/api-keys' : 
    keyType === 'abacus' ? 'https://abacus.ai/app/apiKeys' : 
    'https://zylalabs.com/api/2033/real+time+product+search+api';

  // Функции для получения, сохранения и сброса ключей
  const getKey = () => {
    if (keyType === 'zylalabs') {
      return getZylalabsApiKey();
    } else if (keyType === 'openai') {
      return getOpenAIApiKey();
    } else if (keyType === 'abacus') {
      return getAbacusApiKey();
    }
    return '';
  };

  const saveKey = (key: string) => {
    if (keyType === 'zylalabs') {
      const success = setZylalabsApiKey(key);
      if (success) {
        toast.success('API ключ Zylalabs успешно сохранен');
        return true;
      } else {
        toast.error('Неверный формат API ключа Zylalabs');
        return false;
      }
    } else if (keyType === 'openai') {
      setOpenAIApiKey(key);
      toast.success('API ключ OpenAI успешно сохранен');
      return true;
    } else if (keyType === 'abacus') {
      setAbacusApiKey(key);
      toast.success('API ключ Abacus.ai успешно сохранен');
      return true;
    }
    return false;
  };

  const resetKey = keyType === 'zylalabs' 
    ? () => {
        resetZylalabsApiKey();
        toast.success('API ключ Zylalabs сброшен на значение по умолчанию');
        return ZYLALABS_API_KEY;
      } 
    : undefined;

  return (
    <ApiKeyProvider
      keyType={keyType}
      getKey={getKey}
      saveKey={saveKey}
      resetKey={resetKey}
      defaultKey={keyType === 'zylalabs' ? ZYLALABS_API_KEY : ''}
      keyTitle={keyTitle}
      keyPlaceholder={keyPlaceholder}
      keyWebsite={keyWebsite}
    >
      <ApiKeyFormRenderer />
    </ApiKeyProvider>
  );
};

// Компонент, определяющий, что рендерить в зависимости от состояния
const ApiKeyFormRenderer: React.FC = () => {
  const { isLoading, error } = useApiKey();

  if (isLoading) {
    return <ApiKeyFormLoading />;
  }

  if (error) {
    return <ApiKeyFormError />;
  }

  return <ApiKeyFormContent />;
};

// Оборачиваем компонент в ErrorBoundary для дополнительной защиты от ошибок
export const SafeApiKeyForm: React.FC<ApiKeyFormProps> = (props) => {
  const keyTitle = 
    props.keyType === 'openai' ? 'OpenAI API' : 
    props.keyType === 'abacus' ? 'Abacus.ai API' : 
    'Zylalabs API';

  return (
    <ErrorBoundary fallback={
      <ApiKeyFormFallback keyTitle={keyTitle} />
    }>
      <ApiKeyForm {...props} />
    </ErrorBoundary>
  );
};

// Компонент для отображения при ошибке
const ApiKeyFormFallback: React.FC<{ keyTitle: string }> = ({ keyTitle }) => {
  return (
    <div className="p-4 bg-red-50 rounded-md text-red-600">
      <h3 className="font-medium mb-2">Ошибка при загрузке настроек {keyTitle}</h3>
      <p>Возможно, проблема с доступом к локальному хранилищу (localStorage).</p>
      <div className="flex gap-2 mt-3">
        <button 
          onClick={() => window.location.reload()} 
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
        >
          Обновить страницу
        </button>
      </div>
    </div>
  );
};
