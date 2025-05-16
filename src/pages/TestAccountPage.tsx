import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TestAccountCard from '../components/TestAccountCard';

const TestAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

  // Test account credentials
  const testAccount = {
    email: 'drtest@hakeemzone.com',
    password: 'DrZone2025!',
    phone: '+967774168043',
    phoneCode: '123456',
    type: 'Doctor Account'
  };

  useEffect(() => {
    const createTestAccount = async () => {
      try {
        setLoading(true);
        
        // Check if account already exists
        const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
          email: testAccount.email,
          password: testAccount.password
        });
        
        if (existingUser.user) {
          // Account already exists
          setAccountCreated(true);
          setLoading(false);
          return;
        }
        
        // Create new account
        const { data: newUser, error: createError } = await supabase.auth.signUp({
          email: testAccount.email,
          password: testAccount.password,
          options: {
            data: {
              account_type: 'doctor',
              is_test_account: true
            }
          }
        });
        
        if (createError) throw createError;
        
        // Create profile for the new user
        if (newUser.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: newUser.user.id,
              username: 'drtest',
              full_name: 'Dr. Test Account',
              type: 'doctor',
              specialty: 'General Practice',
              is_public: true,
              is_verified: true
            });
            
          if (profileError) throw profileError;
          
          setAccountCreated(true);
        }
      } catch (error) {
        console.error('Error creating test account:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    createTestAccount();
  }, []);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithPassword({
        email: testAccount.email,
        password: testAccount.password
      });
      
      navigate('/myzone');
    } catch (error) {
      console.error('Error logging in with test account:', error);
      setError(`Failed to log in: ${error.message}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Test Account | Dr.Zone AI</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/drzone-icon.svg" 
              alt="Dr.Zone AI Logo" 
              className="h-16 w-16 mx-auto mb-4" 
            />
            <h2 className="text-3xl font-extrabold text-gray-900">Test Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Use these credentials to log in and test the platform
            </p>
          </div>
          
          {loading ? (
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Setting up test account...</p>
            </div>
          ) : error ? (
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error creating test account</h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Go to Login Page
              </button>
            </div>
          ) : (
            <TestAccountCard onLogin={handleLogin} />
          )}
        </div>
      </div>
    </>
  );
};

export default TestAccountPage;