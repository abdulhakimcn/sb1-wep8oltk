import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, Brain, MessageCircle, Sparkles, Bot as Bottle } from 'lucide-react';
import { motion } from 'framer-motion';

const ZoneMatchPage: React.FC = () => {
  const features = [
    {
      id: 'dream-bottle',
      title: 'قارورة الأحلام',
      description: 'اكتب حلمك وارمه إلى السماء... ربما يلتقي بحلم شخص آخر',
      icon: <Sparkles size={32} className="text-primary-500" />,
      path: '/zonematch/dreambottle'
    },
    {
      id: 'personality-test',
      title: 'اختبار التوافق الطبي',
      description: 'اكتشف نمط شخصيتك الطبية وتواصل مع من يشبهونك',
      icon: <Brain size={32} className="text-purple-500" />,
      path: '/zonematch/match'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <Heart size={40} className="text-pink-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">ZoneMatch</h1>
          <p className="text-gray-600">تواصل مع أطباء يشاركونك نفس الاهتمامات والتطلعات</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
                <span className="font-medium">ابدأ الآن</span>
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