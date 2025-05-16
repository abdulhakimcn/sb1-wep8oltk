import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/drzone-icon.svg" 
                alt="Dr.Zone AI Logo" 
                className="h-10 w-10" 
              />
              <span className="text-xl font-bold text-primary-500">
                {isArabic ? 'حكيم زون' : 'Dr.Zone AI'}
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              {t('home.hero.subtitle')}
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">{t('nav.zones')}</h4>
            <ul className="space-y-2">
              <li><Link to="/myzone" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.myZone')}</Link></li>
              <li><Link to="/zonetube" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.zoneTube')}</Link></li>
              <li><Link to="/chatzone" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.chatZone')}</Link></li>
              <li><Link to="/zonegbt" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.zoneGBT')}</Link></li>
              <li><Link to="/zomzone" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.zomZone')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">{t('common.viewAll')}</h4>
            <ul className="space-y-2">
              <li><Link to="/researchzone" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.researchZone')}</Link></li>
              <li><Link to="/jobszone" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.jobsZone')}</Link></li>
              <li><Link to="/medicaltools" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.medicalTools')}</Link></li>
              <li><Link to="/zonematch" className="text-sm text-gray-600 hover:text-primary-500">{t('nav.zoneMatch')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">{t('common.company')}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-600 hover:text-primary-500">{t('common.about')}</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-500">{t('common.privacyPolicy')}</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-600 hover:text-primary-500">{t('common.termsOfService')}</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-600 hover:text-primary-500">{t('common.contact')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-between space-y-4 border-t border-gray-200 pt-8 md:flex-row md:space-y-0">
          <p className="text-xs text-gray-600">
            Dr.Zone AI – Powered by HakeemZone™ &copy; {new Date().getFullYear()} {t('common.allRightsReserved')}
          </p>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">{t('common.madeWith')}</span>
            <Heart size={12} className="text-accent-500" fill="#ff6900" />
            <span className="text-xs text-gray-600">{t('common.forMedicalCommunity')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;