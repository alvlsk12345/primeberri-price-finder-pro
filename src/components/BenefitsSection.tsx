
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BenefitsSection: React.FC = () => {
  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-center mb-6">Наши преимущества</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Широкий выбор</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Доступ к товарам из разных магазинов Европы в одном месте</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Выгодные цены</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Прозрачная система расчета стоимости и доставки</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Быстрая доставка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Оперативная обработка заказов и доставка в короткие сроки</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
