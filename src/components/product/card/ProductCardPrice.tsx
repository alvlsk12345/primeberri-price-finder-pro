
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
    // Check if price is defined before processing
    if (!price || price === 'Цена не указана' || price === 'undefined') {
      console.log('Product price is undefined or not specified:', price);
      setEuroPrice("€0.00");
      setRussianDeliveryPrice("₽0.00");
      return;
    }
    
    // Извлекаем числовое значение из строки цены, обрабатываем различные форматы
    const priceMatch = typeof price === 'string' ? price.match(/[\d.,]+/) : null;
    let numericPrice = 0;
    
    if (priceMatch && priceMatch[0]) {
      // Replace commas with dots for proper parsing
      numericPrice = parseFloat(priceMatch[0].replace(',', '.'));
      console.log(`Extracted price: ${numericPrice} from string: ${price}`);
    } else if (typeof price === 'number') {
      numericPrice = price;
      console.log(`Using numeric price directly: ${numericPrice}`);
    } else {
      console.log(`Could not extract numeric price from: ${price}, using 0`);
    }
    
    // Определяем валюту из строки цены (€, $, £ и т.д.)
    let currency = "€"; // Default to Euro
    if (typeof price === 'string') {
      const currencyMatch = price.match(/[€$£₽]/);
      if (currencyMatch) {
        currency = currencyMatch[0];
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
