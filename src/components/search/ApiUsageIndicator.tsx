
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { getApiUsageStatistics } from "@/services/api/searchService";

export const ApiUsageIndicator: React.FC = () => {
  const [usageStats, setUsageStats] = React.useState({
    minuteUsage: 0,
    minuteLimit: 60,
    monthlyUsage: 0,
    monthlyLimit: 10000,
    remainingMonthly: 10000
  });

  React.useEffect(() => {
    // Get initial stats
    setUsageStats(getApiUsageStatistics());
    
    // Update stats every 5 seconds
    const intervalId = setInterval(() => {
      setUsageStats(getApiUsageStatistics());
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const monthlyPercentage = (usageStats.monthlyUsage / usageStats.monthlyLimit) * 100;
  const minutePercentage = (usageStats.minuteUsage / usageStats.minuteLimit) * 100;
  
  // Don't show if no API requests have been made yet
  if (usageStats.monthlyUsage === 0 && usageStats.minuteUsage === 0) {
    return null;
  }

  return (
    <div className="mt-2 text-xs text-gray-500">
      <div className="flex justify-between mb-1">
        <span>API запросов за месяц: {usageStats.monthlyUsage}/{usageStats.monthlyLimit}</span>
        <span className={monthlyPercentage > 90 ? "text-red-500 font-medium" : "text-gray-600"}>
          {usageStats.remainingMonthly} осталось
        </span>
      </div>
      <Progress value={monthlyPercentage} className="h-1 mb-2" />
      
      <div className="flex justify-between mb-1">
        <span>Запросов в минуту: {usageStats.minuteUsage}/{usageStats.minuteLimit}</span>
      </div>
      <Progress value={minutePercentage} className="h-1" />
    </div>
  );
};
