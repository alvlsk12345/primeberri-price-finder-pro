
/**
 * Этот файл служит для обратной совместимости.
 * Все функции переехали в модуль src/services/image/
 */

// Реэкспортируем функции из новых модулей
export { 
  isGoogleShoppingImage,
  isZylalabsImage,
  isGoogleCseImage
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

