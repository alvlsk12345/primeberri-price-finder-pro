
import { StoreMap } from '../types';

// Расширенная карта реальных доменов магазинов
const storeMap: StoreMap = {
  'Amazon': 'amazon.com',
  'Amazon.co.uk': 'amazon.co.uk',
  'Amazon UK': 'amazon.co.uk',
  'eBay': 'ebay.com',
  'eBay UK': 'ebay.co.uk',
  'Zalando': 'zalando.eu',
  'Zalando UK': 'zalando.co.uk',
  'ASOS': 'asos.com',
  'JD Sports': 'jdsports.co.uk',
  'JD Sports UK': 'jdsports.co.uk',
  'Nike Store': 'nike.com',
  'Nike.com': 'nike.com',
  'Nike': 'nike.com',
  'Foot Locker': 'footlocker.eu',
  'FootLocker': 'footlocker.co.uk',
  'Footlocker UK': 'footlocker.co.uk',
  'Sports Direct': 'sportsdirect.com',
  'Sports Direct UK': 'sportsdirect.com',
  'Adidas': 'adidas.com',
  'Adidas UK': 'adidas.co.uk',
  'H&M': 'hm.com',
  'Zara': 'zara.com',
  'Zara UK': 'zara.com',
  'Sportisimo': 'sportisimo.eu',
  'MandM': 'mandmdirect.com',
  'MandM Direct': 'mandmdirect.com',
  'Argos': 'argos.co.uk',
  'Decathlon': 'decathlon.co.uk',
  'Go Outdoors': 'gooutdoors.co.uk',
  'ProDirect': 'prodirectsport.com',
  'Pro Direct': 'prodirect-soccer.com',
  'Pro:Direct Soccer': 'prodirectsoccer.com',
  'Интернет-магазин': 'shop.example.com'
};

// Улучшенная функция для получения доменного имени магазина с учетом вариаций написания
export const getStoreDomain = (storeName: string | undefined): string => {
  if (!storeName) return 'shop.example.com';
  
  // Нормализуем имя магазина для поиска по ключу
  const normalizedStore = Object.keys(storeMap).find(
    store => store.toLowerCase() === storeName.toLowerCase()
  );
  
  return normalizedStore ? storeMap[normalizedStore] : 
         storeName.toLowerCase().includes('amazon') ? 'amazon.com' :
         storeName.toLowerCase().includes('ebay') ? 'ebay.com' :
         storeName.toLowerCase().includes('nike') ? 'nike.com' :
         storeName.toLowerCase().includes('adidas') ? 'adidas.com' :
         storeName.toLowerCase().includes('mandm') ? 'mandmdirect.com' :
         'shop.example.com';
};

// Add this function to match the import in linkGenerator.ts
export const getStoreMapEntry = getStoreDomain;
