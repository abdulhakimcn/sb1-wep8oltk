import React, { useState } from 'react';
import { Copy, Check, Mail, Phone, Key, User, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TestAccountCardProps {
  onLogin: () => void;
}

const TestAccountCard: React.FC<TestAccountCardProps> = ({ onLogin }) => {
  const [copied, setCopied] = useState<string | null>(null);

  // Test account credentials
  const testAccount = {
    email: 'drtest@drzone.ai',
    password: 'DrZone2025!',
    phone: '+967774168043',
    phoneCode: '123456',
    type: 'Doctor Account'
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="rounded-md bg-green-50 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Test account is ready to use
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={testAccount.type}
              readOnly
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <button
              onClick={() => handleCopy(testAccount.email, 'email')}
              className="text-xs text-primary-600 hover:text-primary-500 flex items-center"
            >
              {copied === 'email' ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={testAccount.email}
              readOnly
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <button
              onClick={() => handleCopy(testAccount.password, 'password')}
              className="text-xs text-primary-600 hover:text-primary-500 flex items-center"
            >
              {copied === 'password' ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={testAccount.password}
              readOnly
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <button
              onClick={() => handleCopy(testAccount.phone, 'phone')}
              className="text-xs text-primary-600 hover:text-primary-500 flex items-center"
            >
              {copied === 'phone' ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={testAccount.phone}
              readOnly
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Phone verification code: <strong>{testAccount.phoneCode}</strong>
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Mail className="h-5 w-5 mr-2" />
            Login with Email
          </button>
          
          <Link
            to="/phone-login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Phone className="h-5 w-5 mr-2" />
            Login with Phone
          </Link>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>This test account has full access to all platform features.</p>
          <p className="mt-1">It is pre-verified as a medical professional.</p>
        </div>
      </div>
    </div>
  );
};

export default TestAccountCard;