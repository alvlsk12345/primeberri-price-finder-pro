
// This file serves as a simplified facade for the refactored API services
import { SearchParams } from "../types";
import { searchProductsViaZylalabs as searchProducts } from "./searchService";
import { detectBestProxy } from "./corsProxyService";

// Initialize the best proxy on load
let initialProxyDetectionDone = false;
let recommendedProxyIndex = 0;

// Function to initialize proxy detection (can be called at app startup)
export const initProxyDetection = async (): Promise<void> => {
  if (!initialProxyDetectionDone) {
    try {
      console.log('Запуск определения оптимального прокси...');
      const proxyInfo = await detectBestProxy();
      recommendedProxyIndex = proxyInfo.bestProxyIndex;
      
      console.log('Результаты проверки прокси:', {
        directAccess: proxyInfo.directAccessWorks,
        bestIndex: recommendedProxyIndex,
        statuses: proxyInfo.proxyStatuses
      });
      
      initialProxyDetectionDone = true;
    } catch (e) {
      console.error('Ошибка при определении оптимального прокси:', e);
      // Default to using a proxy if detection fails
      recommendedProxyIndex = 1; 
    }
  }
};

// Re-export the main search function with the same interface as before
// to maintain backward compatibility
export { searchProducts as searchProductsViaZylalabs };

// Export the recommended proxy index for other services to use
export const getBestProxyIndex = (): number => recommendedProxyIndex;
