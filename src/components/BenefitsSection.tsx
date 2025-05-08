
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BenefitsSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Прозрачность расчетов</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Клиенты сразу видят итоговую цену со всеми включенными расходами, что повышает доверие и снижает беспокойство о непредвиденных расходах.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Мгновенные расчеты</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Пользователи получают мгновенные результаты, что ускоряет процесс принятия решений.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Легкий переход</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Зарегистрированные пользователи могут сразу продолжить покупку, что минимизирует отказ от корзины.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
