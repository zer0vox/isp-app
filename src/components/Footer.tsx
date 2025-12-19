import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ISP</span>
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-dark-text">
                ISP Finder
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Find the best internet service provider for your location with accurate coverage data and real user reviews.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-semibold text-neutral-900 dark:text-dark-text mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#search" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Search ISPs
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h4 className="font-semibold text-neutral-900 dark:text-dark-text mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Coverage Map
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Speed Test Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Business Solutions
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-semibold text-neutral-900 dark:text-dark-text mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-400">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@ispfinder.com" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  contact@sumipdaikobhattipasal.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-400">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:1-800-ISP-FIND" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  1-800-ISP-FIND
                </a>
              </li>
              <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Kanti Ave<br />San Chakrapath, KTM 94105</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              © {currentYear} KaskoIsP : ISP Coverage Finder. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacy Policy
              </a>
              <span className="text-neutral-300 dark:text-neutral-600">|</span>
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Terms of Service
              </a>
              <span className="text-neutral-300 dark:text-neutral-600">|</span>
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Affiliate Disclosure
              </a>
              <span className="text-neutral-300 dark:text-neutral-600">|</span>
              <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              Coverage data updated: December 12, 2025 | Verified coverage data badge
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
