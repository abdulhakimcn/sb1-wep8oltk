import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Process the OAuth callback
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Redirect to onboarding or dashboard based on user status
        navigate('/onboarding');
      } else if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    // Check for hash fragment that might contain the access token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      // If we have an access token in the URL, we can assume the user has been authenticated
      // The onAuthStateChange listener above will handle the redirect
      console.log('Access token found in URL');
    } else {
      // If no access token is found, check if we're already signed in
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/onboarding');
        } else {
          navigate('/auth');
        }
      };
      
      checkSession();
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <img 
          src="/drzone-icon.svg" 
          alt="Dr.Zone AI Logo" 
          className="h-16 w-16 mx-auto mb-4 animate-pulse" 
        />
        <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;