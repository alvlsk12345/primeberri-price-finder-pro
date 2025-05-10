
// Этот файл служит связующим звеном для обратной совместимости
// и переадресует все импорты на новые модули

import { 
  processProductImage as processImageFromModule,
  isZylalabsImage as isZylalabsImageFromModule,
  isGoogleShoppingImage as isGoogleShoppingImageFromModule,
  isGoogleCseImage as isGoogleCseImageFromModule
} from './image';

// Реэкспорт функций для обратной совместимости
export const isZylalabsImage = isZylalabsImageFromModule;
export const isGoogleShoppingImage = isGoogleShoppingImageFromModule;
export const isGoogleCseImage = isGoogleCseImageFromModule;
export const processProductImage = processImageFromModule;
