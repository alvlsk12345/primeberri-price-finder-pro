
import React from 'react';
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Пользователь попытался получить доступ к несуществующему маршруту:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Упс! Страница не найдена</p>
          <p className="text-gray-500 mb-8">
            Запрошенная страница не существует или была перемещена.
          </p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-brand text-white rounded-md hover:bg-brand/90 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
