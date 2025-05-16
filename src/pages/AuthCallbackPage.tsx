import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback or email verification
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
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
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
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
          <p className="text-gray-600">Please wait while we sign you in.</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
