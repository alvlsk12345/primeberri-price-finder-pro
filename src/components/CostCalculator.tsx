
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getExchangeRate } from "@/services/exchangeService";
import { Product } from "@/services/types";

type CostCalculatorProps = {
  product: Product;
};

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  product
}) => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duty, setDuty] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [parsedPrice, setParsedPrice] = useState(0);

  // Parse the price from string format (e.g., "250 €") to number
  useEffect(() => {
    // Extract numerical value from price string using regex
    const priceMatch = product.price.match(/\d+([.,]\d+)?/);
    const extractedPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
    setParsedPrice(extractedPrice);
  }, [product.price]);

  // Получаем актуальный курс валюты
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoading(true);
      const rate = await getExchangeRate(product.currency);
      setExchangeRate(rate);
      setIsLoading(false);
    };
    fetchExchangeRate();
  }, [product.currency]);

  // Расчет пошлины и общей стоимости
  useEffect(() => {
    if (exchangeRate === null) return;
    let calculatedDuty = 0;

    // Если цена товара больше 200 EUR/USD, рассчитываем пошлину
    if (parsedPrice > 200) {
      calculatedDuty = (parsedPrice - 200) * 0.15;
    }
    setDuty(calculatedDuty);

    // Рассчитываем общую стоимость (товар + пошлина) в рублях
    const priceInRub = parsedPrice * exchangeRate;
    const dutyInRub = calculatedDuty * exchangeRate;
    setTotalPrice(priceInRub + dutyInRub);
  }, [parsedPrice, exchangeRate]);
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-4">
            Загрузка данных о курсе валют...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Расчет стоимости</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Цена товара:</span>
          <span className="font-medium">{parsedPrice.toFixed(2)} {product.currency}</span>
        </div>
        <div className="flex justify-between">
          <span>Курс {product.currency}:</span>
          <span className="font-medium">{exchangeRate?.toFixed(2)} ₽</span>
        </div>
        {duty > 0 && (
          <div className="flex justify-between text-orange-700">
            <span>Таможенная пошлина:</span>
            <span className="font-medium">{duty.toFixed(2)} {product.currency}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Итого:</span>
            <span>{totalPrice.toFixed(2)} ₽</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 pt-0">
        <p>* Расчет приблизительный и не включает доставку</p>
      </CardFooter>
    </Card>
  );
};
