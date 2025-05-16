import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Update document direction for RTL support
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 rounded-md p-2 hover:bg-gray-100">
        <Globe size={20} />
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