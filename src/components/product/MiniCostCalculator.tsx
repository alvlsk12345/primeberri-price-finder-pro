
import React, { useState, useEffect } from 'react';
import { Product } from "@/services/types";

type MiniCostCalculatorProps = {
  product: Product;
};

export const MiniCostCalculator: React.FC<MiniCostCalculatorProps> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [parsedPrice, setParsedPrice] = useState(0);
  const [euroPrice, setEuroPrice] = useState(0);
  const [russianDeliveryPrice, setRussianDeliveryPrice] = useState(0);

  // Извлекаем числовое значение из строки цены и конвертируем всё в евро
  useEffect(() => {
    setIsLoading(true);
    
    const priceMatch = product.price.match(/\d+([.,]\d+)?/);
    const extractedPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
    setParsedPrice(extractedPrice);

    // Определяем валюту из строки цены
    const currencyMatch = product.price.match(/[€$£₽]/);
    const currency = currencyMatch ? currencyMatch[0] : "€";

    // Конвертация в евро 
    let priceInEuro = extractedPrice;
    if (currency === "$") {
      priceInEuro = extractedPrice * 0.92; // Примерный курс доллара к евро
    } else if (currency === "£") {
      priceInEuro = extractedPrice * 1.18; // Примерный курс фунта к евро
    } else if (currency === "₽") {
      priceInEuro = extractedPrice / 105; // Примерный курс рубля к евро
    }
    setEuroPrice(priceInEuro);

    // Расчет цены с доставкой в Россию по новой формуле
    const deliveryPrice = (priceInEuro * 1.05) * 105.92;
    setRussianDeliveryPrice(deliveryPrice);
    
    setIsLoading(false);
  }, [product.price]);

  if (isLoading) {
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-md text-center text-xs">
        <div className="animate-pulse">Расчет стоимости...</div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-600">Цена:</span>
        <span className="font-semibold">€{euroPrice.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-600">С доставкой в РФ:</span>
        <span className="font-semibold">₽{russianDeliveryPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};
