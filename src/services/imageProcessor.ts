
// Реэкспорт всех функций из модуля imageProcessor для обратной совместимости
export { 
    processProductImage,
    getBaseSizeImageUrl,
    getLargeSizeImageUrl,
    getZylalabsSizeImageUrl
} from './image/imageProcessor';

// Реэкспорт других часто используемых функций для удобства
export { 
    isZylalabsImage,
    isGoogleShoppingImage,
    isGoogleCseImage
} from './image/imageSourceDetector';

export {
    isValidImageUrl
} from './image/imageValidator';
