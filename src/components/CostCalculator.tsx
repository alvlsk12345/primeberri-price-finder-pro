
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { getExchangeRate } from "@/services/exchangeService";
import { Product } from "@/services/types";

type CostCalculatorProps = {
  product: Product;
};

export const CostCalculator: React.FC<CostCalculatorProps> = ({ product }) => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedPrice, setParsedPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [euroPrice, setEuroPrice] = useState(0);
  const [russianDeliveryPrice, setRussianDeliveryPrice] = useState(0);

  // Извлекаем числовое значение из строки цены
  useEffect(() => {
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
  }, [product.price]);

  // Этот компонент больше не используется напрямую, но сохранен для 
  // возможного использования в будущем. Используйте вместо него
  // обновленный компонент ProductCardPrice.

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Стоимость товара:</span>
            <span className="font-semibold">€{euroPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Стоимость с доставкой в Россию:</span>
            <span className="font-semibold">₽{russianDeliveryPrice.toFixed(2)}</span>
          </div>
          
          <div className="pt-3 border-t border-gray-200 text-sm text-gray-500">
            <p className="mb-1">* Расчет приблизительный и может отличаться от фактической стоимости.</p>
            <p>* Не включает другие дополнительные расходы.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
