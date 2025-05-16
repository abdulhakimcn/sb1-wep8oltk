import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Facebook, Apple, Twitter, Linkedin, Github, Watch as Wechat } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthWithSocialProps {
  onError: (error: Error) => void;
}

const AuthWithSocial: React.FC<AuthWithSocialProps> = ({ onError }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Social providers configuration
  const socialProviders = [
    { 
      id: 'google', 
      name: 'Google', 
      icon: (
        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="#4285F4"
          />
        </svg>
      ),
      color: '#4285F4'
    },
    { 
      id: 'apple', 
      name: 'Apple', 
      icon: <Apple size={20} />,
      color: '#000000'
    },
    { 
      id: 'microsoft', 
      name: 'Microsoft', 
      icon: (
        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
          <path fill="#f25022" d="M0 0h11.5v11.5H0z"/>
          <path fill="#00a4ef" d="M0 12.5h11.5V24H0z"/>
          <path fill="#7fba00" d="M12.5 0H24v11.5H12.5z"/>
          <path fill="#ffb900" d="M12.5 12.5H24V24H12.5z"/>
        </svg>
      ),
      color: '#0078D4'
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: <Twitter size={20} />,
      color: '#1DA1F2'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: <Facebook size={20} />,
      color: '#1877F2'
    },
    { 
      id: 'wechat', 
      name: 'WeChat', 
      icon: <Wechat size={20} />,
      color: '#07C160'
    }
  ];

  // Handle social sign-in
  const handleSocialSignIn = async (provider: string) => {
    try {
      setIsLoading(provider);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      onError(error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            {isArabic ? "أو تسجيل الدخول باستخدام" : "or sign in with"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {socialProviders.map(provider => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleSocialSignIn(provider.id)}
            disabled={isLoading !== null}
            className={`w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${
              isLoading === provider.id ? 'relative' : ''
            }`}
            aria-label={`Sign in with ${provider.name}`}
            style={{ color: provider.color }}
          >
            {isLoading === provider.id ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              provider.icon
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuthWithSocial;