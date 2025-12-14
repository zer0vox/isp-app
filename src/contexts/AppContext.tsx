import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { RecentSearch, ComparisonItem } from '../types';
import type { GeolocationData } from '../utils/geolocation';

interface AppContextType {
  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Favorites
  favorites: string[]; // ISP IDs
  addFavorite: (ispId: string) => void;
  removeFavorite: (ispId: string) => void;
  isFavorite: (ispId: string) => boolean;

  // Comparison
  comparison: ComparisonItem[];
  addToComparison: (item: ComparisonItem) => void;
  removeFromComparison: (ispId: string) => void;
  clearComparison: () => void;

  // Recent searches
  recentSearches: RecentSearch[];
  addRecentSearch: (search: RecentSearch) => void;
  clearRecentSearches: () => void;

  // Plan type filter (business vs residential)
  planType: 'residential' | 'business' | 'both';
  setPlanType: (type: 'residential' | 'business' | 'both') => void;

  // Geolocation
  geolocation: GeolocationData | null;
  setGeolocation: (data: GeolocationData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [planType, setPlanType] = useState<'residential' | 'business' | 'both'>('residential');
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);

  // Dark mode functions
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  // Favorites functions
  const addFavorite = (ispId: string) => {
    setFavorites(prev => [...new Set([...prev, ispId])]);
  };

  const removeFavorite = (ispId: string) => {
    setFavorites(prev => prev.filter(id => id !== ispId));
  };

  const isFavorite = (ispId: string) => {
    return favorites.includes(ispId);
  };

  // Comparison functions
  const addToComparison = (item: ComparisonItem) => {
    setComparison(prev => {
      // Limit to 3 items
      if (prev.length >= 3) {
        return prev;
      }
      // Check if ISP already in comparison
      if (prev.some(i => i.isp.id === item.isp.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromComparison = (ispId: string) => {
    setComparison(prev => prev.filter(item => item.isp.id !== ispId));
  };

  const clearComparison = () => {
    setComparison([]);
  };

  // Recent searches functions
  const addRecentSearch = (search: RecentSearch) => {
    setRecentSearches(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(s => s.cityId !== search.cityId);
      // Add to beginning, limit to 5 recent searches
      return [search, ...filtered].slice(0, 5);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const value: AppContextType = {
    darkMode,
    toggleDarkMode,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    comparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    planType,
    setPlanType,
    geolocation,
    setGeolocation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
