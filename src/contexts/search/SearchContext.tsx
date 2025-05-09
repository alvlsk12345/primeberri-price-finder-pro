
import React, { createContext } from 'react';
import { SearchContextType } from './types';

// Create context with default values
export const SearchContext = createContext<SearchContextType | undefined>(undefined);
