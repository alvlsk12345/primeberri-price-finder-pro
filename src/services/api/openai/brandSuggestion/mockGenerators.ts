
import { BrandSuggestion } from "@/services/types";

/**
 * Создает список примерных предложений брендов на основе описания
 * @param description Описание товара
 * @returns Список предложений брендов
 */
export const createMockBrandSuggestions = (description: string): BrandSuggestion[] => {
  // Базовый список брендов, который настраивается в зависимости от описания
  const mockBrands: BrandSuggestion[] = [
    {
      brand: "Samsung",
      product: "Galaxy S21",
      description: "Флагманский смартфон с тройной камерой и мощным процессором",
      imageUrl: "https://images.samsung.com/is/image/samsung/p6pim/ru/galaxy-s21/gallery/ru-galaxy-s21-5g-g991-sm-g991bzadeue-thumb-368338803"
    },
    {
      brand: "Apple",
      product: "iPhone 13",
      description: "Смартфон с передовым процессором A15 Bionic и системой камер Pro",
      imageUrl: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-family-select-2021?wid=940&hei=1112&fmt=jpeg&qlt=80&.v=1629842667000"
    },
    {
      brand: "Sony",
      product: "PlayStation 5",
      description: "Игровая консоль нового поколения с поддержкой 4K и высокой частотой кадров",
      imageUrl: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21"
    },
    {
      brand: "Nike",
      product: "Air Max 270",
      description: "Спортивная обувь с технологией амортизации Air и стильным дизайном",
      imageUrl: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png"
    },
    {
      brand: "Philips",
      product: "Hue Smart Light",
      description: "Умная лампа с возможностью управления через смартфон и голосовые команды",
      imageUrl: "https://images.philips-hue.com/is/image/PhilipsLighting/8718699673147_AU-CDPU"
    },
    {
      brand: "Bosch",
      product: "Series 8",
      description: "Встраиваемая бытовая техника премиум-класса для современной кухни",
      imageUrl: "https://media3.bosch-home.com/Product_Shots/1600x900/MCIM02448510_HSG856XC6_def.png"
    }
  ];

  // Добавляем специфичные бренды для различных категорий
  if (description.toLowerCase().includes('телефон') || description.toLowerCase().includes('смартфон')) {
    mockBrands.push(
      {
        brand: "Xiaomi",
        product: "Mi 11",
        description: "Флагманский смартфон с AMOLED дисплеем и процессором Snapdragon",
        imageUrl: "https://i02.appmifile.com/476_operator_sg/18/05/2021/652c45640f8bb7bfdf56666f8f7ddde4.png"
      }
    );
  } else if (description.toLowerCase().includes('ноутбук') || description.toLowerCase().includes('компьютер')) {
    mockBrands.push(
      {
        brand: "Lenovo",
        product: "ThinkPad X1",
        description: "Профессиональный ноутбук с высокой производительностью и надежностью",
        imageUrl: "https://www.lenovo.com/medias/lenovo-laptop-thinkpad-x1-carbon-gen-9-series-front.png"
      }
    );
  } else if (description.toLowerCase().includes('чайник') || description.toLowerCase().includes('кухня')) {
    mockBrands.push(
      {
        brand: "Tefal",
        product: "Smart Kettle",
        description: "Умный электрический чайник с регулируемой температурой нагрева",
        imageUrl: "https://tefal.com.ru/medias/?context=bWFzdGVyfGltYWdlc3w3OTYzNXxpbWFnZS9qcGVnfGltYWdlcy9oNjQvaDBkLzEzOTgzMzE4ODMxMTM0LmpwZ3w3MzA4YTdmY2Q2NWZlMDQ1OGE5NjliYjBjODAyNmY1NDdhM2NlYjEzZDYwZmYzNDdmNjIyNTI4ZmNmMDBmMWU3"
      }
    );
  }

  // Перемешиваем и возвращаем первые 6 брендов
  return shuffleArray(mockBrands).slice(0, 6);
};

/**
 * Функция для перемешивания массива
 * @param array Массив для перемешивания
 * @returns Перемешанный массив
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
