import React from 'react';
import { Heart, GitCompare, Star, Wifi, DollarSign, Zap, TrendingUp } from 'lucide-react';
import type { ISP, Coverage } from '../types';
import { useApp } from '../contexts/AppContext';

interface ISPCardProps {
  isp: ISP;
  coverage?: Coverage;
  onViewDetails?: () => void;
}

const ISPCard: React.FC<ISPCardProps> = ({ isp, coverage, onViewDetails }) => {
  const { isFavorite, addFavorite, removeFavorite, addToComparison, comparison } = useApp();
  const favorite = isFavorite(isp.id);
  const inComparison = comparison.some(item => item.isp.id === isp.id);

  // Get best plan for display
  const bestPlan = isp.plans.reduce((best, plan) => {
    if (plan.type === 'residential') {
      return !best || plan.price < best.price ? plan : best;
    }
    return best;
  }, isp.plans[0]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite) {
      removeFavorite(isp.id);
    } else {
      addFavorite(isp.id);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inComparison && coverage && bestPlan) {
      addToComparison({
        isp,
        plan: bestPlan,
        coverage,
      });
    }
  };

  return (
    <div className="card card-hover p-6 relative group" onClick={onViewDetails}>
      {/* Action Buttons - Absolute positioned top right */}
      <div className="absolute top-4 right-4 flex space-x-1 z-20">
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-md transition-all ${
            favorite
              ? 'text-error-600 bg-error-50 dark:bg-error-900/20'
              : 'text-neutral-400 hover:text-error-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
          title={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="w-5 h-5" fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleCompareClick}
          disabled={inComparison || comparison.length >= 3}
          className={`p-2 rounded-md transition-all ${
            inComparison
              ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : comparison.length >= 3
              ? 'text-neutral-300 cursor-not-allowed'
              : 'text-neutral-400 hover:text-primary-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
          title={inComparison ? 'In comparison' : 'Add to comparison'}
        >
          <GitCompare className="w-5 h-5" />
        </button>
      </div>

      {/* Special Offer Badge */}
      {isp.specialOffers.length > 0 && (
        <div className="absolute top-4 left-4 bg-error-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10">
          Special Offer
        </div>
      )}

      {/* Header with Logo */}
      <div className="flex items-start mb-4 pr-20">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-16 h-16 rounded-lg border border-neutral-200 dark:border-dark-border flex items-center justify-center bg-white dark:bg-dark-bg overflow-hidden flex-shrink-0">
            <img
              src={isp.logo}
              alt={isp.name}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-primary-600">${isp.name.substring(0, 2)}</span>`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-dark-text truncate">
              {isp.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
              {isp.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(isp.rating)
                  ? 'text-warning-600 fill-warning-600'
                  : 'text-neutral-300 dark:text-neutral-600'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text">
          {isp.rating.toFixed(1)}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          ({isp.totalReviews.toLocaleString()} reviews)
        </span>
      </div>

      {/* Coverage Info */}
      {coverage && (
        <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Coverage: {coverage.coveragePercentage}%
              </span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                coverage.signalStrength === 'excellent'
                  ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                  : coverage.signalStrength === 'good'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : coverage.signalStrength === 'fair'
                  ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                  : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
              }`}
            >
              {coverage.signalStrength.charAt(0).toUpperCase() + coverage.signalStrength.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Plan Info */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-lg font-bold text-neutral-900 dark:text-dark-text">
            {bestPlan.speed}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Mbps</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-success-600" />
          </div>
          <div className="text-lg font-bold text-neutral-900 dark:text-dark-text">
            ₨{bestPlan.price}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">/month</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-warning-600" />
          </div>
          <div className="text-lg font-bold text-neutral-900 dark:text-dark-text">
            {bestPlan.connectionType}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Type</div>
        </div>
      </div>

      {/* Special Offer */}
      {isp.specialOffers.length > 0 && (
        <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md">
          <div className="font-semibold text-sm text-error-900 dark:text-error-400 mb-1">
            {isp.specialOffers[0].title}
          </div>
          <div className="text-xs text-error-700 dark:text-error-500">
            {isp.specialOffers[0].description}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {isp.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="flex-1 btn btn-primary text-sm py-2"
        >
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(isp.website, '_blank');
          }}
          className="flex-1 btn btn-outline text-sm py-2"
        >
          Visit Website
        </button>
      </div>
    </div>
  );
};

export default ISPCard;
