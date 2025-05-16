import { useState, useEffect } from 'react';
import { isValidEmailDomain } from '../lib/supabase';

export function useEmailValidation() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!email) {
      setIsValid(true);
      setErrorMessage(null);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsValid(false);
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Check if domain is allowed
    setIsChecking(true);
    
    // Use the client-side validation first for immediate feedback
    const isAllowed = isValidEmailDomain(email);
    setIsValid(isAllowed);
    setErrorMessage(isAllowed ? null : 'This email domain is not supported');
    
    // Then verify with the server for more comprehensive checks
    const validateWithServer = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-domain-validator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setIsValid(data.isAllowed);
          setErrorMessage(data.isAllowed ? null : 'This email domain is not supported');
        } else {
          console.error('Error validating email:', data.error);
        }
      } catch (error) {
        console.error('Error calling email validation function:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Only call the server validation if needed
    if (!isAllowed) {
      validateWithServer();
    } else {
      setIsChecking(false);
    }
  }, [email]);

  return { email, setEmail, isValid, errorMessage, isChecking };
}