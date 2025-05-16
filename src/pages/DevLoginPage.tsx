import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Code, UserCheck, Info } from 'lucide-react';
import { loginWithDevAccount } from '../lib/devAuth';
import { Helmet } from 'react-helmet-async';

const DevLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a developer username');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginWithDevAccount(username);
      
      if (result.success) {
        navigate('/myzone');
      } else {
        setError(result.error || 'Failed to login with developer account');
      }
    } catch (err) {
      console.error('Dev login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during developer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Developer Login | Dr.Zone AI</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <Code size={32} className="text-yellow-600" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">🧪 Developer Test Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Quick login for development and testing purposes only
            </p>
          </div>
          
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Development Environment Only</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This login method is for development and testing purposes only. It bypasses email verification and creates a temporary account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="rounded-md bg-blue-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Developer Testing Instructions</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="mb-2">
                      Enter any username you'd like to use for testing. The system will:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Create a test account with format: <code className="bg-blue-100 px-1 rounded">username@dev.mydrzone.local</code></li>
                      <li>Bypass all email verification</li>
                      <li>Use a standard test password</li>
                      <li>Create the same account each time you use the same username</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleDevLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Developer Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter any test username (e.g., dev1, tester2)"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Will be converted to: {username ? `${username.toLowerCase()}@dev.mydrzone.local` : 'username@dev.mydrzone.local'}
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserCheck size={18} className="mr-2" />
                      Login as Developer
                    </span>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or use regular login
                  </span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Back to normal login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DevLoginPage;