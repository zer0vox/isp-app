import { useState, useEffect } from 'react';
import { fetchGeolocation, findNearestCity, findCityByName, type GeolocationData } from '../utils/geolocation';
import { cities } from '../data';
import type { City } from '../types';

interface UseGeolocationReturn {
  geolocation: GeolocationData | null;
  nearestCity: City | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGeolocation = (apiKey?: string): UseGeolocationReturn => {
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if API key is configured
      const configuredApiKey = apiKey || import.meta.env.VITE_IPSTACK_API_KEY;
      if (!configuredApiKey || configuredApiKey === 'your_ipstack_api_key_here') {
        setError('IPStack API key not configured. Please add your actual API key to VITE_IPSTACK_API_KEY in your .env file.');
        setIsLoading(false);
        console.warn('IPStack API key not found or using placeholder. Geolocation features will be disabled.');
        console.warn('Current API key value:', configuredApiKey ? '***' + configuredApiKey.slice(-4) : 'not set');
        return;
      }

      const data = await fetchGeolocation(apiKey);
      
      if (!data) {
        setError('Unable to fetch location data. Please check your API key and internet connection.');
        setIsLoading(false);
        return;
      }

      setGeolocation(data);

      // Try to find city by name first (more accurate)
      let city = findCityByName(data.city, cities);

      // If not found, find nearest city by coordinates
      if (!city) {
        city = findNearestCity(data.latitude, data.longitude, cities);
      }

      setNearestCity(city);
      
      // Log security info if suspicious
      if (data.security && (data.security.isProxy || data.security.isTor || data.security.threatLevel !== 'low')) {
        console.warn('Security Alert:', {
          ip: data.ip,
          isProxy: data.security.isProxy,
          isTor: data.security.isTor,
          threatLevel: data.security.threatLevel,
          threatTypes: data.security.threatTypes,
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch geolocation';
      setError(errorMessage);
      console.error('Geolocation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiKey]);

  return {
    geolocation,
    nearestCity,
    isLoading,
    error,
    refetch: fetchData,
  };
};
