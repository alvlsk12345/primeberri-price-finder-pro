
/**
 * Этот файл служит для обратной совместимости.
 * Все функции переехали в модуль src/services/image/
 */

// Реэкспортируем функции из новых модулей
export { 
  isGoogleShoppingImage,
  isZylalabsImage,
  isGoogleCseImage,
  isUrlWithCorsProxy
} from './image/imageSourceDetector';

export {
  isPlaceholderImage,
  getPlaceholderImageUrl
} from './image/imagePlaceholder';

export {
  isValidImageUrl
} from './image/imageValidator';

export {
  getUniqueImageUrl
} from './image/imageCache';

export {
  needsProxying,
  getProxiedImageUrl,
  isProxiedUrl
} from './image/imageProxy';
