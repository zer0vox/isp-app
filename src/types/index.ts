export interface ISP {
  id: string;
  name: string;
  logo: string; // URL or initials for colored circle
  tagline: string;
  rating: number; // 0-5
  totalReviews: number;
  plans: Plan[];
  coverage: Coverage[];
  features: string[];
  specialOffers: SpecialOffer[];
  businessPlans: boolean;
  website: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'residential' | 'business';
  connectionType: ConnectionType;
  speed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  price: number; // monthly price
  dataCap: number | null; // in GB, null for unlimited
  contractLength: number; // in months, 0 for no contract
  installationFee: number;
  equipmentFee: number; // monthly
  features: string[];
}

export type ConnectionType = 'Fiber' | 'Cable' | 'DSL' | 'Wireless' | 'Satellite';

export interface Coverage {
  cityId: string;
  cityName: string;
  coveragePercentage: number; // 0-100
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
  availableAt: string; // estimated availability
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: string; // e.g., "50% off first 3 months"
  validUntil: string; // ISO date
  terms: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population: number;
  areaCoverage: {
    lat: number;
    lng: number;
  }[]; // polygon points for map
}

export interface Review {
  id: string;
  ispId: string;
  userName: string;
  userLocation: string;
  rating: number; // 0-5
  date: string; // ISO date
  title: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

export interface SearchFilters {
  cityId?: string;
  priceRange: [number, number];
  minSpeed: number;
  connectionTypes: ConnectionType[];
  minCoverage: number;
  planType: 'residential' | 'business' | 'both';
}

export interface SortOption {
  value: 'coverage' | 'price-low' | 'price-high' | 'speed' | 'rating' | 'relevance';
  label: string;
}

export interface UsageProfile {
  streaming: boolean;
  gaming: boolean;
  workFromHome: boolean;
  basicBrowsing: boolean;
  householdSize: number;
}

export interface ComparisonItem {
  isp: ISP;
  plan: Plan;
  coverage: Coverage;
}

export interface RecentSearch {
  cityId: string;
  cityName: string;
  timestamp: string;
}

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  timestamp: string;
  ispName?: string;
  cityId?: string;
}

export interface IspStatus {
  ispId: string;
  ispName: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  message: string;
  lastUpdated: string;
  incidents?: {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high';
    startedAt: string;
    link?: string;
  }[];
}