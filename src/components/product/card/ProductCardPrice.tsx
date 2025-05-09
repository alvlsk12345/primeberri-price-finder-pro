
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
    if (!price || price === 'Цена не указана') {
      console.warn('Product price is undefined or not specified, using default values');
      setEuroPrice("€0.00");
      setRussianDeliveryPrice("₽0.00");
      return;
    }
    
    // Извлекаем числовое значение из строки цены
    const priceMatch = price.match(/\d+([.,]\d+)?/);
    const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;

    // Определяем валюту из строки цены (€, $, £ и т.д.)
    const currencyMatch = price.match(/[€$£₽]/);
    const currency = currencyMatch ? currencyMatch[0] : "€";

    // Конвертация в евро (для демонстрации - в реальности здесь будет API запрос)
    let priceInEuro = numericPrice;
    if (currency === "$") {
      priceInEuro = numericPrice * 0.92; // Примерный курс доллара к евро
    } else if (currency === "£") {
      priceInEuro = numericPrice * 1.18; // Примерный курс фунта к евро
    } else if (currency === "₽") {
      priceInEuro = numericPrice / 105; // Примерный курс рубля к евро
    }

    // Расчет цены с доставкой в Россию: (цена с сайта * 1,05)*105.92
    const deliveryPrice = (priceInEuro * 1.05) * 105.92;

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
