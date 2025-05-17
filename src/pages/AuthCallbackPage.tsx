import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback page loaded, processing authentication...');
        
        // Get the full URL including hash fragments
        const fullUrl = window.location.href;
        
        // Process the OAuth callback or email verification
        const { data, error } = await supabase.auth.exchangeCodeForSession(fullUrl);
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          // Still navigate to auth page after a delay
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }
        
        if (data.session) {
          console.log('Session established successfully');
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (profile) {
            // User has a profile, redirect to MyZone
            navigate('/myzone');
          } else {
            // User needs to complete onboarding
            navigate('/onboarding');
          }
        } else {
          // No session, redirect to auth page
          navigate('/auth');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Still navigate to auth page after a delay
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <>
      <Helmet>
        <title>Authentication | Dr.Zone AI</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img 
            src="/drzone-icon.svg" 
            alt="Dr.Zone AI Logo" 
            className="h-16 w-16 mx-auto mb-4 animate-pulse" 
          />
          <h2 className="text-xl font-semibold mb-2">
            {error ? 'Authentication Error' : 'Completing authentication...'}
          </h2>
          {error ? (
            <div>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Redirecting to login page...</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
              <p className="text-gray-600">Please wait while we sign you in.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthCallbackPage;
