import React, { useState, useEffect } from 'react';
import { Search, MapPin, TrendingUp, Users, Shield, Navigation } from 'lucide-react';
import { cities } from '../data';
import { useApp } from '../contexts/AppContext';
import { useGeolocation } from '../hooks/useGeolocation';
import SecurityBanner from './SecurityBanner';

interface HeroProps {
  onCitySelect: (cityId: string, cityName: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onCitySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);
  const { addRecentSearch, recentSearches, geolocation, setGeolocation } = useApp();
  
  // Fetch geolocation on component mount
  const { geolocation: geoData, nearestCity, isLoading: geoLoading, error: geoError } = useGeolocation();

  // Update context when geolocation is fetched
  useEffect(() => {
    if (geoData) {
      setGeolocation(geoData);
    }
  }, [geoData, setGeolocation]);

  // Auto-select nearest city if detected
  useEffect(() => {
    if (nearestCity && !searchQuery) {
      // Optional: Auto-select nearest city
      // onCitySelect(nearestCity.id, `${nearestCity.name}, ${nearestCity.state}`);
    }
  }, [nearestCity]);

  const filteredCities = searchQuery
    ? cities.filter(city =>
        `${city.name}, ${city.state}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleCitySelect = (cityId: string, cityName: string) => {
    addRecentSearch({
      cityId,
      cityName,
      timestamp: new Date().toISOString(),
    });
    setSearchQuery('');
    setShowSuggestions(false);
    onCitySelect(cityId, cityName);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUseMyLocation = () => {
    if (nearestCity) {
      onCitySelect(nearestCity.id, `${nearestCity.name}, ${nearestCity.state}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-primary-50 to-white dark:from-dark-bg dark:to-dark-surface py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container-custom relative">
        {/* Security Banner */}
        {geolocation && showSecurityBanner && (
          <SecurityBanner 
            geolocation={geolocation} 
            onDismiss={() => setShowSecurityBanner(false)}
          />
        )}
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-dark-text mb-6 animate-fadeIn">
            Find Your Perfect
            <span className="text-primary-600 dark:text-primary-400"> Internet Provider</span>
          </h1>
          
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-2xl mx-auto animate-fadeIn">
            Compare speeds, prices, and coverage from top ISPs across Nepal. Real data, real reviews, real results.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto mb-12 animate-slideInUp">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your city or ZIP code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-14 pr-4 py-5 text-lg border-2 border-neutral-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-surface text-neutral-900 dark:text-dark-text placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent shadow-lg transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary px-8 py-3">
                Search
              </button>
            </div>

            {/* Use My Location Button */}
            {nearestCity && !geoLoading && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleUseMyLocation}
                  className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Use my location: {nearestCity.name}, {nearestCity.state}</span>
                </button>
              </div>
            )}
            
            {geoLoading && (
              <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                <div className="inline-flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Detecting your location...</span>
                </div>
              </div>
            )}

            {geoError && !geoLoading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
                  <span>⚠️</span>
                  <span className="text-xs">{geoError}</span>
                </div>
              </div>
            )}

            {/* Autocomplete Suggestions */}
            {showSuggestions && (searchQuery || recentSearches.length > 0) && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-surface rounded-lg border border-neutral-200 dark:border-dark-border shadow-xl max-h-96 overflow-y-auto animate-slideInUp">
                {searchQuery && filteredCities.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Suggestions
                    </div>
                    {filteredCities.slice(0, 5).map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city.id, `${city.name}, ${city.state}`)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center space-x-3 transition-colors"
                      >
                        <MapPin className="w-5 h-5 text-neutral-400" />
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-dark-text">
                            {city.name}, {city.state}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Population: {city.population.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!searchQuery && recentSearches.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      Recent Searches
                    </div>
                    {recentSearches.map((search) => (
                      <button
                        key={search.cityId}
                        onClick={() => handleCitySelect(search.cityId, search.cityName)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center space-x-3 transition-colors"
                      >
                        <TrendingUp className="w-5 h-5 text-neutral-400" />
                        <div className="font-medium text-neutral-900 dark:text-dark-text">
                          {search.cityName}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary-600" />
              <span className="text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold text-neutral-900 dark:text-dark-text">8,234</span> users found their ISP this month
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-success-600" />
              <span className="text-neutral-600 dark:text-neutral-300">
                Verified coverage data
              </span>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: 'Real-time Coverage',
              description: 'Accurate, up-to-date coverage maps for all major ISPs',
              icon: '📡',
            },
            {
              title: 'Price Comparison',
              description: 'Compare plans, speeds, and prices side-by-side',
              icon: '💰',
            },
            {
              title: 'User Reviews',
              description: 'Real reviews from verified customers in your area',
              icon: '⭐',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="card card-hover p-6 text-center animate-slideInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-dark-text mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
