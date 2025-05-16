import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, Bell, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import DevLoginBanner from './DevLoginBanner';

const Layout: React.FC = () => {
  console.log('Layout rendered'); // Debug log
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DevLoginBanner />
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;