import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Test phone numbers
  const TEST_PHONES = {
    '+967774168043': '123456',
    '+8613138607996': '123456'
  };

  // Basic phone validation
  const validatePhone = (phone: string): boolean => {
    // Allow empty for initial state
    if (!phone) return true;
    
    // Basic international phone format validation
    const phoneRegex = /^\+[0-9]{8,15}$/;
    return phoneRegex.test(phone);
  };

  // Send verification code
  const sendVerificationCode = async (): Promise<boolean> => {
    if (!phoneNumber || !validatePhone(phoneNumber)) {
      setIsValid(false);
      setErrorMessage('Please enter a valid phone number with country code (e.g., +967774168043)');
      return false;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // For test phone numbers, we'll simulate sending a code
      if (Object.keys(TEST_PHONES).includes(phoneNumber)) {
        console.log(`Test phone detected: ${phoneNumber}`);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCodeSent(true);
        return true;
      } else {
        // For real phone numbers, use Supabase
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber
        });
        
        if (error) throw error;
        
        setCodeSent(true);
        return true;
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrorMessage(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify code and sign in
  const verifyCode = async (): Promise<boolean> => {
    if (!verificationCode) {
      setErrorMessage('Please enter the verification code');
      return false;
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
          
          return true;
        } else {
          throw new Error('Invalid verification code');
        }
      } else {
        // For real phone numbers, use Supabase
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: verificationCode,
          type: 'sms'
        });
        
        if (error) throw error;
        
        return true;
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phoneNumber,
    setPhoneNumber,
    verificationCode,
    setVerificationCode,
    isValid,
    errorMessage,
    isLoading,
    codeSent,
    sendVerificationCode,
    verifyCode
  };
}