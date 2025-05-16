import React, { useState, useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, isValidEmailDomain, ALLOWED_EMAIL_DOMAINS } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Code, AlertCircle, Phone, Mail, AlertTriangle, Eye, EyeOff, Facebook, Github, Apple, Twitter, Linkedin, Watch as Wechat, Home, HelpCircle, Building, User } from 'lucide-react';
import PhoneAuthForm from './PhoneAuthForm';
import AuthForm from './AuthForm';

const Auth: React.FC = () => {
  console.log('Auth component rendering'); // Debug log
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showDevOption, setShowDevOption] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'email' | 'phone'>('email');
  const [view, setView] = useState<'sign_in' | 'sign_up' | 'forgotten_password'>(
    searchParams.get('view') === 'sign_up' ? 'sign_up' : 'sign_in'
  );
  const [accountType, setAccountType] = useState<'doctor' | 'organization'>('doctor');
  const [showOrgOption, setShowOrgOption] = useState(false);
  
  // Determine if we're showing Arabic content
  const isArabic = i18n.language === 'ar';

  // Listen for auth state changes to detect errors
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'USER_UPDATED' && !session) {
        setErrorMessage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Custom error handler for auth UI
  const handleAuthError = (error: Error) => {
    console.log('Auth error:', error.message);
    
    if (error.message.includes('Invalid login credentials')) {
      setErrorMessage(isArabic 
        ? "❌ لم نتمكن من تسجيل الدخول. تأكد من صحة البريد وكلمة المرور، أو جرّب خيار \"نسيت كلمة المرور؟\""
        : "❌ We couldn't sign you in. Please double-check your email and password, or try the \"Forgot your password?\" option."
      );
    } else if (error.message.includes('Email address is invalid')) {
      // Check if the email is from hakeemzone.com
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput && emailInput.value) {
        const domain = emailInput.value.split('@')[1]?.toLowerCase();
        if (domain === 'hakeemzone.com') {
          setErrorMessage("This email appears valid. Please try again or contact support if the issue persists.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage(error.message);
    }
    
    return error;
  };

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

  // Monitor input fields to attach our validation
  useEffect(() => {
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener('change', (e) => handleEmailChange(e as any));
      emailInput.addEventListener('blur', (e) => handleEmailChange(e as any));
    }
    
    return () => {
      if (emailInput) {
        emailInput.removeEventListener('change', (e) => handleEmailChange(e as any));
        emailInput.removeEventListener('blur', (e) => handleEmailChange(e as any));
      }
    };
  }, []);

  // Add password toggle functionality to Supabase Auth UI
  useEffect(() => {
    const addPasswordToggle = () => {
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      
      passwordInputs.forEach((input, index) => {
        const parentElement = input.parentElement;
        
        // Skip if toggle already exists
        if (parentElement?.querySelector('.password-toggle-btn')) return;
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle-btn absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none';
        toggleBtn.setAttribute('tabindex', '-1');
        toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        
        // Add toggle functionality
        toggleBtn.addEventListener('click', () => {
          const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
          input.setAttribute('type', type);
          
          // Update icon
          if (type === 'text') {
            toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>';
          } else {
            toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
          }
        });
        
        // Add button to parent element
        if (parentElement) {
          parentElement.style.position = 'relative';
          parentElement.appendChild(toggleBtn);
        }
      });
    };
    
    // Run initially and set up a mutation observer to catch dynamically added inputs
    addPasswordToggle();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          addPasswordToggle();
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, [authView]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/drzone-icon.svg" 
              alt="Dr.Zone AI Logo" 
              className="h-20 w-20" 
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isArabic ? (
              <span className="flex items-center justify-center">
                <span>👨‍⚕️</span>
                <span className="mx-2">مرحباً بك في حكيم زون</span>
              </span>
            ) : (
              "Welcome to Dr.Zone AI"
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isArabic ? 
              "منصة طبية خاصة بالأطباء فقط، صمّمت لتكون منطقتك الآمنة." : 
              "Join the exclusive medical professional network"}
          </p>
        </div>
        
        {/* Auth Method Selector */}
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setAuthView('email')}
            className={`relative inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${
              authView === 'email'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Mail size={16} className="mr-2" />
            {isArabic ? "البريد الإلكتروني" : "Email"}
          </button>
          <button
            type="button"
            onClick={() => setAuthView('phone')}
            className={`relative -ml-px inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${
              authView === 'phone'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Phone size={16} className="mr-2" />
            {isArabic ? "رقم الهاتف" : "Phone"}
          </button>
        </div>
        
        {errorMessage && (
          <div className={`rounded-md ${errorMessage.includes('verification code') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-4 border`}>
            <div className="flex">
              <AlertCircle className={`h-5 w-5 ${errorMessage.includes('verification code') ? 'text-green-400' : 'text-red-400'}`} aria-hidden="true" />
              <div className="ml-3">
                <p className={`text-sm ${errorMessage.includes('verification code') ? 'text-green-700' : 'text-red-700'}`} dir={isArabic ? 'rtl' : 'ltr'}>
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {emailError && authView === 'email' && (
          <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700" dir={isArabic ? 'rtl' : 'ltr'}>
                  {emailError}
                </p>
                <p className="text-sm text-yellow-700 mt-1" dir={isArabic ? 'rtl' : 'ltr'}>
                  {isArabic 
                    ? `النطاقات المدعومة: ${ALLOWED_EMAIL_DOMAINS.join('، ')}`
                    : `Supported domains: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {authView === 'email' ? (
            <AuthForm 
              view={view} 
              onViewChange={setView} 
              accountType={accountType}
            />
          ) : (
            <PhoneAuthForm 
              onBackToEmail={() => setAuthView('email')} 
              accountType={accountType}
            />
          )}
          
          {/* Organization Account Option */}
          {view === 'sign_up' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isArabic 
                    ? "هل تقوم بالتسجيل نيابة عن مستشفى، شركة أدوية، أو عيادة؟" 
                    : "Are you registering on behalf of a hospital, pharma company, or clinic?"}
                </p>
                <button
                  type="button"
                  onClick={() => setAccountType(accountType === 'doctor' ? 'organization' : 'doctor')}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  {accountType === 'doctor' 
                    ? (isArabic ? "إنشاء حساب مؤسسة" : "Create an organization account") 
                    : (isArabic ? "العودة إلى حساب الطبيب" : "Back to doctor account")}
                </button>
              </div>
            </div>
          )}
          
          {/* Developer Login Option */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {showDevOption ? (
              <div className="text-center">
                <Link 
                  to="/dev-login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  <Code size={16} className="mr-2" />
                  {t('auth.devLogin')}
                </Link>
                <p className="mt-2 text-xs text-gray-500">
                  {t('auth.devModeWarning')}
                </p>
                <button
                  onClick={() => setShowDevOption(false)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  {t('auth.backToRegularLogin')}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowDevOption(true)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {t('auth.developerMode')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back to Homepage and Help Links */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700">
            <Home size={16} className="mr-1" />
            <span>{isArabic ? "العودة للصفحة الرئيسية" : "Back to Homepage"}</span>
          </Link>
          <Link to="/help" className="flex items-center text-primary-600 hover:text-primary-700">
            <HelpCircle size={16} className="mr-1" />
            <span>{isArabic ? "تحتاج مساعدة للانضمام؟" : "Need help joining?"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;