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
  const [duty, setDuty] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

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
    if (product.price > 200) {
      calculatedDuty = (product.price - 200) * 0.15;
    }
    
    setDuty(calculatedDuty);
    
    // Рассчитываем общую стоимость (товар + пошлина) в рублях
    const priceInRub = product.price * exchangeRate;
    const dutyInRub = calculatedDuty * exchangeRate;
    setTotalPrice(priceInRub + dutyInRub);
    
  }, [product, exchangeRate]);

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
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Стоимость товара:</span>
            <span className="font-semibold">{product.price} {product.currency}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Стоимость товара в рублях:</span>
            <span className="font-semibold">{exchangeRate ? (product.price * exchangeRate).toFixed(2) : "—"} ₽</span>
          </div>
          
          {duty > 0 && (
            <div className="flex items-center justify-between text-amber-600">
              <span>Таможенная пошлина (15% от суммы свыше 200 {product.currency}):</span>
              <span className="font-semibold">
                {duty.toFixed(2)} {product.currency} 
                {exchangeRate && ` (${(duty * exchangeRate).toFixed(2)} ₽)`}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-gray-800 font-medium">Текущий курс валюты:</span>
            <span className="font-semibold">1 {product.currency} = {exchangeRate} ₽</span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-gray-800 font-medium">Итоговая стоимость:</span>
            <span className="text-lg font-bold">{totalPrice.toFixed(2)} ₽</span>
          </div>
          
          <div className="pt-3 border-t border-gray-200 text-sm text-gray-500">
            <p className="mb-1">* Расчет приблизительный и может отличаться от фактической стоимости.</p>
            <p>* Не включает стоимость доставки и другие дополнительные расходы.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
