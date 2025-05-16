import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Users, Video, MessageCircle, BrainCircuit, Video as Video2, BookOpenText, Briefcase, Stethoscope, Heart, Calendar, Mic, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ZoneSelectorProps {
  isDark?: boolean;
}

const ZoneSelector: React.FC<ZoneSelectorProps> = ({ isDark = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const zoneOptions = [
    { name: t('nav.myZone'), path: '/myzone', description: t('myZone.subtitle'), icon: <Users size={18} className="text-primary-500" />, featured: true },
    { name: i18n.language === 'ar' ? "اخر ألأبحاث" : t('nav.researchZone'), path: '/researchzone', description: t('researchZone.subtitle'), icon: <BookOpenText size={18} className="text-yellow-600" /> },
    { name: t('nav.conferenceZone'), path: '/conferencezone', description: t('conferenceZone.subtitle'), icon: <Calendar size={18} className="text-orange-500" /> },
    { name: t('nav.zoneTube'), path: '/zonetube', description: t('zoneTube.subtitle'), icon: <Video size={18} className="text-red-500" /> },
    { name: t('nav.zoneCast'), path: '/zonecast', description: t('zoneCast.subtitle'), icon: <Mic size={18} className="text-pink-500" /> },
    { name: t('nav.chatZone'), path: '/chatzone', description: t('chat.subtitle'), icon: <MessageCircle size={18} className="text-green-500" /> },
    { name: t('nav.zoneGBT'), path: '/zonegbt', description: t('zoneGBT.subtitle'), icon: <BrainCircuit size={18} className="text-purple-500" /> },
    { name: t('nav.zomZone'), path: '/zomzone', description: t('zomZone.subtitle'), icon: <Video2 size={18} className="text-blue-500" /> },
    { name: t('nav.jobsZone'), path: '/jobszone', description: t('jobsZone.subtitle'), icon: <Briefcase size={18} className="text-indigo-500" /> },
    { name: t('nav.medicalTools'), path: '/medicaltools', description: t('medicalTools.subtitle'), icon: <Stethoscope size={18} className="text-teal-500" /> },
    { name: t('nav.zoneMatch'), path: '/zonematch', description: t('zonematch.subtitle'), icon: <Heart size={18} className="text-pink-500" /> },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium ${
          isDark 
            ? isOpen ? 'bg-white/20' : 'hover:bg-white/10' 
            : isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
        }`}
      >
        <span className={isDark ? 'text-white' : ''}>{t('nav.zones')}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div className="grid grid-cols-1 gap-1">
              {/* Featured MyZone at the top */}
              {zoneOptions.filter(zone => zone.featured).map((zone) => (
                <Link
                  key={zone.path}
                  to={zone.path}
                  className="flex items-center space-x-3 rounded-md px-3 py-2 bg-primary-50 hover:bg-primary-100"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex-shrink-0 relative">
                    {zone.icon}
                    <Crown size={10} className="absolute -top-1 -right-1 text-yellow-500" fill="#EAB308" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-700">{zone.name}</p>
                    <p className="text-xs text-primary-600">{zone.description}</p>
                  </div>
                </Link>
              ))}
              
              {/* Other zones */}
              {zoneOptions.filter(zone => !zone.featured).map((zone) => (
                <Link
                  key={zone.path}
                  to={zone.path}
                  className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex-shrink-0">
                    {zone.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{zone.name}</p>
                    <p className="text-xs text-gray-500">{zone.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZoneSelector;