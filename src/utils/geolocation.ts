import type { City } from '../types';

interface IPStackResponse {
  ip: string;
  type: string;
  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  location: {
    geoname_id: number;
    capital: string;
    languages: Array<{
      code: string;
      name: string;
      native: string;
    }>;
    country_flag: string;
    country_flag_emoji: string;
    country_flag_emoji_unicode: string;
    calling_code: string;
    is_eu: boolean;
  };
  security?: {
    is_proxy: boolean;
    proxy_type: string | null;
    is_crawler: boolean;
    crawler_name: string | null;
    crawler_type: string | null;
    is_tor: boolean;
    threat_level: 'low' | 'medium' | 'high';
    threat_types: string[] | null;
  };
}

export interface GeolocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  isp?: string;
  security?: {
    isProxy: boolean;
    isTor: boolean;
    threatLevel: 'low' | 'medium' | 'high';
    threatTypes: string[];
  };
}

/**
 * Fetch geolocation data from IPStack API
 * @param accessKey - Your IPStack API access key
 * @returns Geolocation data with security information
 */
export const fetchGeolocation = async (accessKey?: string): Promise<GeolocationData | null> => {
  try {
    const apiKey = accessKey || import.meta.env.VITE_IPSTACK_API_KEY;
    
    if (!apiKey) {
      console.warn('IPStack API key not configured. Geolocation disabled.');
      return null;
    }

    // Fetch current IP geolocation with security module
    const response = await fetch(
      `http://api.ipstack.com/check?access_key=${apiKey}&security=1`
    );

    if (!response.ok) {
      throw new Error(`IPStack API error: ${response.status}`);
    }

    const data: IPStackResponse = await response.json();

    // Check for API errors
    if ('error' in data) {
      console.error('IPStack API error:', data);
      return null;
    }

    return {
      ip: data.ip,
      city: data.city,
      region: data.region_name,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      security: data.security ? {
        isProxy: data.security.is_proxy,
        isTor: data.security.is_tor,
        threatLevel: data.security.threat_level,
        threatTypes: data.security.threat_types || [],
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find the nearest city based on user's coordinates
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @param cities - Array of cities to search
 * @returns Nearest city or null
 */
export const findNearestCity = (
  userLat: number,
  userLon: number,
  cities: City[]
): City | null => {
  if (cities.length === 0) return null;

  let nearestCity = cities[0];
  let minDistance = calculateDistance(
    userLat,
    userLon,
    cities[0].coordinates.lat,
    cities[0].coordinates.lng
  );

  for (let i = 1; i < cities.length; i++) {
    const distance = calculateDistance(
      userLat,
      userLon,
      cities[i].coordinates.lat,
      cities[i].coordinates.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = cities[i];
    }
  }

  // Only return if within reasonable distance (500km for Nepal)
  return minDistance <= 500 ? nearestCity : null;
};

/**
 * Find city by name (case-insensitive)
 * @param cityName - Name of the city to find
 * @param cities - Array of cities to search
 * @returns Matching city or null
 */
export const findCityByName = (cityName: string, cities: City[]): City | null => {
  const normalizedName = cityName.toLowerCase().trim();
  return cities.find(city => 
    city.name.toLowerCase() === normalizedName
  ) || null;
};

/**
 * Check if IP is suspicious based on threat level
 * @param geolocation - Geolocation data with security info
 * @returns true if IP is suspicious
 */
export const isSuspiciousIP = (geolocation: GeolocationData): boolean => {
  if (!geolocation.security) return false;
  
  return (
    geolocation.security.isProxy ||
    geolocation.security.isTor ||
    geolocation.security.threatLevel === 'high' ||
    geolocation.security.threatLevel === 'medium'
  );
};

/**
 * Get security warning message based on threat data
 * @param geolocation - Geolocation data with security info
 * @returns Warning message or null
 */
export const getSecurityWarning = (geolocation: GeolocationData): string | null => {
  if (!geolocation.security) return null;

  const { isProxy, isTor, threatLevel, threatTypes } = geolocation.security;

  if (isTor) {
    return 'Tor network detected. Some features may be restricted.';
  }

  if (isProxy) {
    return 'Proxy or VPN detected. Location may not be accurate.';
  }

  if (threatLevel === 'high') {
    return `High threat level detected: ${threatTypes.join(', ')}`;
  }

  if (threatLevel === 'medium') {
    return 'Moderate security concern detected with your connection.';
  }

  return null;
};
