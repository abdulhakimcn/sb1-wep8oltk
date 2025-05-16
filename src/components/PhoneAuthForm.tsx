import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface PhoneAuthFormProps {
  onBackToEmail: () => void;
  accountType?: 'doctor' | 'organization';
}

const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({ onBackToEmail, accountType = 'doctor' }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'whatsapp'>('sms');
  
  // Organization-specific fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgCountry, setOrgCountry] = useState('');

  // Test phone numbers
  const TEST_PHONES = {
    '+967774168043': '123456',
    '+8613138607996': '123456'
  };

  // Determine verification method based on phone number
  useEffect(() => {
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
  }, [phoneNumber]);

  // Basic phone validation
  const validatePhone = (phone: string): boolean => {
    // Allow empty for initial state
    if (!phone) return true;
    
    // Basic international phone format validation
    const phoneRegex = /^\+[0-9]{8,15}$/;
    return phoneRegex.test(phone);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setErrorMessage(isArabic
        ? "يرجى إدخال رقم هاتف"
        : "Please enter a phone number");
      return;
    }
    
    if (!validatePhone(phoneNumber)) {
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
        // For real phone numbers, use Supabase
        // Determine which channel to use based on the verification method
        const channel = verificationMethod === 'whatsapp' ? 'whatsapp' : 'sms';
        
        // In a real implementation, this would call the phone-auth-handler edge function
        // For now, we'll use Supabase's built-in OTP functionality
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
          options: {
            channel: 'sms' // Supabase only supports SMS currently
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
    
    // For organization accounts, validate additional fields
    if (accountType === 'organization' && step === 'verification') {
      if (!orgName || !orgType || !orgCountry) {
        setErrorMessage(isArabic
          ? "يرجى ملء جميع حقول المؤسسة المطلوبة"
          : "Please fill in all required organization fields");
        return;
      }
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // For test phone numbers, check against our pre
