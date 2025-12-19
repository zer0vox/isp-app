import React, { useMemo } from 'react';
import { cities, isps } from '../data';
import { Star, Wifi } from 'lucide-react';

type CityTopIsp = {
  cityId: string;
  cityName: string;
  state: string;
  population: number;
  ispName: string;
  ispId: string;
  coverage: number;
  rating: number;
  signalStrength: string;
};

const Favorites: React.FC = () => {
  const cityTopIsps = useMemo<CityTopIsp[]>(() => {
    return cities
      .map((city) => {
        const coverageEntries = isps
          .map((isp) => {
            const coverage = isp.coverage.find((c) => c.cityId === city.id);
            if (!coverage) return null;
            return {
              ispId: isp.id,
              ispName: isp.name,
              coverage: coverage.coveragePercentage,
              signalStrength: coverage.signalStrength,
              rating: isp.rating,
            };
          })
          .filter(Boolean) as Array<{
          ispId: string;
          ispName: string;
          coverage: number;
          signalStrength: string;
          rating: number;
        }>;

        if (coverageEntries.length === 0) return null;

        const top = coverageEntries.reduce((best, curr) =>
          curr.coverage > best.coverage ? curr : best
        );

        return {
          cityId: city.id,
          cityName: city.name,
          state: city.state,
          population: city.population,
          ispName: top.ispName,
          ispId: top.ispId,
          coverage: top.coverage,
          rating: top.rating,
          signalStrength: top.signalStrength,
        };
      })
      .filter(Boolean) as CityTopIsp[];
  }, []);

  return (
    <section id="favorites" className="bg-neutral-50 dark:bg-dark-bg py-14">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-dark-text">
              Top ISPs by City
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              For each major city, we highlight the ISP with the strongest coverage.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-success-600" />
              <span>Coverage leader</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-500" />
              <span>ISP rating</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cityTopIsps.map((item) => (
            <div
              key={item.cityId}
              className="card card-hover p-5 flex flex-col space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-dark-text">
                    {item.cityName}, {item.state}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Population: {item.population.toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  Coverage: <span className="font-semibold">{item.coverage}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">
                    Top ISP
                  </div>
                  <div className="text-base font-semibold text-neutral-900 dark:text-dark-text">
                    {item.ispName}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Signal: {item.signalStrength}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-amber-500">
                  <Star className="w-5 h-5" fill="currentColor" />
                  <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">
                    {item.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Favorites;


