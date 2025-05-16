import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface LanguageSelectorProps {
  isDark?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isDark = false }) => {
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' }
  ];

  // Set language from URL parameter if present
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && ['en', 'ar', 'zh'].includes(langParam)) {
      i18n.changeLanguage(langParam);
      // Update document direction for RTL support
      document.documentElement.dir = langParam === 'ar' ? 'rtl' : 'ltr';
    }
  }, [searchParams, i18n]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Update document direction for RTL support
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    
    // Update URL parameter
    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', lng);
    setSearchParams(newParams);
  };

  return (
    <div className="relative group">
      <button className={`flex items-center space-x-1 rounded-md p-2 ${
        isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100'
      }`}>
        <Globe size={20} className={isDark ? 'text-white' : ''} />
        <span className="text-sm">{languages.find(lang => lang.code === i18n.language)?.name || 'English'}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 hidden w-32 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;