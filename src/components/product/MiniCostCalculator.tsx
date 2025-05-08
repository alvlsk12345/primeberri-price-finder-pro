
import React, { useState, useEffect } from 'react';
import { getExchangeRate } from "@/services/exchangeService";
import { Product } from "@/services/types";

type MiniCostCalculatorProps = {
  product: Product;
};

export const MiniCostCalculator: React.FC<MiniCostCalculatorProps> = ({ product }) => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedPrice, setParsedPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Извлекаем числовое значение из строкового формата цены
  useEffect(() => {
    const priceMatch = product.price.match(/\d+([.,]\d+)?/);
    const extractedPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
    setParsedPrice(extractedPrice);
  }, [product.price]);

  // Получаем курс валюты
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoading(true);
      const rate = await getExchangeRate(product.currency);
      setExchangeRate(rate);
      setIsLoading(false);
    };
    
    fetchExchangeRate();
  }, [product.currency]);

  // Расчет общей стоимости
  useEffect(() => {
    if (exchangeRate === null) return;
    
    // Рассчитываем общую стоимость в рублях
    const priceInRub = parsedPrice * exchangeRate;
    setTotalPrice(priceInRub);
    
  }, [parsedPrice, exchangeRate]);

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
        <span className="text-gray-600">Стоимость:</span>
        <span className="font-semibold">{product.price}</span>
      </div>
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-600">В рублях:</span>
        <span className="font-semibold">{totalPrice.toFixed(2)} ₽</span>
      </div>
      
      <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200">
        <span>Курс:</span>
        <span>1 {product.currency} = {exchangeRate} ₽</span>
      </div>
    </div>
  );
};
