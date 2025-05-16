import React from 'react';
import { Facebook, Apple, Twitter, Linkedin, Github, Watch as Wechat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface SocialLoginGridProps {
  onError: (error: Error) => void;
}

const SocialLoginGrid: React.FC<SocialLoginGridProps> = ({ onError }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Handle social sign-in
  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'twitter' | 'apple' | 'microsoft' | 'github' | 'wechat') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      onError(error);
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
        {/* First row */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Sign in with Google"
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="#4285F4"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignIn('apple')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Sign in with Apple"
        >
          <Apple size={20} className="text-[#000000]" />
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignIn('microsoft')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Sign in with Microsoft"
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path fill="#f25022" d="M0 0h11.5v11.5H0z"/>
            <path fill="#00a4ef" d="M0 12.5h11.5V24H0z"/>
            <path fill="#7fba00" d="M12.5 0H24v11.5H12.5z"/>
            <path fill="#ffb900" d="M12.5 12.5H24V24H12.5z"/>
          </svg>
        </button>

        {/* Second row */}
        <button
          type="button"
          onClick={() => handleSocialSignIn('twitter')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Sign in with Twitter"
        >
          <Twitter size={20} className="text-[#1DA1F2]" />
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignIn('facebook')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Sign in with Facebook"
        >
          <Facebook size={20} className="text-[#1877F2]" />
        </button>

        <button
          type="button"
          onClick={() => handleSocialSignIn('wechat')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Sign in with WeChat"
        >
          <Wechat size={20} className="text-[#07C160]" />
        </button>
      </div>
    </div>
  );
};

export default SocialLoginGrid;