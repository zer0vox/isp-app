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
      console.warn('IPStack API key not configured. Please add VITE_IPSTACK_API_KEY to your .env file.');
      return null;
    }

    // Try with security module first (for paid plans), fallback to without security (free tier)
    // Using HTTPS for better security and compatibility
    let apiUrl = `https://api.ipstack.com/check?access_key=${apiKey}&security=1`;
    console.log('Fetching geolocation from IPStack API (with security module)...', { 
      apiUrl: apiUrl.replace(apiKey, '***') 
    });
    
    let response = await fetch(apiUrl);
    
    // Parse JSON even if response is not OK, to check for specific error codes
    let responseText = await response.text();
    let data: IPStackResponse | { error?: { code: number; type: string; info: string }; success?: boolean };
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, throw with the raw text
      throw new Error(`IPStack API error: ${response.status} - ${responseText}`);
    }
    
    // Check for API errors in JSON response (even if HTTP status is not OK)
    // IPStack may return 200 OK with error in JSON, or 400 with error details
    if ('error' in data && data.error) {
      const errorInfo = data.error;
      
      // If security module error (code 104 or 105), retry without security for free tier
      if (errorInfo.code === 104 || errorInfo.code === 105) {
        const errorCode = errorInfo.code;
        console.warn(`Security module not supported (error ${errorCode}). Trying without security module (free tier)...`);
        apiUrl = `https://api.ipstack.com/check?access_key=${apiKey}`;
        response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`IPStack API error: ${response.status} - ${errorText}`);
        }
        
        data = await response.json();
        
        // Check if retry also failed
        if ('error' in data && data.error) {
          const retryError = data.error;
          throw new Error(`IPStack API error: ${retryError.type} - ${retryError.info}`);
        }
      } else {
        // For other errors, throw immediately
        throw new Error(`IPStack API error: ${errorInfo.type} - ${errorInfo.info}`);
      }
    } else if (!response.ok) {
      // If no error in JSON but HTTP status is not OK, throw generic error
      throw new Error(`IPStack API error: ${response.status} - ${responseText}`);
    }

    // Check for API errors in response (after retry if needed)
    if ('error' in data && data.error) {
      const errorInfo = data.error;
      console.error('IPStack API error response:', {
        code: errorInfo.code,
        type: errorInfo.type,
        info: errorInfo.info,
      });
      
      // Provide helpful error messages
      let errorMessage = 'IPStack API error';
      if (errorInfo.code === 101) {
        errorMessage = 'Invalid API key. Please check your VITE_IPSTACK_API_KEY in .env file.';
        console.error(errorMessage);
      } else if (errorInfo.code === 102) {
        errorMessage = 'Inactive user account. Please check your IPStack account status.';
        console.error(errorMessage);
      } else if (errorInfo.code === 103) {
        errorMessage = 'API access restricted. You may have exceeded your monthly quota or need a paid plan.';
        console.error(errorMessage);
      } else if (errorInfo.code === 104 || errorInfo.code === 105) {
        // This should have been handled above, but if we still get here, the retry failed
        errorMessage = `Security module not supported. Please use a paid plan or the API may be experiencing issues.`;
        console.error(errorMessage);
      } else {
        errorMessage = `IPStack API error: ${errorInfo.type} - ${errorInfo.info}`;
        console.error(errorMessage);
      }
      
      // Throw error with message for better user feedback
      throw new Error(errorMessage);
    }

    // Type guard to ensure we have valid IPStackResponse
    if (!('ip' in data) || !('city' in data)) {
      console.error('Invalid IPStack API response format:', data);
      return null;
    }

    const validData = data as IPStackResponse;

    // Validate required fields
    if (!validData.ip || !validData.city || !validData.latitude || !validData.longitude) {
      console.error('IPStack API response missing required fields:', validData);
      return null;
    }

    console.log('Successfully fetched geolocation:', {
      ip: validData.ip,
      city: validData.city,
      country: validData.country_name,
      hasSecurity: !!validData.security,
    });

    return {
      ip: validData.ip,
      city: validData.city,
      region: validData.region_name,
      country: validData.country_name,
      latitude: validData.latitude,
      longitude: validData.longitude,
      security: validData.security ? {
        isProxy: validData.security.is_proxy,
        isTor: validData.security.is_tor,
        threatLevel: validData.security.threat_level,
        threatTypes: validData.security.threat_types || [],
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching geolocation from IPStack:', error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = 'Network error: Unable to reach IPStack API. Check your internet connection or CORS settings.';
      console.error(networkError);
      throw new Error(networkError);
    }
    
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred while fetching geolocation');
  }
};

/**
 * Fetch geolocation data from IPStack API without security module (for free tier)
 * @param accessKey - Your IPStack API access key
 * @returns Geolocation data
 */
const fetchGeolocationWithoutSecurity = async (accessKey: string): Promise<GeolocationData | null> => {
  try {
    const apiUrl = `https://api.ipstack.com/check?access_key=${accessKey}`;
    console.log('Retrying without security module...');
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`IPStack API HTTP error: ${response.status}`, errorText);
      throw new Error(`IPStack API error: ${response.status} - ${errorText}`);
    }

    const data: IPStackResponse | { error?: { code: number; type: string; info: string } } = await response.json();

    // Check for API errors in response
    if ('error' in data && data.error) {
      const errorInfo = data.error;
      throw new Error(`IPStack API error: ${errorInfo.type} - ${errorInfo.info}`);
    }

    // Type guard to ensure we have valid IPStackResponse
    if (!('ip' in data) || !('city' in data)) {
      console.error('Invalid IPStack API response format:', data);
      return null;
    }

    const validData = data as IPStackResponse;

    // Validate required fields
    if (!validData.ip || !validData.city || !validData.latitude || !validData.longitude) {
      console.error('IPStack API response missing required fields:', validData);
      return null;
    }

    console.log('Successfully fetched geolocation (without security module):', {
      ip: validData.ip,
      city: validData.city,
      country: validData.country_name,
    });

    return {
      ip: validData.ip,
      city: validData.city,
      region: validData.region_name,
      country: validData.country_name,
      latitude: validData.latitude,
      longitude: validData.longitude,
      // No security data for free tier
    };
  } catch (error) {
    console.error('Error fetching geolocation without security module:', error);
    throw error;
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
