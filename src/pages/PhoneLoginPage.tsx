import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, AlertCircle, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const PhoneLoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [manualMethodSelection, setManualMethodSelection] = useState(false);

  // Test phone numbers
  const TEST_PHONES = {
    '+967774168043': '123456',
    '+8613138607996': '123456'
  };

  // Determine verification method based on phone number
  React.useEffect(() => {
    if (!manualMethodSelection) {
      if (phoneNumber.startsWith('+86')) {
        // China numbers use SMS only
        setVerificationMethod('sms');
      } else if (phoneNumber.startsWith('+967') || 
                phoneNumber.startsWith('+966') || 
                phoneNumber.startsWith('+971') || 
                phoneNumber.startsWith('+974') || 
                phoneNumber.startsWith('+973') || 
                phoneNumber.startsWith('+968') || 
                phoneNumber.startsWith('+965') || 
                phoneNumber.startsWith('+962') || 
                phoneNumber.startsWith('+961')) {
        // MENA region numbers prefer WhatsApp
        setVerificationMethod('whatsapp');
      } else {
        // Default to SMS for other regions
        setVerificationMethod('sms');
      }
    }
  }, [phoneNumber, manualMethodSelection]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setErrorMessage(isArabic
        ? "يرجى إدخال رقم هاتف"
        : "Please enter a phone number");
      return;
    }
    
    // Basic phone validation
    const phoneRegex = /^\+[0-9]{8,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage(isArabic
        ? "يرجى إدخال رقم هاتف صالح مع رمز البلد (مثال: +967774168043)"
        : "Please enter a valid phone number with country code (e.g., +967774168043)");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // For test phone numbers, we'll simulate sending a code
      if (Object.keys(TEST_PHONES).includes(phoneNumber)) {
        console.log(`Test phone detected: ${phoneNumber}`);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStep('verification');
      } else {
        // For real phone numbers, use Supabase with the selected channel
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
          options: {
            channel: verificationMethod === 'whatsapp' ? 'whatsapp' : 'sms'
          }
        });
        
        if (error) throw error;
        
        setStep('verification');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setErrorMessage(isArabic
        ? "يرجى إدخال رمز التحقق"
        : "Please enter the verification code");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // For test phone numbers, check against our predefined codes
      if (Object.keys(TEST_PHONES).includes(phoneNumber)) {
        if (verificationCode === TEST_PHONES[phoneNumber]) {
          // For test accounts, sign in with OTP but don't actually verify
          const { error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
            options: {
              shouldCreateUser: true
            }
          });
          
          if (error) throw error;
          
          // Redirect to MyZone
          navigate('/myzone');
        } else {
          throw new Error(isArabic
            ? "رمز التحقق غير صحيح"
            : "Invalid verification code");
        }
      } else {
        // For real phone numbers, use Supabase with the selected channel
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: verificationCode,
          type: verificationMethod === 'whatsapp' ? 'whatsapp' : 'sms'
        });
        
        if (error) throw error;
        
        // Redirect to MyZone
        navigate('/myzone');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-configured test accounts
  const testAccounts = [
    { phone: '+967774168043', label: 'Yemen' },
    { phone: '+8613138607996', label: 'China' }
  ];

  return (
    <>
      <Helmet>
        <title>Phone Login | Dr.Zone AI</title>
        <meta name="description" content="Sign in to Dr.Zone AI using your phone number" />
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
                
                {/* Verification Method Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {isArabic ? "طريقة التحقق" : "Verification Method"}
                    </label>
                    <button 
                      type="button"
                      onClick={() => setManualMethodSelection(!manualMethodSelection)}
                      className="text-xs text-primary-600 hover:text-primary-500"
                    >
                      {manualMethodSelection 
                        ? (isArabic ? "تلقائي" : "Auto-detect") 
                        : (isArabic ? "اختيار يدوي" : "Manual selection")}
                    </button>
                  </div>
                  
                  {manualMethodSelection ? (
                    <div className="mt-2 flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="verificationMethod"
                          value="sms"
                          checked={verificationMethod === 'sms'}
                          onChange={() => setVerificationMethod('sms')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">SMS</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="verificationMethod"
                          value="whatsapp"
                          checked={verificationMethod === 'whatsapp'}
                          onChange={() => setVerificationMethod('whatsapp')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
                      </label>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center space-x-2 text-sm">
                      {verificationMethod === 'whatsapp' ? (
                        <>
                          <MessageSquare size={16} className="text-green-600" />
                          <span className="text-gray-700">
                            {isArabic 
                              ? "سيتم إرسال رمز التحقق عبر واتساب"
                              : "Verification code will be sent via WhatsApp"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Phone size={16} className="text-blue-600" />
                          <span className="text-gray-700">
                            {isArabic 
                              ? "سيتم إرسال رمز التحقق عبر رسالة نصية"
                              : "Verification code will be sent via SMS"}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {errorMessage && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700" dir={isArabic ? 'rtl' : 'ltr'}>
                          {errorMessage}
                        </p>
