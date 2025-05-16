import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Video, MessageCircle, BrainCircuit, Video as Video2, BookOpenText, Briefcase, Stethoscope, Heart, ArrowRight, ShieldCheck, BadgeCheck } from 'lucide-react';

const HomePage: React.FC = () => {
  const zones = [
    {
      name: 'MyZone',
      description: 'A medical social feed built exclusively for healthcare professionals',
      icon: <Users size={24} className="text-primary-500" />,
      path: '/myzone',
      containerClass: 'myzone-container',
    },
    {
      name: 'ZoneTube',
      description: 'Watch, learn and share medical videos with fellow physicians',
      icon: <Video size={24} className="text-red-500" />,
      path: '/zonetube',
      containerClass: 'zonetube-container',
    },
    {
      name: 'ChatZone',
      description: 'Secure messaging designed for doctor-to-doctor communication',
      icon: <MessageCircle size={24} className="text-green-500" />,
      path: '/chatzone',
      containerClass: 'chatzone-container',
    },
    {
      name: 'ZoneGBT',
      description: 'Medical AI assistant to help with research and clinical questions',
      icon: <BrainCircuit size={24} className="text-purple-500" />,
      path: '/zonegbt',
      containerClass: 'zonegbt-container',
    },
    {
      name: 'ZomZone',
      description: 'Professional video meetings for medical consultations and training',
      icon: <Video2 size={24} className="text-blue-500" />,
      path: '/zomzone',
      containerClass: 'zomzone-container',
    },
    {
      name: 'ResearchZone',
      description: 'Access the latest medical research and literature with smart tools',
      icon: <BookOpenText size={24} className="text-yellow-600" />,
      path: '/researchzone',
      containerClass: 'researchzone-container',
    },
    {
      name: 'JobsZone',
      description: 'Find and post medical career opportunities in your specialty',
      icon: <Briefcase size={24} className="text-indigo-500" />,
      path: '/jobszone',
      containerClass: 'jobszone-container',
    },
    {
      name: 'MedicalTools',
      description: 'Essential calculators and reference tools for clinical practice',
      icon: <Stethoscope size={24} className="text-teal-500" />,
      path: '/medicaltools',
      containerClass: 'medicaltools-container',
    },
    {
      name: 'ZoneMatch',
      description: 'Connect with doctors who share your interests and specialties',
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

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-500 to-primary-700 py-20 text-white">
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            >
              The Complete Digital Ecosystem for Medical Professionals
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 text-lg leading-relaxed text-blue-100 md:text-xl"
            >
              Connect, collaborate, and grow with an exclusive platform designed by doctors, for doctors. Your all-in-one solution for the modern medical practice.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0"
            >
              <Link to="/signup" className="btn bg-white font-semibold text-primary-500 hover:bg-blue-50">
                Join Now
              </Link>
              <Link to="/tour" className="btn bg-primary-600 text-white hover:bg-primary-700">
                Take a Tour <ArrowRight size={16} className="ml-2" />
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
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trusted by leading medical institutions</p>
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

      {/* Zones Grid Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Explore Our Medical Zones</h2>
            <p className="text-lg text-gray-600">Each zone is specifically designed to enhance different aspects of your medical practice and career.</p>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {zones.map((zone) => (
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
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Built for Medical Professionals</h2>
            <p className="text-lg text-gray-600">Experience a platform that understands the unique needs of healthcare providers.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <ShieldCheck size={24} className="text-primary-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Medical-Grade Security</h3>
              <p className="text-gray-600">Industry-leading encryption and privacy controls designed specifically for healthcare professionals.</p>
            </div>
            
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <BadgeCheck size={24} className="text-primary-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Verified Community</h3>
              <p className="text-gray-600">Connect with authentic, verified medical professionals in a trusted environment.</p>
            </div>
            
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <BrainCircuit size={24} className="text-primary-500" />
              </div>
              <h3 className="mb-3 text-xl font-bold">AI-Powered Tools</h3>
              <p className="text-gray-600">Smart features that adapt to your specialty and help you work more efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-500 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join the Medical Revolution</h2>
            <p className="mb-8 text-lg text-blue-100">Take your practice to the next level with MyDrZone. Sign up today and connect with thousands of medical professionals worldwide.</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link to="/signup" className="btn bg-white font-semibold text-primary-500 hover:bg-blue-50">
                Create Your Account
              </Link>
              <Link to="/login" className="btn border border-white bg-transparent hover:bg-primary-600">
                Existing User? Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;