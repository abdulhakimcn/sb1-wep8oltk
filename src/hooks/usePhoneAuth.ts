import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [manualMethodSelection, setManualMethodSelection] = useState(false);

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

  // Auto-detect verification method based on phone number
  const autoDetectVerificationMethod = (phone: string): 'sms' | 'whatsapp' => {
    if (phone.startsWith('+86')) {
      // China numbers use SMS only
      return 'sms';
    } else if (phone.startsWith('+967') || 
              phone.startsWith('+966') || 
              phone.startsWith('+971') || 
              phone.startsWith('+974') || 
              phone.startsWith('+973') || 
              phone.startsWith('+968') || 
              phone.startsWith('+965') || 
              phone.startsWith('+962') || 
              phone.startsWith('+961')) {
      // MENA region numbers prefer WhatsApp
      return 'whatsapp';
    } else {
      // Default to WhatsApp for other regions (changed from SMS to prioritize WhatsApp)
      return 'whatsapp';
    }
  };

  // Send verification code
  const sendVerificationCode = async (method?: 'sms' | 'whatsapp'): Promise<boolean> => {
    if (!phoneNumber || !validatePhone(phoneNumber)) {
      setIsValid(false);
      setErrorMessage('Please enter a valid phone number with country code (e.g., +967774168043)');
      return false;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    // If method is provided, use it; otherwise use the current state
    const verMethod = method || verificationMethod;
    
    try {
      // For test phone numbers, we'll simulate sending a code
      if (Object.keys(TEST_PHONES).includes(phoneNumber)) {
        console.log(`Test phone detected: ${phoneNumber}`);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCodeSent(true);
        setVerificationMethod(verMethod);
        return true;
      } else {
        // For real phone numbers, use the appropriate channel
        if (verMethod === 'whatsapp') {
          try {
            // Call our WhatsApp verification edge function
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co'}/functions/v1/whatsapp-verification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8'}`
              },
              body: JSON.stringify({
                phone: phoneNumber,
                action: 'send'
              })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to send WhatsApp verification');
            
            setCodeSent(true);
            setVerificationMethod('whatsapp');
            return true;
          } catch (whatsappError) {
            console.error('WhatsApp verification failed, falling back to SMS:', whatsappError);
            // Fall back to SMS if WhatsApp fails
            const { error } = await supabase.auth.signInWithOtp({
              phone: phoneNumber,
              options: {
                channel: 'sms'
              }
            });
            
            if (error) throw error;
            
            setCodeSent(true);
            setVerificationMethod('sms');
            return true;
          }
        } else {
          // Use standard SMS OTP
          const { error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
            options: {
              channel: 'sms'
            }
          });
          
          if (error) throw error;
          
          setCodeSent(true);
          setVerificationMethod('sms');
          return true;
        }
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
        // For real phone numbers, use the appropriate verification method
        if (verificationMethod === 'whatsapp') {
          try {
            // Call our WhatsApp verification edge function
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ehvdxtyoctgkrgrabfij.supabase.co'}/functions/v1/whatsapp-verification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodmR4dHlvY3Rna3JncmFiZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTkyNTgsImV4cCI6MjA2MjQ5NTI1OH0.2-dNzfXFO0AKpcWmRQM0svOBCQQ7SBTH5U7ABMYifq8'}`
              },
              body: JSON.stringify({
                phone: phoneNumber,
                code: verificationCode,
                action: 'verify'
              })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to verify WhatsApp code');
            
            // Try to sign in the user
            try {
              await supabase.auth.signInWithPassword({
                phone: phoneNumber,
                password: verificationCode
              });
            } catch (signInError) {
              // If sign in fails, try OTP sign in as fallback
              await supabase.auth.signInWithOtp({
                phone: phoneNumber,
                options: { shouldCreateUser: true }
              });
            }
            
            return true;
          } catch (whatsappError) {
            console.error('WhatsApp verification failed, falling back to SMS:', whatsappError);
            // Fall back to standard SMS verification
            const { error } = await supabase.auth.verifyOtp({
              phone: phoneNumber,
              token: verificationCode,
              type: 'sms'
            });
            
            if (error) throw error;
            
            return true;
          }
        } else {
          // Use standard SMS OTP verification
          const { error } = await supabase.auth.verifyOtp({
            phone: phoneNumber,
            token: verificationCode,
            type: 'sms'
          });
          
          if (error) throw error;
          
          return true;
        }
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
    verificationMethod,
    setVerificationMethod,
    manualMethodSelection,
    setManualMethodSelection,
    autoDetectVerificationMethod,
    sendVerificationCode,
    verifyCode
  };
}
