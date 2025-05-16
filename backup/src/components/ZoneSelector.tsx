import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Users, Video, MessageCircle, BrainCircuit, Video as Video2, BookOpenText, Briefcase, Stethoscope, Heart, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const zoneOptions = [
  { name: 'MyZone', path: '/myzone', description: 'Your medical social feed', icon: <Users size={18} className="text-primary-500" /> },
  { name: 'ZoneTube', path: '/zonetube', description: 'Medical videos & learning', icon: <Video size={18} className="text-red-500" /> },
  { name: 'ChatZone', path: '/chatzone', description: 'Secure doctor messaging', icon: <MessageCircle size={18} className="text-green-500" /> },
  { name: 'ZoneGBT', path: '/zonegbt', description: 'Your medical AI assistant', icon: <BrainCircuit size={18} className="text-purple-500" /> },
  { name: 'ZomZone', path: '/zomzone', description: 'Professional video calls', icon: <Video2 size={18} className="text-blue-500" /> },
  { name: 'ConferenceZone', path: '/conferencezone', description: 'Medical conferences & events', icon: <Calendar size={18} className="text-orange-500" /> },
  { name: 'ResearchZone', path: '/researchzone', description: 'Latest medical research', icon: <BookOpenText size={18} className="text-yellow-600" /> },
  { name: 'JobsZone', path: '/jobszone', description: 'Medical career opportunities', icon: <Briefcase size={18} className="text-indigo-500" /> },
  { name: 'MedicalTools', path: '/medicaltools', description: 'Essential doctor calculators', icon: <Stethoscope size={18} className="text-teal-500" /> },
  { name: 'ZoneMatch', path: '/zonematch', description: 'Connect with fellow doctors', icon: <Heart size={18} className="text-pink-500" /> },
];

const ZoneSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
        }`}
      >
        <span>Zones</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
              {zoneOptions.map((zone) => (
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