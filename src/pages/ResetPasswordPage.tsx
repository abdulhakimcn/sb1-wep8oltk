import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import PasswordInput from '../components/PasswordInput';

const ResetPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = i18n.language === 'ar';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);

  // Extract the reset code from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    
    if (code) {
      setResetCode(code);
    } else {
      setError(isArabic 
        ? "لم يتم العثور على رمز إعادة تعيين كلمة المرور في الرابط. يرجى التحقق من الرابط أو طلب رابط جديد."
        : "No reset code found in the URL. Please check the link or request a new one.");
    }
  }, [location, isArabic]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetCode) {
      setError(isArabic 
        ? "رمز إعادة التعيين غير صالح أو مفقود."
        : "Invalid or missing reset code.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError(isArabic 
        ? "كلمات المرور غير متطابقة."
        : "Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError(isArabic 
        ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
        : "Password must be at least 8 characters long.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(resetCode);
      if (exchangeError) throw exchangeError;

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isArabic ? "إعادة تعيين كلمة المرور | حكيم زون" : "Reset Password | Dr.Zone AI"}</title>
      </Helmet>
      
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
              {isArabic ? "إعادة تعيين كلمة المرور" : "Reset Your Password"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isArabic 
                ? "أدخل كلمة المرور الجديدة لحسابك" 
                : "Enter a new password for your account"}
            </p>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                <div className="ml-3">
                  <p className="text-sm text-red-700" dir={isArabic ? 'rtl' : 'ltr'}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {success ? (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                <div className="ml-3">
                  <p className="text-sm text-green-700" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? "تم إعادة تعيين كلمة المرور بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول."
                      : "Password reset successful! You will be redirected to the login page."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {isArabic ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <div className="mt-1">
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <div className="mt-1">
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !resetCode}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isArabic ? "جاري المعالجة..." : "Processing..."}
                    </span>
                  ) : (
                    <span>{isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password"}</span>
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {isArabic ? "العودة إلى تسجيل الدخول" : "Back to Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
