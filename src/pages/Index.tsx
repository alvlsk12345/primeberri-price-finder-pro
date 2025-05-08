
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchResults } from "@/components/SearchResults";
import { CostCalculator } from "@/components/CostCalculator";
import { toast } from "@/components/ui/sonner";
import { Search, ArrowRight } from 'lucide-react';

const Index = () => {
  const [productLink, setProductLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSearch = async () => {
    if (!productLink) {
      toast.error('Пожалуйста, введите ссылку на товар');
      return;
    }

    setIsLoading(true);
    try {
      // В реальном приложении здесь был бы запрос к API
      // Пока используем заглушку для демонстрации интерфейса
      setTimeout(() => {
        const mockResults = [
          {
            id: '1',
            name: 'Кожаная сумка',
            price: 250,
            currency: 'EUR',
            image: 'https://via.placeholder.com/150',
            store: 'Zalando'
          },
          {
            id: '2',
            name: 'Спортивные кроссовки',
            price: 180,
            currency: 'EUR',
            image: 'https://via.placeholder.com/150',
            store: 'Amazon'
          },
          {
            id: '3',
            name: 'Дизайнерские джинсы',
            price: 220,
            currency: 'EUR',
            image: 'https://via.placeholder.com/150',
            store: 'H&M'
          }
        ];

        setSearchResults(mockResults);
        setIsLoading(false);
        toast.success('Товары найдены!');
      }, 1500);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Произошла ошибка при поиске товаров');
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleGoToPrimeberri = () => {
    if (selectedProduct) {
      // В реальной реализации здесь будет логика перехода на сайт Primeberri
      window.open('https://primeberri.com/', '_blank');
      toast.success('Переход на сайт Primeberri');
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };

  const handleCopyLink = () => {
    if (selectedProduct) {
      // В реальной реализации здесь будет логика копирования ссылки
      navigator.clipboard.writeText(productLink);
      toast.success('Ссылка скопирована!');
    } else {
      toast.error('Пожалуйста, выберите товар');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Primeberri Price Finder</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Узнайте, сколько вы сэкономите на товаре из Европы и США
            </CardTitle>
            <CardDescription>
              Введите ссылку на товар, и мы покажем, сколько вы можете сэкономить при доставке в Россию
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Search input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Введите ссылку на товар, например, https://www.zalando.com/..."
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !productLink}
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <span>Поиск...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search size={18} /> Рассчитать экономию
                    </span>
                  )}
                </Button>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Результаты поиска:</h2>
                  <SearchResults 
                    results={searchResults} 
                    onSelect={handleProductSelect} 
                    selectedProduct={selectedProduct}
                  />
                </div>
              )}

              {/* Cost calculator */}
              {selectedProduct && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Расчет стоимости:</h2>
                  <CostCalculator product={selectedProduct} />

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button 
                      onClick={handleCopyLink} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Копировать ссылку
                    </Button>
                    <Button 
                      onClick={handleGoToPrimeberri} 
                      className="flex-1"
                    >
                      <span className="flex items-center gap-2">
                        Перейти на Primeberri <ArrowRight size={18} />
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits section */}
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

        {/* Footer */}
        <footer className="text-center mt-16 pb-8 text-gray-500 text-sm">
          <p>© 2025 Primeberri Price Finder. Все права защищены.</p>
          <p className="mt-1">
            Этот сервис не аффилирован с Primeberri, а является независимым инструментом для расчетов.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
