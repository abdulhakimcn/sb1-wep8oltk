import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary-500">MyDrZone</span>
            </Link>
            <p className="text-sm text-gray-600">
              The complete digital ecosystem for medical professionals. Connect, learn, and grow in a secure environment designed exclusively for doctors.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">Zones</h4>
            <ul className="space-y-2">
              <li><Link to="/myzone" className="text-sm text-gray-600 hover:text-primary-500">MyZone</Link></li>
              <li><Link to="/zonetube" className="text-sm text-gray-600 hover:text-primary-500">ZoneTube</Link></li>
              <li><Link to="/chatzone" className="text-sm text-gray-600 hover:text-primary-500">ChatZone</Link></li>
              <li><Link to="/zonegbt" className="text-sm text-gray-600 hover:text-primary-500">ZoneGBT</Link></li>
              <li><Link to="/zomzone" className="text-sm text-gray-600 hover:text-primary-500">ZomZone</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">More Zones</h4>
            <ul className="space-y-2">
              <li><Link to="/researchzone" className="text-sm text-gray-600 hover:text-primary-500">ResearchZone</Link></li>
              <li><Link to="/jobszone" className="text-sm text-gray-600 hover:text-primary-500">JobsZone</Link></li>
              <li><Link to="/medicaltools" className="text-sm text-gray-600 hover:text-primary-500">MedicalTools</Link></li>
              <li><Link to="/zonematch" className="text-sm text-gray-600 hover:text-primary-500">ZoneMatch</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-600 hover:text-primary-500">About</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-500">Privacy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-600 hover:text-primary-500">Terms</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-600 hover:text-primary-500">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-between space-y-4 border-t border-gray-200 pt-8 md:flex-row md:space-y-0">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} MyDrZone. All rights reserved.
          </p>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">Made with</span>
            <Heart size={12} className="text-accent-500" fill="#ff6900" />
            <span className="text-xs text-gray-600">for the medical community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;