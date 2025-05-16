import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, Brain, MessageCircle, Sparkles, Bot as Bottle, FileText, Stethoscope, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ZoneMatchPage: React.FC = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      id: 'dream-bottle',
      title: t('zonematch.dreamBottle.title'),
      description: t('zonematch.dreamBottle.description'),
      icon: <Sparkles size={32} className="text-primary-500" />,
      path: '/zonematch/dreambottle'
    },
    {
      id: 'personality-test',
      title: t('zonematch.personalityTest.title'),
      description: t('zonematch.personalityTest.description'),
      icon: <Brain size={32} className="text-purple-500" />,
      path: '/zonematch/personality-test'
    },
    {
      id: 'case-of-the-day',
      title: t('zonematch.caseOfTheDay.title'),
      description: t('zonematch.caseOfTheDay.description'),
      icon: <FileText size={32} className="text-blue-500" />,
      path: '/zonematch/case-of-the-day'
    },
    {
      id: 'doctor-or-myth',
      title: t('zonematch.doctorOrMyth.title'),
      description: t('zonematch.doctorOrMyth.description'),
      icon: <Stethoscope size={32} className="text-green-500" />,
      path: '/zonematch/doctor-or-myth'
    },
    {
      id: 'patient-speaks',
      title: t('zonematch.patientSpeaks.title'),
      description: t('zonematch.patientSpeaks.description'),
      icon: <MessageCircle size={32} className="text-yellow-500" />,
      path: '/zonematch/patient-speaks'
    },
    {
      id: 'spot-the-mistake',
      title: t('zonematch.spotTheMistake.title'),
      description: t('zonematch.spotTheMistake.description'),
      icon: <Users size={32} className="text-red-500" />,
      path: '/zonematch/spot-the-mistake'
    },
    {
      id: 'find-your-specialty',
      title: "Find Your Medical Specialty",
      description: "Let your answers guide you to the right path in medicine. Discover which specialty best matches your personality and strengths.",
      icon: <Microscope size={32} className="text-teal-500" />,
      path: '/zonematch/find-your-specialty'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <Heart size={40} className="text-pink-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">{t('zonematch.title')}</h1>
          <p className="text-gray-600">{t('zonematch.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-4 flex items-center text-primary-500">
                <span className="font-medium">{t('zonematch.dreamBottle.startNow')}</span>
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZoneMatchPage;