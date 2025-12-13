import React, { useState } from 'react';
import { X, Download, Share2, CheckCircle2, XCircle, Star, Zap, DollarSign, Wifi, TrendingUp, Clock, Shield, Award } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Comparison: React.FC = () => {
  const { comparison, removeFromComparison, clearComparison } = useApp();
  const [showShareModal, setShowShareModal] = useState(false);

  if (comparison.length === 0) {
    return (
      <div id="comparison" className="bg-neutral-50 dark:bg-dark-bg py-16">
        <div className="container-custom">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-6">
              <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-dark-text mb-2">
              No ISPs to Compare
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
              Start by adding ISPs from the search results using the compare button. You can compare up to 3 ISPs side-by-side.
            </p>
            <a href="#search-results" className="btn btn-primary">
              Browse ISPs
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const ispIds = comparison.map(c => c.isp.id).join(',');
    const shareUrl = `${window.location.origin}?compare=${ispIds}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'ISP Comparison',
        text: 'Check out this ISP comparison',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 3000);
    }
  };

  const handleExport = () => {
    // Create a simple text export
    let exportText = '=== ISP COMPARISON ===\n\n';
    
    comparison.forEach((item, index) => {
      exportText += `${index + 1}. ${item.isp.name}\n`;
      exportText += `   Plan: ${item.plan.name}\n`;
      exportText += `   Speed: ${item.plan.speed} Mbps\n`;
      exportText += `   Price: ₨${item.plan.price}/month\n`;
      exportText += `   Coverage: ${item.coverage.coveragePercentage}%\n`;
      exportText += `   Rating: ${item.isp.rating}/5 (${item.isp.totalReviews} reviews)\n`;
      exportText += '\n';
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isp-comparison-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate winner for each category
  const getWinner = (category: 'price' | 'speed' | 'coverage' | 'rating') => {
    if (comparison.length === 0) return null;

    switch (category) {
      case 'price':
        return comparison.reduce((min, item) => 
          item.plan.price < min.plan.price ? item : min
        );
      case 'speed':
        return comparison.reduce((max, item) => 
          item.plan.speed > max.plan.speed ? item : max
        );
      case 'coverage':
        return comparison.reduce((max, item) => 
          item.coverage.coveragePercentage > max.coverage.coveragePercentage ? item : max
        );
      case 'rating':
        return comparison.reduce((max, item) => 
          item.isp.rating > max.isp.rating ? item : max
        );
      default:
        return null;
    }
  };

  const priceWinner = getWinner('price');
  const speedWinner = getWinner('speed');
  const coverageWinner = getWinner('coverage');
  const ratingWinner = getWinner('rating');

  return (
    <div id="comparison" className="bg-neutral-50 dark:bg-dark-bg py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-dark-text mb-2">
              ISP Comparison
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Comparing {comparison.length} provider{comparison.length !== 1 ? 's' : ''} side-by-side
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShare}
              className="btn btn-outline"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleExport}
              className="btn btn-outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={clearComparison}
              className="btn btn-secondary"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed top-4 right-4 z-50 animate-slideInUp">
            <div className="bg-success-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Link copied to clipboard!</span>
            </div>
          </div>
        )}

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="card p-0 min-w-full">
            <table className="w-full">
              <thead className="bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-dark-border">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300 w-1/4">
                    Feature
                  </th>
                  {comparison.map(item => (
                    <th key={item.isp.id} className="py-4 px-6 text-center w-1/4">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-3 rounded-lg border border-neutral-200 dark:border-dark-border flex items-center justify-center bg-white dark:bg-dark-bg">
                          <img
                            src={item.isp.logo}
                            alt={item.isp.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<span class="text-xl font-bold text-primary-600">${item.isp.name.substring(0, 2)}</span>`;
                            }}
                          />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-dark-text mb-1">
                          {item.isp.name}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {item.plan.name}
                        </p>
                        <button
                          onClick={() => removeFromComparison(item.isp.id)}
                          className="mt-2 text-error-600 hover:text-error-700 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-dark-border">
                {/* Price */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-success-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Monthly Price</div>
                        <div className="text-xs text-neutral-500">Recurring cost</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center gap-2 ${priceWinner?.isp.id === item.isp.id ? 'text-success-600 font-bold' : 'text-neutral-900 dark:text-dark-text'}`}>
                        ₨{item.plan.price}
                        {priceWinner?.isp.id === item.isp.id && (
                          <Award className="w-4 h-4" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Speed */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Download Speed</div>
                        <div className="text-xs text-neutral-500">Maximum speed</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center gap-2 ${speedWinner?.isp.id === item.isp.id ? 'text-primary-600 font-bold' : 'text-neutral-900 dark:text-dark-text'}`}>
                        {item.plan.speed} Mbps
                        {speedWinner?.isp.id === item.isp.id && (
                          <Award className="w-4 h-4" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Upload Speed */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-warning-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Upload Speed</div>
                        <div className="text-xs text-neutral-500">Upload bandwidth</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center text-neutral-900 dark:text-dark-text">
                      {item.plan.uploadSpeed} Mbps
                    </td>
                  ))}
                </tr>

                {/* Coverage */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Coverage</div>
                        <div className="text-xs text-neutral-500">Area coverage</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center gap-2 ${coverageWinner?.isp.id === item.isp.id ? 'text-primary-600 font-bold' : 'text-neutral-900 dark:text-dark-text'}`}>
                        {item.coverage.coveragePercentage}%
                        {coverageWinner?.isp.id === item.isp.id && (
                          <Award className="w-4 h-4" />
                        )}
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.coverage.signalStrength === 'excellent'
                            ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                            : item.coverage.signalStrength === 'good'
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                        }`}>
                          {item.coverage.signalStrength}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-warning-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">User Rating</div>
                        <div className="text-xs text-neutral-500">Customer reviews</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center gap-2 ${ratingWinner?.isp.id === item.isp.id ? 'text-warning-600 font-bold' : 'text-neutral-900 dark:text-dark-text'}`}>
                        {item.isp.rating}/5
                        {ratingWinner?.isp.id === item.isp.id && (
                          <Award className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {item.isp.totalReviews.toLocaleString()} reviews
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Connection Type */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Connection Type</div>
                        <div className="text-xs text-neutral-500">Technology</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center text-neutral-900 dark:text-dark-text">
                      <span className="badge badge-primary">
                        {item.plan.connectionType}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Data Cap */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Data Cap</div>
                        <div className="text-xs text-neutral-500">Monthly limit</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      {item.plan.dataCap ? (
                        <span className="text-neutral-900 dark:text-dark-text">{item.plan.dataCap} GB</span>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-success-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium">Unlimited</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Installation Fee */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-neutral-600" />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Installation Fee</div>
                        <div className="text-xs text-neutral-500">One-time cost</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center text-neutral-900 dark:text-dark-text">
                      ₨{item.plan.installationFee}
                    </td>
                  ))}
                </tr>

                {/* Equipment Fee */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Equipment Fee</div>
                        <div className="text-xs text-neutral-500">Monthly rental</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      {item.plan.equipmentFee === 0 ? (
                        <div className="inline-flex items-center gap-1 text-success-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium">Free</span>
                        </div>
                      ) : (
                        <span className="text-neutral-900 dark:text-dark-text">₨{item.plan.equipmentFee}/mo</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Contract Length */}
                <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-dark-text">Contract</div>
                        <div className="text-xs text-neutral-500">Commitment</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center text-neutral-900 dark:text-dark-text">
                      {item.plan.contractLength === 0 ? 'No contract' : `${item.plan.contractLength} months`}
                    </td>
                  ))}
                </tr>

                {/* First Year Cost */}
                <tr className="bg-primary-50 dark:bg-primary-900/20 font-semibold">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-dark-text">First Year Total</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal">All costs included</div>
                      </div>
                    </div>
                  </td>
                  {comparison.map(item => {
                    const yearlyTotal = (item.plan.price * 12) + item.plan.installationFee + (item.plan.equipmentFee * 12);
                    return (
                      <td key={item.isp.id} className="py-4 px-6 text-center">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          ₨{yearlyTotal.toLocaleString()}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          ₨{Math.round(yearlyTotal / 12)}/mo average
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="py-4 px-6 font-medium text-neutral-900 dark:text-dark-text">
                    Quick Actions
                  </td>
                  {comparison.map(item => (
                    <td key={item.isp.id} className="py-4 px-6 text-center">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => window.open(item.isp.website, '_blank')}
                          className="btn btn-primary text-sm py-2"
                        >
                          Visit Website
                        </button>
                        <button className="btn btn-outline text-sm py-2">
                          View Details
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Cards - Mobile */}
        <div className="lg:hidden space-y-6">
          {comparison.map((item, index) => (
            <div key={item.isp.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg border border-neutral-200 dark:border-dark-border flex items-center justify-center bg-white dark:bg-dark-bg">
                    <img
                      src={item.isp.logo}
                      alt={item.isp.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-lg font-bold text-primary-600">${item.isp.name.substring(0, 2)}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-dark-text">{item.isp.name}</h3>
                    <p className="text-sm text-neutral-500">{item.plan.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromComparison(item.isp.id)}
                  className="text-error-600 hover:text-error-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Price</div>
                  <div className="font-bold text-neutral-900 dark:text-dark-text">₨{item.plan.price}/mo</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Speed</div>
                  <div className="font-bold text-neutral-900 dark:text-dark-text">{item.plan.speed} Mbps</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Coverage</div>
                  <div className="font-bold text-neutral-900 dark:text-dark-text">{item.coverage.coveragePercentage}%</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Rating</div>
                  <div className="font-bold text-neutral-900 dark:text-dark-text">{item.isp.rating}/5</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(item.isp.website, '_blank')}
                  className="flex-1 btn btn-primary text-sm py-2"
                >
                  Visit Website
                </button>
                <button className="flex-1 btn btn-outline text-sm py-2">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comparison;
