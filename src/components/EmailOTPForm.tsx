import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import OTPInput from './OTPInput';

interface EmailOTPFormProps {
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

const EmailOTPForm: React.FC<EmailOTPFormProps> = ({ onVerificationSuccess, onBackToLogin }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  const [step, setStep] = useState<'email' | 'verification'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(isArabic 
        ? 'يرجى إدخال عنوان البريد الإلكتروني'
        : 'Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(isArabic 
        ? 'يرجى إدخال عنوان بريد إلكتروني صالح'
        : 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call our custom edge function to send OTP
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co'}/functions/v1/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8'}`
        },
        body: JSON.stringify({
          action: 'send_otp',
          email
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP. If the issue persists, please contact support@drzone.ai');
      }
      
      setSuccess(isArabic 
        ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
        : 'Verification code sent to your email');
      setStep('verification');
      
      // Set resend cooldown
      setResendDisabled(true);
      setResendCountdown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send verification code. If the issue persists, please contact support@drzone.ai');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError(isArabic 
        ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام'
        : 'Please enter the 6-digit verification code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call our custom edge function to verify OTP
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co'}/functions/v1/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8'}`
        },
        body: JSON.stringify({
          action: 'verify_otp',
          email,
          otp
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Invalid or expired verification code');
      }
      
      // Set the session in Supabase
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }
      
      setSuccess(isArabic 
        ? 'تم التحقق بنجاح'
        : 'Verification successful');
      
      // Notify parent component
      onVerificationSuccess();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Failed to verify code. If the issue persists, please contact support@drzone.ai');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co'}/functions/v1/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8'}`
        },
        body: JSON.stringify({
          action: 'send_otp',
          email
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to resend verification code');
      }
      
      setSuccess(isArabic 
        ? 'تم إعادة إرسال رمز التحقق'
        : 'Verification code resent');
      
      // Set resend cooldown
      setResendDisabled(true);
      setResendCountdown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError(error.message || 'Failed to resend verification code. If the issue persists, please contact support@drzone.ai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 animate-fade-in">
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
          
          {success && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200 animate-fade-in">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                <div className="ml-3">
                  <p className="text-sm text-green-700" dir={isArabic ? 'rtl' : 'ltr'}>
                    {success}
                  </p>
                </div>
              </div>
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
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="doctor@example.com"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isArabic ? "جاري الإرسال..." : "Sending..."}
                </span>
              ) : (
                <span className="flex items-center">
                  {isArabic ? "إرسال رمز التحقق" : "Send Verification Code"}
                  <ArrowRight size={16} className="ml-2" />
                </span>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              {isArabic ? "العودة إلى صفحة تسجيل الدخول" : "Back to Login Page"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 animate-fade-in">
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
          
          {success && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200 animate-fade-in">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                <div className="ml-3">
                  <p className="text-sm text-green-700" dir={isArabic ? 'rtl' : 'ltr'}>
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              {isArabic ? "رمز التحقق" : "Verification Code"}
            </label>
            <div className="mt-1">
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                {isArabic 
                  ? `تم إرسال رمز التحقق إلى ${email}`
                  : `Verification code sent to ${email}`}
              </p>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isArabic ? "جاري التحقق..." : "Verifying..."}
                </span>
              ) : (
                <span className="flex items-center">
                  {isArabic ? "تحقق وتسجيل الدخول" : "Verify & Sign In"}
                  <ArrowRight size={16} className="ml-2" />
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              {isArabic ? "تغيير البريد الإلكتروني" : "Change Email"}
            </button>
            
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || resendDisabled}
              className="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400 transition-colors"
            >
              {resendDisabled 
                ? (isArabic 
                  ? `إعادة الإرسال (${resendCountdown})`
                  : `Resend (${resendCountdown})`) 
                : (isArabic 
                  ? "إعادة إرسال الرمز" 
                  : "Resend Code")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailOTPForm;
