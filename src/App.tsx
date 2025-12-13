import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchResults from './components/SearchResults';
import Comparison from './components/Comparison';
import Footer from './components/Footer';

function App() {
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);

  const handleCitySelect = (cityId: string, cityName: string) => {
    setSelectedCity({ id: cityId, name: cityName });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero onCitySelect={handleCitySelect} />
        
        {selectedCity && (
          <SearchResults cityId={selectedCity.id} cityName={selectedCity.name} />
        )}
        
        <Comparison />
        
        {!selectedCity && (
          <div className="container-custom py-16">
            <div className="text-center text-neutral-500 dark:text-neutral-400">
              <p className="text-lg mb-2">👆 Search for your city above to find available ISPs</p>
              <p className="text-sm">Compare speeds, prices, and coverage from top providers in your area</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
