
// Экспортируем все функции для использования в проекте
export * from './imageProcessor';
export * from './imageSourceDetector';
export * from './imageUrlFormatter';
export * from './imagePlaceholder';
export * from './imageValidator';
export * from './imageCache';

// Явно экспортируем функции из corsProxyService, чтобы избежать конфликта имен
export { 
  getCurrentProxyInfo,
  getCurrentProxyName,
  getCorsProxyUrl,
  getMaxProxyAttempts,
  resetProxyIndex,
  isUrlWithCorsProxy,
  switchToNextProxy,
  applyCorsProxy,
  shouldUseCorsProxy
} from './corsProxyService';
