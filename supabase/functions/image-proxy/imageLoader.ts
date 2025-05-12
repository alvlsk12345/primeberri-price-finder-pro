
import { ENHANCED_REQUEST_HEADERS, REQUEST_TIMEOUT } from './config.ts';

/**
 * Результат запроса изображения
 */
export interface ProxyResult {
  success: boolean;
  contentType?: string;
  blob?: Blob;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  url?: string;
}

/**
 * Загружает изображение по указанному URL
 * @param imageUrl URL изображения для загрузки
 * @returns Объект результата с данными изображения или информацией об ошибке
 */
export async function proxyImage(imageUrl: string): Promise<ProxyResult> {
  console.log(`Запрос на проксирование изображения: ${imageUrl}`);
  
  try {
    // Устанавливаем параметры запроса с расширенными заголовками для улучшения совместимости
    const fetchOptions = {
      headers: ENHANCED_REQUEST_HEADERS,
      // Устанавливаем таймаут для запроса
      signal: AbortSignal.timeout(REQUEST_TIMEOUT) 
    };
    
    // Выполняем запрос изображения
    const imageResponse = await fetch(imageUrl, fetchOptions);
    
    // Проверяем успешность запроса с расширенной диагностикой
    if (!imageResponse.ok) {
      console.error(`Ошибка при загрузке изображения: ${imageResponse.status} ${imageResponse.statusText}`);
      console.error(`Заголовки ответа:`, Object.fromEntries([...imageResponse.headers.entries()]));
      
      // Возвращаем детали ошибки для диагностики
      return {
        success: false,
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        headers: Object.fromEntries([...imageResponse.headers.entries()]),
        url: imageUrl
      };
    }
    
    // Получаем тип содержимого и бинарные данные
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';
    const imageBlob = await imageResponse.blob();
    
    console.log(`Изображение успешно получено: ${contentType}, размер: ${imageBlob.size} байт`);
    
    return {
      success: true,
      contentType,
      blob: imageBlob
    };
  } catch (error) {
    // Обрабатываем ошибки загрузки с детальной информацией
    console.error(`Ошибка при проксировании изображения: ${error.message}`, error.stack);
    
    return {
      success: false,
      statusText: error.message,
      url: imageUrl
    };
  }
}
