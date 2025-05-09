
// Since this is a read-only file we can't modify it directly,
// Create a compatibility layer for the missing export

// Re-export extractProductId and provide extractProductIdFromUrl as an alias
export { extractProductId as extractProductIdFromUrl } from "@/services/url/productIdExtractor";
