import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from './AuthProvider';

const DevLoginBanner: React.FC = () => {
  const { user } = useAuth();
  
  // Check if this is a dev account
  const isDevAccount = user?.user_metadata?.is_dev_account === true;
  
  if (!isDevAccount) return null;
  
  return (
    <div className="bg-yellow-500 text-white py-1 px-4 text-center text-sm">
      <div className="flex items-center justify-center">
        <AlertTriangle size={16} className="mr-2" />
        <span>
          <strong>Developer Mode:</strong> You are using a test account. Some features may be limited.
        </span>
      </div>
    </div>
  );
};

export default DevLoginBanner;