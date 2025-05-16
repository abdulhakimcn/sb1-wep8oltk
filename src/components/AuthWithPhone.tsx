import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { usePhoneAuth } from '../hooks/usePhoneAuth';
import { useTranslation } from 'react-i18next';

const AuthWithPhone: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  
  const {
    phoneNumber,
    setPhoneNumber,
    verificationCode,
    setVerificationCode,
    errorMessage,
    isLoading,
    sendVerificationCode,
    verifyCode
  } = usePhoneAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendVerificationCode();
    if (success) {
      setStep('verification');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyCode();
    if (success) {
      navigate('/myzone');
    }
  };

  // Pre-configured test accounts
  const testAccounts = [
    { phone: '+967774168043', label: 'Yemen' },
    { phone: '+8613138607996', label: 'China' }
  ];

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
            {isArabic ? "تسجيل الدخول برقم الهاتف" : "Sign in with Phone"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isArabic ? 
              "طريقة سريعة وآمنة للوصول إلى حسابك" : 
              "A quick and secure way to access your account"}
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+967774168043"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {isArabic 
                      ? "أدخل رقم هاتفك مع رمز البلد (مثال: +967774168043)"
                      : "Enter your phone number with country code (e.g., +967774168043)"}
                  </p>
                </div>
              </div>
              
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
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading ? (
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
              
              {/* Pre-configured test accounts */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  {isArabic ? "حسابات اختبار جاهزة" : "Ready-to-use Test Accounts"}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {testAccounts.map((account) => (
                    <div key={account.phone} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div>
                        <span>{account.phone}</span>
                        <span className="ml-2 text-xs text-gray-500">({account.label})</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setPhoneNumber(account.phone)}
                        className="text-xs text-primary-600 hover:text-primary-500"
                      >
                        {isArabic ? "استخدم" : "Use"}
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    {isArabic 
                      ? "ملاحظة: رمز التحقق لحسابات الاختبار هو دائمًا 123456"
                      : "Note: Verification code for test accounts is always 123456"}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {isArabic ? "العودة إلى صفحة تسجيل الدخول" : "Back to Login Page"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  {isArabic ? "رمز التحقق" : "Verification Code"}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="code"
                    name="code"
                    type={showVerificationCode ? "text" : "password"}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerificationCode(!showVerificationCode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showVerificationCode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    {isArabic 
                      ? `تم إرسال رمز التحقق إلى ${phoneNumber}`
                      : `Verification code sent to ${phoneNumber}`}
                  </p>
                </div>
              </div>
              
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
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !verificationCode}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isLoading ? (
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
                  onClick={() => setStep('phone')}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {isArabic ? "تغيير رقم الهاتف" : "Change Phone Number"}
                </button>
                
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {isArabic ? "إعادة إرسال الرمز" : "Resend Code"}
                </button>
              </div>
              
              {/* For test accounts, show the verification code */}
              {(phoneNumber === '+967774168043' || phoneNumber === '+8613138607996') && (
                <div className="mt-4 p-2 bg-blue-50 rounded-md text-center">
                  <p className="text-sm text-blue-700">
                    {isArabic ? "رمز التحقق لحساب الاختبار:" : "Test account verification code:"} <strong>123456</strong>
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthWithPhone;