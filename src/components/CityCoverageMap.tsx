import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { cities, isps } from '../data';
import type { City } from '../types';

type CityCoverageSummary = {
  city: City;
  ispCount: number;
  topIsp: {
    name: string;
    coverage: number;
    signalStrength: string;
  } | null;
};

const mapCenter: [number, number] = [27.9, 84.0];

const CityCoverageMap: React.FC = () => {
  const cityCoverage = useMemo<CityCoverageSummary[]>(() => {
    const summary = new Map<string, CityCoverageSummary>();

    // Initialize all cities
    cities.forEach((city) => {
      summary.set(city.id, {
        city,
        ispCount: 0,
        topIsp: null,
      });
    });

    // Aggregate ISP coverage per city
    isps.forEach((isp) => {
      isp.coverage.forEach((coverage) => {
        const entry = summary.get(coverage.cityId);
        if (!entry) return;

        entry.ispCount += 1;

        if (
          !entry.topIsp ||
          coverage.coveragePercentage > entry.topIsp.coverage
        ) {
          entry.topIsp = {
            name: isp.name,
            coverage: coverage.coveragePercentage,
            signalStrength: coverage.signalStrength,
          };
        }
      });
    });

    return Array.from(summary.values()).filter((entry) => entry.ispCount > 0);
  }, []);

  const getMarkerColor = (coverage?: number) => {
    if (!coverage) return '#9CA3AF'; // neutral gray
    if (coverage >= 90) return '#16a34a'; // green-600
    if (coverage >= 75) return '#22c55e'; // green-500
    if (coverage >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getMarkerRadius = (population: number) => {
    // Scale radius between 8 and 16 based on population
    return Math.min(16, Math.max(8, population / 150000));
  };

  return (
    <div className="container-custom py-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-dark-text">
            Coverage Map
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Major cities with the most popular ISP (by coverage %) at each location.
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center space-x-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#16a34a]" /> <span>90%+ coverage</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#22c55e]" /> <span>75-89%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#f59e0b]" /> <span>60-74%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#ef4444]" /> <span>&lt;60%</span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-dark-border shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: '420px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {cityCoverage.map(({ city, ispCount, topIsp }) => (
            <CircleMarker
              key={city.id}
              center={[city.coordinates.lat, city.coordinates.lng]}
              radius={getMarkerRadius(city.population)}
              pathOptions={{
                color: getMarkerColor(topIsp?.coverage),
                fillColor: getMarkerColor(topIsp?.coverage),
                fillOpacity: 0.75,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold text-neutral-900">
                    {city.name}, {city.state}
                  </div>
                  <div className="text-neutral-600">
                    Population: {city.population.toLocaleString()}
                  </div>
                  <div className="text-neutral-600">
                    ISPs available: {ispCount}
                  </div>
                  {topIsp ? (
                    <>
                      <div className="text-neutral-900 font-medium">
                        Most popular: {topIsp.name}
                      </div>
                      <div className="text-neutral-600">
                        Coverage: {topIsp.coverage}% ({topIsp.signalStrength})
                      </div>
                    </>
                  ) : (
                    <div className="text-neutral-500">No coverage data</div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CityCoverageMap;


