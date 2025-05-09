
import React from 'react';
import { Check, TrendingUp, Truck, CreditCard } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Check className="h-10 w-10 text-brand-red" />,
      title: 'Гарантия оригинальности',
      description: 'Мы работаем только с проверенными европейскими магазинами и брендами'
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-brand-red" />,
      title: 'Выгодные цены',
      description: 'Экономия до 40% по сравнению с ценами в России'
    },
    {
      icon: <Truck className="h-10 w-10 text-brand-red" />,
      title: 'Быстрая доставка',
      description: 'Надежная доставка от 9 дней по всей России'
    },
    {
      icon: <CreditCard className="h-10 w-10 text-brand-red" />,
      title: 'Удобная оплата',
      description: 'Принимаем оплату российской картой'
    }
  ];

  return (
    <section className="py-12 px-4 rounded-xl mt-12 bg-white shadow-sm">
      <div className="text-center mb-8">
        <span className="inline-block px-4 py-1 bg-brand-lightBlue text-sm font-medium rounded-full mb-2">
          Помогаем
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Выкуп и доставка <br className="hidden md:block" />
          оригинальных брендов из Европы
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
            <div className="mb-4 flex justify-center">
              {benefit.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">{benefit.title}</h3>
            <p className="text-gray-600 text-center">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
