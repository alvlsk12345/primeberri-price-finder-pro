
import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export const ApiUsageInfo: React.FC = () => {
  const {
    searchResults,
    apiInfo,
    currentPage,
    totalPages
  } = useSearch();

  if (!apiInfo || !Object.keys(apiInfo).length) {
    return null;
  }

  const monthlyRemaining = apiInfo['X-Zyla-API-Calls-Monthly-Remaining'] || apiInfo['totalGerman'] || 'N/A';
  const monthlyLimit = apiInfo['X-Zyla-RateLimit-Limit'] || apiInfo['totalProducts'] || 'N/A';
  const dailyRemaining = apiInfo['X-Zyla-API-Calls-Daily-Remaining'] || apiInfo['totalOtherEu'] || 'N/A';

  return (
    <Card className="mb-4 bg-slate-50 border-slate-200">
      <CardContent className="py-3">
        <div className="flex items-center gap-2 text-sm">
          <Info size={16} className="text-slate-400" />
          <span className="text-slate-700">
            API запросы: <Badge variant="outline" className="ml-1 font-mono">{monthlyRemaining}</Badge> из <Badge variant="outline" className="ml-1 font-mono">{monthlyLimit}</Badge>
            {dailyRemaining !== 'N/A' && (
              <span className="ml-2">
                Осталось сегодня: <Badge variant="outline" className="ml-1 font-mono">{dailyRemaining}</Badge>
              </span>
            )}
            {searchResults.length > 0 && totalPages > 0 && (
              <span className="ml-2">
                Страница: <Badge variant="outline" className="ml-1 font-mono">{currentPage}</Badge> из <Badge variant="outline" className="ml-1 font-mono">{totalPages}</Badge>
              </span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
