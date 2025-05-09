
import React, { useEffect, useState } from 'react';

interface ProductCardPriceProps {
  price: string;
  availability?: string;
}

export const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ 
  price,
  availability
}) => {
  const [euroPrice, setEuroPrice] = useState<string>("€0.00");
  const [russianDeliveryPrice, setRussianDeliveryPrice] = useState<string>("₽0.00");

  useEffect(() => {
    console.log('ProductCardPrice received price:', price, typeof price);
    
    // Check if price is defined and valid
    if (!price || price === 'Цена не указана' || price === 'undefined') {
      console.log('Product price is undefined or not specified:', price);
      setEuroPrice("€0.00");
      setRussianDeliveryPrice("₽0.00");
      return;
    }
    
    // Извлекаем числовое значение из строки цены, обрабатываем различные форматы
    let numericPrice = 0;
    
    if (typeof price === 'string') {
      // Try to extract price with various formats
      const priceMatch = price.match(/[\d.,]+/);
      
      if (priceMatch && priceMatch[0]) {
        // Replace commas with dots for proper parsing
        numericPrice = parseFloat(priceMatch[0].replace(',', '.'));
        console.log(`Extracted price: ${numericPrice} from string: ${price}`);
      } else {
        console.log(`Could not extract numeric price from: ${price}, using 0`);
      }
    } else if (typeof price === 'number') {
      numericPrice = price;
      console.log(`Using numeric price directly: ${numericPrice}`);
    } else {
      console.log(`Invalid price format: ${typeof price}, using 0`);
    }
    
    // Определяем валюту из строки цены (€, $, £ и т.д.)
    let currency = "€"; // Default to Euro
    if (typeof price === 'string') {
      if (price.includes('€')) {
        currency = "€";
      } else if (price.includes('$')) {
        currency = "$";
      } else if (price.includes('£')) {
        currency = "£";
      } else if (price.includes('₽')) {
        currency = "₽";
      } else if (price.includes('EUR')) {
        currency = "€";
      } else if (price.includes('USD')) {
        currency = "$";
      } else if (price.includes('GBP')) {
        currency = "£";
      } else if (price.includes('RUB')) {
        currency = "₽";
      }
    }
    console.log(`Detected currency: ${currency}`);
    
    // Ensure we have a valid numeric price
    if (isNaN(numericPrice) || numericPrice === 0) {
      console.warn('Invalid numeric price, setting defaults');
      setEuroPrice("€0.00");
      setRussianDeliveryPrice("₽0.00");
      return;
    }
    
    // Конвертация в евро (для демонстрации - в реальности здесь будет API запрос)
    let priceInEuro = numericPrice;
    if (currency === "$") {
      priceInEuro = numericPrice * 0.92; // Примерный курс доллара к евро
    } else if (currency === "£") {
      priceInEuro = numericPrice * 1.18; // Примерный курс фунта к евро
    } else if (currency === "₽") {
      priceInEuro = numericPrice / 105; // Примерный курс рубля к евро
    }
    
    console.log(`Converted price to EUR: ${priceInEuro}`);

    // Расчет цены с доставкой в Россию: (цена с сайта * 1,05)*105.92
    const deliveryPrice = (priceInEuro * 1.05) * 105.92;
    console.log(`Calculated delivery price to Russia: ₽${deliveryPrice}`);

    // Форматирование цен для отображения с разделителями разрядов
    setEuroPrice(`€${priceInEuro.toFixed(2)}`);
    
    // Форматирование цены с доставкой с разделителями разрядов
    setRussianDeliveryPrice(`₽${new Intl.NumberFormat('ru-RU').format(Math.round(deliveryPrice))}`);
  }, [price]);

  return (
    <>
      <div className="font-bold text-lg">
        {euroPrice}
      </div>
      <div className="text-sm text-gray-700 font-medium">
        Цена с доставкой Вам в Россию: {russianDeliveryPrice}
      </div>
    </>
  );
};
