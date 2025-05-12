
import { ENHANCED_REQUEST_HEADERS, REQUEST_TIMEOUT } from './config.ts';
import { ProxyResult } from './types.ts';
import { logMessage, LogLevel } from './utils.ts';

/**
 * Загружает изображение по указанному URL
 * @param imageUrl URL изображения для загрузки
 * @param requestId Уникальный идентификатор запроса для логирования
 * @returns Объект результата с данными изображения или информацией об ошибке
 */
export async function proxyImage(imageUrl: string, requestId: string): Promise<ProxyResult> {
  logMessage(LogLevel.INFO, `[${requestId}] Запрос на проксирование изображения: ${imageUrl}`);
  
  try {
    // Устанавливаем параметры запроса с расширенными заголовками для улучшения совместимости
    const fetchOptions = {
      headers: ENHANCED_REQUEST_HEADERS,
      // Устанавливаем таймаут для запроса
      signal: AbortSignal.timeout(REQUEST_TIMEOUT) 
    };
    
    // Измеряем время загрузки
    const startTime = Date.now();
    
    // Выполняем запрос изображения
    const imageResponse = await fetch(imageUrl, fetchOptions);
    
    const responseTime = Date.now() - startTime;
    
    // Проверяем успешность запроса с расширенной диагностикой
    if (!imageResponse.ok) {
      const responseHeaders = Object.fromEntries([...imageResponse.headers.entries()]);
      
      logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при загрузке изображения: ${imageResponse.status} ${imageResponse.statusText}`, {
        url: imageUrl,
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        headers: responseHeaders,
        responseTime
      });
      
      // Возвращаем детали ошибки для диагностики
      return {
        success: false,
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        headers: responseHeaders,
        url: imageUrl
      };
    }
    
    // Получаем тип содержимого и бинарные данные
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';
    const imageBlob = await imageResponse.blob();
    
    logMessage(LogLevel.INFO, `[${requestId}] Изображение успешно получено: ${contentType}, размер: ${imageBlob.size} байт, время: ${responseTime}мс`);
    
    return {
      success: true,
      contentType,
      blob: imageBlob
    };
  } catch (error) {
    // Обрабатываем ошибки загрузки с детальной информацией
    logMessage(LogLevel.ERROR, `[${requestId}] Ошибка при проксировании изображения: ${error.message}`, {
      url: imageUrl,
      errorName: error.name,
      errorStack: error.stack
    });
    
    return {
      success: false,
      statusText: error.message,
      url: imageUrl
    };
  }
}
