import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Video, MessageCircle, BrainCircuit, Video as Video2, BookOpenText, Briefcase, Stethoscope, Heart, ArrowRight, ShieldCheck, BadgeCheck, Crown, Edit, Mic, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const zones = [
    {
      name: t('nav.myZone'),
      description: t('myZone.subtitle'),
      icon: <Users size={24} className="text-primary-500" />,
      path: '/myzone',
      containerClass: 'myzone-container',
      featured: true
    },
    {
      name: t('nav.zoneTube'),
      description: t('zoneTube.subtitle'),
      icon: <Video size={24} className="text-red-500" />,
      path: '/zonetube',
      containerClass: 'zonetube-container',
    },
    {
      name: t('nav.zoneCast'),
      description: t('zoneCast.subtitle'),
      icon: <Mic size={24} className="text-pink-500" />,
      path: '/zonecast',
      containerClass: 'zonecast-container',
    },
    {
      name: t('nav.chatZone'),
      description: t('chat.subtitle'),
      icon: <MessageCircle size={24} className="text-green-500" />,
      path: '/chatzone',
      containerClass: 'chatzone-container',
    },
    {
      name: t('nav.zoneGBT'),
      description: t('zoneGBT.subtitle'),
      icon: <BrainCircuit size={24} className="text-purple-500" />,
      path: '/zonegbt',
      containerClass: 'zonegbt-container',
    },
    {
      name: t('nav.zomZone'),
      description: t('zomZone.subtitle'),
      icon: <Video2 size={24} className="text-blue-500" />,
      path: '/zomzone',
      containerClass: 'zomzone-container',
    },
    {
      name: t('nav.conferenceZone'),
      description: t('conferenceZone.subtitle'),
      icon: <Calendar size={24} className="text-orange-500" />,
      path: '/conferencezone',
      containerClass: 'conference-container',
    },
    {
      name: t('nav.researchZone'),
      description: t('researchZone.subtitle'),
      icon: <BookOpenText size={24} className="text-yellow-600" />,
      path: '/researchzone',
      containerClass: 'researchzone-container',
    },
    {
      name: t('nav.jobsZone'),
      description: t('jobsZone.subtitle'),
      icon: <Briefcase size={24} className="text-indigo-500" />,
      path: '/jobszone',
      containerClass: 'jobszone-container',
    },
    {
      name: t('nav.medicalTools'),
      description: t('medicalTools.subtitle'),
      icon: <Stethoscope size={24} className="text-teal-500" />,
      path: '/medicaltools',
      containerClass: 'medicaltools-container',
    },
    {
      name: t('nav.zoneMatch'),
      description: t('zonematch.subtitle'),
      icon: <Heart size={24} className="text-pink-500" />,
      path: '/zonematch',
      containerClass: 'zonematch-container',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Featured zone (MyZone)
  const featuredZone = zones.find(zone => zone.featured);
  // Other zones
  const otherZones = zones.filter(zone => !zone.featured);

  const isArabic = i18n.language === 'ar';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-500 to-primary-700 py-20 text-white">
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/drzone-icon-dark.svg" 
                alt="Dr.Zone AI Logo" 
                className="h-20 w-20" 
              />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            >
              {isArabic ? 'منصة حكيم زون الذكية' : 'Dr.Zone AI'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 text-lg leading-relaxed text-blue-100 md:text-xl"
            >
              {t('home.hero.subtitle')}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 text-lg leading-relaxed text-blue-100 md:text-xl"
            >
              منصة واحدة، تجمع كل ما يحتاجه الطبيب الحديث من أدوات، مجتمع، ومحتوى ذكي.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0"
            >
              <Link to="/auth" className="btn bg-sky-400 font-semibold text-white hover:bg-sky-500 text-base px-6 py-3 shadow-lg">
                {t('home.hero.cta.join')} 👤
              </Link>
              <Link to="/tour" className="btn bg-primary-600 text-white hover:bg-primary-700 text-base px-6 py-3">
                {t('home.hero.cta.tour')} <ArrowRight size={16} className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <svg className="h-full w-full" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 16 L32 48 M16 32 L48 32" stroke="white" strokeWidth="2" />
            <circle cx="32" cy="32" r="24" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('home.trusted.title')}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 grayscale opacity-70">
              <div className="h-8 w-auto">
                <img src="https://images.pexels.com/photos/11661406/pexels-photo-11661406.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Medical Logo 1" className="h-full" />
              </div>
              <div className="h-8 w-auto">
                <img src="https://images.pexels.com/photos/8445073/pexels-photo-8445073.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Medical Logo 2" className="h-full" />
              </div>
              <div className="h-8 w-auto">
                <img src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Medical Logo 3" className="h-full" />
              </div>
              <div className="h-8 w-auto">
                <img src="https://images.pexels.com/photos/6527057/pexels-photo-6527057.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Medical Logo 4" className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Zone (MyZone) */}
      {featuredZone && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <Crown size={32} className="text-yellow-500 mr-3" />
                  <h2 className="text-3xl font-bold">{featuredZone.name}</h2>
                </div>
                <p className="text-xl text-gray-600 mb-6">{featuredZone.description}</p>
                <p className="text-gray-600 mb-8">شارك يومياتك، تجاربك، وأفكارك مع المجتمع الطبي.</p>
                <Link 
                  to={featuredZone.path} 
                  className="inline-flex items-center bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  <Edit size={20} className="mr-2" />
                  {t('myZone.welcome.createPost')}
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className={`zone-container h-full ${featuredZone.containerClass} p-8 rounded-xl shadow-xl`}>
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      {featuredZone.icon}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="mb-2 text-2xl font-bold">{featuredZone.name}</h3>
                        <Crown size={20} className="text-yellow-500 ml-2" />
                      </div>
                      <p className="text-lg text-gray-700">{featuredZone.description}</p>
                      <div className="mt-6 bg-white/50 p-4 rounded-lg">
                        <p className="text-gray-700 font-medium">{t('myZone.welcomeMessage')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Zones Grid Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{t('nav.zones')}</h2>
            <p className="text-lg text-gray-600">{t('home.zones.description')}</p>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {otherZones.map((zone) => (
              <motion.div key={zone.name} variants={item}>
                <Link 
                  to={zone.path} 
                  className={`zone-container block h-full ${zone.containerClass}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      {zone.icon}
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold">{zone.name}</h3>
                      <p className="text-sm text-gray-600">{zone.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{t('home.features.title')}</h2>
            <p className="text-lg text-gray-600">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <ShieldCheck size={24} className="text-primary-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{t('home.features.security.title')}</h3>
              <p className="text-gray-600">{t('home.features.security.description')}</p>
            </div>
            
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <BadgeCheck size={24} className="text-primary-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{t('home.features.verified.title')}</h3>
              <p className="text-gray-600">{t('home.features.verified.description')}</p>
            </div>
            
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <BrainCircuit size={24} className="text-primary-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{t('home.features.ai.title')}</h3>
              <p className="text-gray-600">{t('home.features.ai.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-500 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('home.cta.title')}</h2>
            <p className="mb-4 text-lg text-blue-100">{t('home.cta.subtitle')}</p>
            <p className="mb-8 text-lg text-blue-100">ابدأ مجانًا، أو سجل لاحقًا لتواصل رحلتك.</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link to="/auth?view=sign_up" className="btn bg-white font-semibold text-primary-500 hover:bg-blue-50 text-base px-6 py-3">
                {t('home.cta.createAccount')} 🧬
              </Link>
              <Link to="/auth?view=sign_in" className="btn border border-white bg-transparent hover:bg-primary-600 text-base px-6 py-3">
                {t('home.cta.existingUser')} 🔑
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;