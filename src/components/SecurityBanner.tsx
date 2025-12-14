import React from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import type { GeolocationData } from '../utils/geolocation';
import { getSecurityWarning, isSuspiciousIP } from '../utils/geolocation';

interface SecurityBannerProps {
  geolocation: GeolocationData;
  onDismiss?: () => void;
}

const SecurityBanner: React.FC<SecurityBannerProps> = ({ geolocation, onDismiss }) => {
  const warning = getSecurityWarning(geolocation);
  const suspicious = isSuspiciousIP(geolocation);

  if (!warning && !suspicious) return null;

  const getThreatColor = () => {
    if (!geolocation.security) return 'warning';
    
    switch (geolocation.security.threatLevel) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const color = getThreatColor();
  
  const colorClasses = {
    error: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800 text-error-900 dark:text-error-200',
    warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 text-warning-900 dark:text-warning-200',
    primary: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-200',
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 animate-slideInUp ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {color === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">
              {color === 'error' ? 'Security Alert' : 'Security Notice'}
            </h4>
            <p className="text-sm mb-2">{warning}</p>
            {geolocation.security && (
              <div className="text-xs space-y-1">
                <div className="flex items-center space-x-4">
                  <span>
                    <strong>IP:</strong> {geolocation.ip}
                  </span>
                  <span>
                    <strong>Threat Level:</strong> {geolocation.security.threatLevel.toUpperCase()}
                  </span>
                </div>
                {geolocation.security.isProxy && (
                  <div>
                    <strong>⚠️ Proxy/VPN Detected:</strong> Your detected location may not reflect actual ISP availability
                  </div>
                )}
                {geolocation.security.isTor && (
                  <div>
                    <strong>⚠️ Tor Network:</strong> Some features may be limited for security reasons
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SecurityBanner;
