import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Mail, Key, Facebook, Apple, Twitter, Linkedin, Github, Building, User } from 'lucide-react';
import { supabase, isValidEmailDomain, ALLOWED_EMAIL_DOMAINS } from '../lib/supabase';
import PasswordInput from './PasswordInput';

interface AuthFormProps {
  view: 'sign_in' | 'sign_up' | 'forgotten_password';
  onViewChange: (view: 'sign_in' | 'sign_up' | 'forgotten_password') => void;
  accountType?: 'doctor' | 'organization';
}

const AuthForm: React.FC<AuthFormProps> = ({ view, onViewChange, accountType = 'doctor' }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Organization-specific fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgCountry, setOrgCountry] = useState('');

  // Handle email input change to validate domain
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !isValidEmailDomain(newEmail)) {
      setEmailError(isArabic
        ? "عذراً، هذا النطاق غير مدعوم. يرجى استخدام بريد إلكتروني من نطاق معتمد."
        : "Sorry, this domain is not supported. Please use an email from an approved domain.");
    } else {
      setEmailError(null);
    }
  };

  // Handle social sign-in
  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'twitter' | 'apple' | 'linkedin' | 'github') => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            account_type: accountType
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if email exists
  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      if (view === 'sign_in') {
        // First check if the email exists
        const emailExists = await checkEmailExists(email);
        
        if (!emailExists) {
          throw new Error(isArabic
            ? "لم يتم العثور على حساب بهذا البريد الإلكتروني. هل تريد إنشاء حساب جديد؟"
            : "No account found with this email. Would you like to create a new account?");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error(isArabic
              ? "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى أو استخدام خيار 'نسيت كلمة المرور'"
              : "Incorrect password. Please try again or use the 'Forgot Password' option");
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error(isArabic
              ? "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الوارد لرابط التأكيد."
              : "Please confirm your email before signing in. Check your inbox for the confirmation link.");
          }
          throw error;
        }
        
      } else if (view === 'sign_up') {
        // Add account type and organization details to metadata
        const metadata: any = {
          account_type: accountType
        };
        
        if (accountType === 'organization' && orgType) {
          if (!orgName || !orgType || !orgCountry) {
            throw new Error(isArabic
              ? "يرجى ملء جميع حقول المؤسسة المطلوبة"
              : "Please fill in all required organization fields");
          }
          
          metadata.org_name = orgName;
          metadata.org_type = orgType;
          metadata.org_country = orgCountry;
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: `${window.location.origin}/onboarding`
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error(isArabic
              ? "هذا البريد الإلكتروني مسجل بالفعل. هل تريد تسجيل الدخول بدلاً من ذلك؟"
              : "This email is already registered. Would you like to sign in instead?");
          }
          throw error;
        }
        
        setSuccessMessage(isArabic
          ? "تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك الوارد."
          : "Confirmation link sent to your email. Please check your inbox.");
        
      } else if (view === 'forgotten_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?view=update_password`
        });
        
        if (error) throw error;
        
        setSuccessMessage(isArabic
          ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."
          : "Password reset link sent to your email.");
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMessage(error.message);
      
      // If the error suggests the user should sign up instead, provide a button to switch views
      if (error.message.includes('No account found')) {
        setTimeout(() => onViewChange('sign_up'), 3000);
      }
      // If the error suggests the user should sign in instead, provide a button to switch views
      else if (error.message.includes('already registered')) {
        setTimeout(() => onViewChange('sign_in'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-red-700" dir={isArabic ? 'rtl' : 'ltr'}>
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700" dir={isArabic ? 'rtl' : 'ltr'}>
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Account Type Indicator for Sign Up */}
        {view === 'sign_up' && (
          <div className="flex items-center space-x-2 bg-primary-50 p-3 rounded-md">
            {accountType === 'doctor' ? (
              <>
                <User size={20} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {isArabic ? "إنشاء حساب طبيب" : "Creating Doctor Account"}
                </span>
              </>
            ) : (
              <>
                <Building size={20} className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {isArabic ? "إنشاء حساب مؤسسة طبية" : "Creating Medical Organization Account"}
                </span>
              </>
            )}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('auth.email')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={16} className="text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="doctor@example.com"
            />
          </div>
          {emailError && (
            <p className="mt-1 text-sm text-red-600" dir={isArabic ? 'rtl' : 'ltr'}>
              {emailError}
            </p>
          )}
        </div>
        
        {/* Organization-specific fields for sign up */}
        {view === 'sign_up' && accountType === 'organization' && (
          <>
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                {isArabic ? "اسم المؤسسة" : "Organization Name"}
              </label>
              <input
                id="orgName"
                name="orgName"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={isArabic ? "مستشفى المدينة الطبي" : "City Medical Center"}
              />
            </div>
            
            <div>
              <label htmlFor="orgType" className="block text-sm font-medium text-gray-700">
                {isArabic ? "نوع المؤسسة" : "Organization Type"}
              </label>
              <select
                id="orgType"
                name="orgType"
                required
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">{isArabic ? "اختر نوع المؤسسة" : "Select organization type"}</option>
                <option value="hospital">{isArabic ? "مستشفى" : "Hospital"}</option>
                <option value="clinic">{isArabic ? "عيادة" : "Clinic"}</option>
                <option value="pharma">{isArabic ? "شركة أدوية" : "Pharmaceutical Company"}</option>
                <option value="research">{isArabic ? "مركز أبحاث" : "Research Center"}</option>
                <option value="other">{isArabic ? "أخرى" : "Other"}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="orgCountry" className="block text-sm font-medium text-gray-700">
                {isArabic ? "البلد" : "Country"}
              </label>
              <input
                id="orgCountry"
                name="orgCountry"
                type="text"
                required
                value={orgCountry}
                onChange={(e) => setOrgCountry(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={isArabic ? "المملكة العربية السعودية" : "Saudi Arabia"}
              />
            </div>
          </>
        )}
        
        {view !== 'forgotten_password' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('auth.password')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={16} className="text-gray-400" />
              </div>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                autoComplete={view === 'sign_in' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>
        )}
        
        {view === 'sign_in' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                {isArabic ? "تذكرني" : "Remember me"}
              </label>
            </div>
            
            <div className="text-sm">
              <button
                type="button"
                onClick={() => onViewChange('forgotten_password')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isLoading || !!emailError}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isArabic ? "جاري التحميل..." : "Loading..."}
              </span>
            ) : view === 'sign_in' ? (
              t('auth.signIn')
            ) : view === 'sign_up' ? (
              t('auth.signUp')
            ) : (
              isArabic ? "إرسال رابط إعادة التعيين" : "Send Reset Link"
            )}
          </button>
        </div>
        
        {view === 'sign_in' ? (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => onViewChange('sign_up')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.signUp')}
              </button>
            </p>
          </div>
        ) : view === 'sign_up' ? (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => onViewChange('sign_in')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.signIn')}
              </button>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <button
              type="button"
              onClick={() => onViewChange('sign_in')}
              className="font-medium text-primary-600 hover:text-primary-500 text-sm"
            >
              {isArabic ? "العودة إلى تسجيل الدخول" : "Back to Sign In"}
            </button>
          </div>
        )}
      </form>

      {/* Social Login Section */}
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
          {/* First row of social login buttons */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('google')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
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
            onClick={() => handleSocialSignIn('facebook')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Facebook size={20} className="text-[#1877F2]" />
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn('apple')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Apple size={20} className="text-[#000000]" />
          </button>

          {/* Second row of social login buttons */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('twitter')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Twitter size={20} className="text-[#1DA1F2]" />
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn('linkedin')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Linkedin size={20} className="text-[#0A66C2]" />
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn('github')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Github size={20} className="text-[#333333]" />
          </button>
        </div>
      </div>
    </>
  );
};

export default AuthForm;