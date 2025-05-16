import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, Bell, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ZoneSelector from './ZoneSelector';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isArabic = i18n.language === 'ar';
  const isDarkHeader = location.pathname === '/zonegbt' || location.pathname === '/zonetube';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : isDarkHeader 
            ? 'bg-gray-900 text-white' 
            : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={isDarkHeader && !isScrolled ? "/drzone-icon-dark.svg" : "/drzone-icon.svg"} 
              alt="Dr.Zone AI Logo" 
              className="h-10 w-10" 
            />
            <span className={`text-2xl font-bold ${
              isDarkHeader && !isScrolled ? 'text-white' : 'text-primary-500'
            }`}>
              {isArabic ? 'حكيم زون' : 'Dr.Zone AI'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            <ZoneSelector isDark={isDarkHeader && !isScrolled} />
            
            <div className="hidden h-8 border-l border-gray-200 mx-2 md:block"></div>
            
            <Link to="/search" className={`btn-outline btn-sm rounded-full px-3 py-1 flex items-center ${
              isDarkHeader && !isScrolled ? 'text-white border-white/30 hover:bg-white/10' : ''
            }`}>
              <Search size={18} className={isDarkHeader && !isScrolled ? "text-white" : "text-gray-600"} />
              <span className="ml-1">{t('common.search')}</span>
            </Link>
            
            <button className={`btn-outline btn-sm rounded-full relative px-3 py-1 ${
              isDarkHeader && !isScrolled ? 'text-white border-white/30 hover:bg-white/10' : ''
            }`}>
              <Bell size={18} className={isDarkHeader && !isScrolled ? "text-white" : "text-gray-600"} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] text-white">
                3
              </span>
            </button>

            <LanguageSelector isDark={isDarkHeader && !isScrolled} />
            
            <Link to="/profile" className={`flex items-center space-x-2 rounded-full px-2 py-1 ${
              isDarkHeader && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}>
              <UserCircle size={24} className={isDarkHeader && !isScrolled ? "text-white" : "text-gray-600"} />
              <span className={`text-sm font-medium ${isDarkHeader && !isScrolled ? 'text-white' : ''}`}>
                {t('nav.profile')}
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`rounded-md p-2 ${
              isDarkHeader && !isScrolled ? 'text-white' : 'text-gray-600'
            } md:hidden`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-b border-gray-200 bg-white px-4 py-2 md:hidden"
        >
          <div className="flex py-2">
            <Search size={18} className="mr-2 text-gray-600" />
            <input 
              type="text" 
              placeholder={t('common.search')}
              className="w-full bg-gray-100 rounded-md px-3 py-1 text-sm outline-none" 
            />
          </div>
          
          <div className="flex flex-col space-y-1 py-2">
            <Link to="/myzone" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.myZone')}</span>
            </Link>
            <Link to="/zonetube" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.zoneTube')}</span>
            </Link>
            <Link to="/chatzone" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.chatZone')}</span>
            </Link>
            <Link to="/zonegbt" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.zoneGBT')}</span>
            </Link>
            <Link to="/zomzone" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.zomZone')}</span>
            </Link>
            <Link to="/researchzone" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.researchZone')}</span>
            </Link>
            <Link to="/jobszone" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.jobsZone')}</span>
            </Link>
            <Link to="/medicaltools" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.medicalTools')}</span>
            </Link>
            <Link to="/zonematch" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.zoneMatch')}</span>
            </Link>
            <Link to="/conferencezone" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <span className="text-lg font-medium">{t('nav.conferenceZone')}</span>
            </Link>
          </div>
          
          <div className="border-t border-gray-200 py-2">
            <Link to="/profile" className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100">
              <UserCircle size={20} className="text-gray-600" />
              <span className="text-lg font-medium">{t('nav.profile')}</span>
            </Link>
            <div className="mt-2 px-3">
              <LanguageSelector />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;