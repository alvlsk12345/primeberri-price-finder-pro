
// Since this is a read-only file we can't modify it directly,
// Instead create a new file that re-exports the needed functions from the original
// This is a compatibility layer

// Re-exporting from the original file
export { getStoreMapEntry } from "@/services/url/storeMapper";

// Provide a local implementation if it doesn't exist in the original file
export const getStoreMapEntry = (storeDomain: string): string => {
  // This is a simple implementation that will work until the original is fixed
  const domainParts = storeDomain.split('.');
  if (domainParts.length > 1) {
    return domainParts[domainParts.length - 2];
  }
  return storeDomain;
};
