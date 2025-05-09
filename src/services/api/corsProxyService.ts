
import { CORS_PROXIES } from "./zylalabsConfig";

/**
 * Detects the best working proxy for the current environment
 * @returns Information about proxy status and the best available proxy index
 */
export const detectBestProxy = async (): Promise<{
  directAccessWorks: boolean,
  bestProxyIndex: number,
  proxyStatuses: Record<number, boolean>
}> => {
  const results: Record<number, boolean> = {};
  let bestProxyIndex = 0;
  
  // Try each proxy in order
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const proxyName = proxy ? proxy.slice(0, 20) : "Direct connection";
    console.log(`Testing proxy ${i}: ${proxyName}...`);
    
    try {
      // Use a simple request to test the proxy
      const testUrl = `${proxy}https://api.zylalabs.com/api/2033/search+products?q=test&country=gb&language=en&page=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      // If we get any response (even an error response), the proxy works
      results[i] = true;
      console.log(`Proxy ${i} (${proxyName}) works!`);
      
      // Direct connection is always preferred if it works
      if (i === 0 && response.ok) {
        bestProxyIndex = 0;
        break;
      } else if (response.ok && bestProxyIndex === 0) {
        // If direct connection doesn't work, use the first working proxy
        bestProxyIndex = i;
      }
    } catch (e) {
      results[i] = false;
      console.log(`Proxy ${i} (${proxyName}) failed: ${e.message}`);
    }
  }
  
  console.log(`Best proxy index: ${bestProxyIndex}`);
  return {
    directAccessWorks: results[0] || false,
    bestProxyIndex,
    proxyStatuses: results
  };
};

/**
 * Returns the next proxy index to try after a failure
 */
export const getNextProxyIndex = (currentIndex: number): number => {
  return (currentIndex + 1) % CORS_PROXIES.length;
};
