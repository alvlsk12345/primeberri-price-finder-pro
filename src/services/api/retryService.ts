
import { toast } from "@/components/ui/sonner";
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY, sleep } from "./zylalabsConfig";

/**
 * Executes a function with retry capability
 * @param fn The function to execute with retries
 * @param errorHandler Optional custom error handler for each attempt
 */
export const withRetry = async <T>(
  fn: (attempt: number, proxyIndex: number) => Promise<T>,
  errorHandler?: (error: any, attempt: number, proxyIndex: number) => void
): Promise<T> => {
  let attempts = 0;
  let proxyIndex = 0; // Start with direct connection
  let lastError = null;
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      return await fn(attempts, proxyIndex);
    } catch (error: any) {
      // Additional error diagnostics
      console.error("Fetch error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        toString: error.toString()
      });
      
      // Call custom error handler if provided
      if (errorHandler) {
        errorHandler(error, attempts, proxyIndex);
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        console.warn('Запрос был отменен из-за истечения времени ожидания, попытка повтора');
        lastError = error;
        attempts++;
        await sleep(RETRY_DELAY);
        continue;
      }
      
      // If likely CORS issue, change proxy
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('Произошла ошибка "Failed to fetch", пробуем другой прокси');
        proxyIndex = (proxyIndex + 1) % 5; // Use all 5 proxies
        
        // Try again with different proxy without incrementing main attempts counter
        if (attempts < MAX_RETRY_ATTEMPTS - 1) {
          console.log(`Пробуем прокси №${proxyIndex} без увеличения счетчика попыток`);
          await sleep(RETRY_DELAY);
          continue;
        }
      }
      
      // For specific HTTP errors, try different proxy
      if (error.message && (
        error.message.includes('403') || 
        error.message.includes('404')
      ) && proxyIndex < 4) {
        console.warn(`Получен статус ошибки, пробуем другой прокси`);
        proxyIndex = (proxyIndex + 1) % 5;
      }
      
      // Increment attempts counter
      lastError = error;
      attempts++;
      
      if (attempts < MAX_RETRY_ATTEMPTS) {
        console.log(`Повторная попытка ${attempts}/${MAX_RETRY_ATTEMPTS} через ${RETRY_DELAY}мс`);
        await sleep(RETRY_DELAY);
        continue;
      }
    }
  }
  
  // If all attempts exhausted, throw the last error
  console.error('Все попытки запросов исчерпаны:', lastError);
  throw lastError;
};
