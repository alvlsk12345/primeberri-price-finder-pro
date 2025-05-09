
import { RATE_LIMIT_PER_MINUTE, MONTHLY_QUOTA } from './zylalabsConfig';
import { toast } from "@/components/ui/sonner";

// Simple in-memory rate limiter implementation
class RateLimiter {
  private requestTimestamps: number[] = [];
  private monthlyRequests: number = 0;
  private monthStart: number = new Date().setDate(1); // First day of current month
  
  constructor() {
    // Initialize with current month
    this.resetMonthlyCounterIfNeeded();
  }
  
  // Check if we can make a request now
  public canMakeRequest(): boolean {
    this.resetMonthlyCounterIfNeeded();
    this.cleanupOldRequests();
    
    // Check monthly quota
    if (this.monthlyRequests >= MONTHLY_QUOTA) {
      console.warn(`Monthly quota of ${MONTHLY_QUOTA} requests exceeded`);
      toast.warning(`Месячный лимит API запросов (${MONTHLY_QUOTA}) исчерпан.`);
      return false;
    }
    
    // Check per-minute rate limit
    if (this.requestTimestamps.length >= RATE_LIMIT_PER_MINUTE) {
      console.warn(`Rate limit of ${RATE_LIMIT_PER_MINUTE} requests per minute exceeded`);
      toast.warning(`Превышен лимит ${RATE_LIMIT_PER_MINUTE} запросов в минуту. Пожалуйста, подождите.`);
      return false;
    }
    
    return true;
  }
  
  // Record a request being made
  public recordRequest(): void {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.monthlyRequests++;
    
    // Save to localStorage for persistence between page loads
    this.saveToStorage();
  }
  
  // Get time in ms until next available request slot
  public getTimeUntilAvailable(): number {
    if (this.canMakeRequest()) {
      return 0;
    }
    
    // If monthly quota exceeded, calculate time to next month
    if (this.monthlyRequests >= MONTHLY_QUOTA) {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      return nextMonth.getTime() - now.getTime();
    }
    
    // If per-minute rate exceeded, calculate time until oldest request is 60 seconds old
    if (this.requestTimestamps.length > 0) {
      const oldestRequest = this.requestTimestamps[0];
      const now = Date.now();
      const timeToWait = Math.max(0, oldestRequest + 60000 - now);
      return timeToWait;
    }
    
    return 0;
  }
  
  // Clean up timestamps older than 1 minute
  private cleanupOldRequests(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
  }
  
  // Reset monthly counter if we've entered a new month
  private resetMonthlyCounterIfNeeded(): void {
    const currentMonthStart = new Date().setDate(1);
    if (currentMonthStart > this.monthStart) {
      console.log('New month started, resetting monthly request counter');
      this.monthStart = currentMonthStart;
      this.monthlyRequests = 0;
      this.saveToStorage();
    }
  }
  
  // Load rate limiter state from localStorage
  public loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem('zylalabs_rate_limiter');
      if (storedData) {
        const data = JSON.parse(storedData);
        this.requestTimestamps = data.requestTimestamps || [];
        this.monthlyRequests = data.monthlyRequests || 0;
        this.monthStart = data.monthStart || new Date().setDate(1);
        
        // Cleanup on load to remove old timestamps
        this.cleanupOldRequests();
        this.resetMonthlyCounterIfNeeded();
      }
    } catch (e) {
      console.error('Error loading rate limiter data', e);
    }
  }
  
  // Save rate limiter state to localStorage
  private saveToStorage(): void {
    try {
      const data = {
        requestTimestamps: this.requestTimestamps,
        monthlyRequests: this.monthlyRequests,
        monthStart: this.monthStart,
        lastUpdated: Date.now()
      };
      localStorage.setItem('zylalabs_rate_limiter', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving rate limiter data', e);
    }
  }
  
  // Get current usage statistics
  public getUsageStats(): {
    minuteUsage: number;
    minuteLimit: number;
    monthlyUsage: number;
    monthlyLimit: number;
    remainingMonthly: number;
  } {
    this.resetMonthlyCounterIfNeeded();
    this.cleanupOldRequests();
    
    return {
      minuteUsage: this.requestTimestamps.length,
      minuteLimit: RATE_LIMIT_PER_MINUTE,
      monthlyUsage: this.monthlyRequests,
      monthlyLimit: MONTHLY_QUOTA,
      remainingMonthly: MONTHLY_QUOTA - this.monthlyRequests
    };
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter();

// Load saved data on initialization
try {
  rateLimiter.loadFromStorage();
} catch (e) {
  console.error('Failed to initialize rate limiter', e);
}

// Function to attempt a rate-limited request
export const withRateLimiting = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getTimeUntilAvailable();
    
    if (waitTime > 0 && waitTime < 10000) {
      // If wait time is reasonable (less than 10 seconds), wait and retry
      console.log(`Rate limit reached. Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime + 100)); // Add 100ms buffer
      return withRateLimiting(fn);
    } else {
      // If wait time is too long, throw an error
      throw new Error('API rate limit exceeded. Please try again later.');
    }
  }
  
  // Record the request before making it
  rateLimiter.recordRequest();
  
  // Execute the request function
  return fn();
};
