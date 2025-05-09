
// Since this is a read-only file we can't modify it directly,
// Instead create a new file that re-exports the needed functions from the original
// This is a compatibility layer

// Helper function to extract store name from domain
export const getStoreMapEntry = (storeDomain: string): string => {
  // This is a simple implementation that will work until the original is fixed
  // Check if domain is null/undefined
  if (!storeDomain) {
    return 'unknown';
  }
  
  // Remove any protocol prefixes if present
  let cleanDomain = storeDomain.toLowerCase();
  if (cleanDomain.includes('://')) {
    cleanDomain = cleanDomain.split('://')[1];
  }
  
  // Handle known domains with special cases
  if (cleanDomain.includes('amazon')) return 'amazon';
  if (cleanDomain.includes('ebay')) return 'ebay';
  if (cleanDomain.includes('walmart')) return 'walmart';
  if (cleanDomain.includes('target')) return 'target';
  if (cleanDomain.includes('bestbuy')) return 'bestbuy';
  
  // Generic domain handling
  const domainParts = cleanDomain.split('.');
  if (domainParts.length > 1) {
    // Return the main domain name without TLD
    return domainParts[domainParts.length - 2];
  }
  
  return cleanDomain || 'unknown';
};
