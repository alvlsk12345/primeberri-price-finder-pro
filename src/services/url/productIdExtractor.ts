
// Since this is a read-only file we can't modify it directly,
// Create a compatibility layer for the missing export

// Define extractProductId function if it's not already exported by the original
export const extractProductId = (url: string): string => {
  // If input is not a URL but potentially an ID already, return it directly
  if (!url.includes('/') && !url.includes('.')) {
    return url;
  }
  
  // Simple implementation to extract product ID from URL
  try {
    const urlParts = url.split('/');
    // Return last part of URL or a fallback if it doesn't exist
    const lastPart = urlParts[urlParts.length - 1];
    
    // If the last part contains parameters, strip them
    if (lastPart && lastPart.includes('?')) {
      return lastPart.split('?')[0];
    }
    
    return lastPart || 'unknown-id';
  } catch (e) {
    console.error('Error extracting product ID:', e);
    return 'error-id';
  }
};

// Also provide extractProductIdFromUrl as an alias to match the imports
export { extractProductId as extractProductIdFromUrl };
