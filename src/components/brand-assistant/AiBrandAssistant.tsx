
import React, { useState, useEffect } from 'react';
import { ProductDescriptionForm } from './ProductDescriptionForm';
import { BrandSuggestionList } from './BrandSuggestionList';
import { BrandAssistantError } from './BrandAssistantError';
import { SupabaseStatusMessage } from './SupabaseStatusMessage';
import { Button } from '@/components/ui/button';
import { useAiBrandAssistant } from '@/hooks/useAiBrandAssistant';
import { isSupabaseConnected } from '@/services/api/supabase/client';
import { isUsingSupabaseBackend } from '@/services/api/supabase/config';

export const AiBrandAssistant = () => {
  const {
    isLoading, 
    error, 
    brandSuggestions,
    productDescription,
    setProductDescription,
    handleGetBrandSuggestions,
    resetBrandSuggestions,
    imageChoices
  } = useAiBrandAssistant();

  // Состояние для отслеживания подключения к Supabase
  const [supabaseStatus, setSupabaseStatus] = useState({
    connected: true,
    enabled: false
  });
  
  // Эффект для проверки состояния и настроек Supabase при монтировании
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        console.log('[AiBrandAssistant] Проверка состояния Supabase');
        const enabled = isUsingSupabaseBackend();
        
        // Только если включено использование Supabase проверяем соединение
        let connected = true;
        if (enabled) {
          connected = await isSupabaseConnected(false);
        }
        
        setSupabaseStatus({
          connected,
          enabled
        });
        
        console.log(`[AiBrandAssistant] Статус Supabase: connected=${connected}, enabled=${enabled}`);
      } catch (error) {
        console.error('[AiBrandAssistant] Ошибка при проверке статуса Supabase:', error);
      }
    };
    
    checkSupabaseStatus();
  }, []);

  // Обработчик для ручной проверки соединения
  const handleCheckConnection = async (): Promise<void> => {
    try {
      console.log('[AiBrandAssistant] Запрос на проверку соединения с Supabase');
      const enabled = isUsingSupabaseBackend();
      let connected = true;
      
      if (enabled) {
        connected = await isSupabaseConnected(true, true);
      }
      
      setSupabaseStatus({
        connected,
        enabled
      });
      
      console.log(`[AiBrandAssistant] Новый статус соединения: ${connected}`);
    } catch (error) {
      console.error('[AiBrandAssistant] Ошибка при проверке соединения:', error);
      setSupabaseStatus(prev => ({
        ...prev,
        connected: false
      }));
    }
  };
  
  return (
    <div className="mb-6 relative">
      {/* Сообщение о статусе подключения к Supabase */}
      <SupabaseStatusMessage 
        connected={supabaseStatus.connected} 
        enabled={supabaseStatus.enabled}
        onRequestCheck={handleCheckConnection}
      />
      
      {/* Форма описания продукта */}
      <ProductDescriptionForm
        productDescription={productDescription}
        setProductDescription={setProductDescription}
        onSubmit={handleGetBrandSuggestions}
        isLoading={isLoading}
        imageChoices={imageChoices}
      />
      
      {/* Отображение ошибок */}
      {error && <BrandAssistantError error={error} />}
      
      {/* Список предложений брендов */}
      {brandSuggestions.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Возможные похожие бренды:</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetBrandSuggestions}
            >
              Очистить результаты
            </Button>
          </div>
          <BrandSuggestionList suggestions={brandSuggestions} />
        </div>
      )}
    </div>
  );
};
