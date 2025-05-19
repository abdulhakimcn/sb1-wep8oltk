import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, AlertCircle, ArrowRight } from 'lucide-react';
import OTPInput from './OTPInput';
import { supabase } from '../lib/supabase';

interface EmailOTPFormProps {
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

const EmailOTPForm: React.FC<EmailOTPFormProps> = ({ onVerificationSuccess, onBackToLogin }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIs...';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError(isArabic ? 'يرجى إدخال عنوان البريد الإلكتروني' : 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(isArabic ? 'يرجى إدخال عنوان بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          action: 'send_otp',
          email
        })
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'Failed to send OTP');

      setSuccess(isArabic ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' : 'Verification code sent to your email');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError(isArabic ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          action: 'verify_otp',
          email,
          otp
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Invalid or expired verification code');

      if (data.session) await supabase.auth.setSession(data.session);

      setSuccess(isArabic ? 'تم التحقق بنجاح' : 'Verification successful');
      onVerificationSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700" dir={isArabic ? 'rtl' : 'ltr'}>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700" dir={isArabic ? 'rtl' : 'ltr'}>{success}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
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
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary-500 sm:text-sm"
                placeholder="doctor@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
            {!loading && <ArrowRight size={16} className="ml-2" />}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            {isArabic ? 'العودة إلى صفحة تسجيل الدخول' : 'Back to Login Page'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700" dir={isArabic ? 'rtl' : 'ltr'}>{error}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              {isArabic ? "رمز التحقق" : "Verification Code"}
            </label>
            <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
            <p className="text-xs text-gray-500 mt-1">
              {isArabic ? `تم إرسال الرمز إلى ${email}` : `Code sent to ${email}`}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
            {!loading && <ArrowRight size={16} className="ml-2" />}
          </button>

          <div className="flex justify-between text-sm text-primary-600 mt-2">
            <button type="button" onClick={() => setStep('email')}>
              {isArabic ? "تغيير البريد الإلكتروني" : "Change Email"}
            </button>
            <button type="button" onClick={handleSendOTP} disabled={loading}>
              {isArabic ? "إعادة إرسال الرمز" : "Resend Code"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailOTPForm;
