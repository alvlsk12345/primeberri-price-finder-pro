
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

    // Форматирование цен для отображения
    setEuroPrice(`€${priceInEuro.toFixed(2)}`);
    setRussianDeliveryPrice(`₽${deliveryPrice.toFixed(2)}`);
  }, [price]);

  return (
    <>
      <div className="font-bold text-lg">
        {euroPrice}
      </div>
      <div className="text-sm text-gray-700 font-medium">
        Цена с доставкой: {russianDeliveryPrice}
      </div>
      {availability && (
        <div className="text-xs text-gray-500 mt-1">
          {availability}
        </div>
      )}
    </>
  );
};
