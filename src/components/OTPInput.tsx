import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(value.split('').slice(0, length).concat(Array(length - value.length).fill('')));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeInput, setActiveInput] = useState(0);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update OTP state when value prop changes
  useEffect(() => {
    setOtp(value.split('').slice(0, length).concat(Array(length - value.length).fill('')));
  }, [value, length]);

  // Focus on first empty input or the first input when component mounts
  useEffect(() => {
    const firstEmptyIndex = otp.findIndex(val => !val);
    const indexToFocus = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
    
    // Only focus if the component is not disabled
    if (!disabled && inputRefs.current[indexToFocus]) {
      setTimeout(() => {
        inputRefs.current[indexToFocus]?.focus();
      }, 100);
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value;
    
    // Only accept numbers
    if (!/^\d*$/.test(newValue)) return;
    
    // Handle paste or multiple characters
    if (newValue.length > 1) {
      const newOtp = [...otp];
      
      // Distribute the pasted characters across inputs
      for (let i = 0; i < newValue.length && index + i < length; i++) {
        newOtp[index + i] = newValue[i];
      }
      
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + newValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setActiveInput(nextIndex);
    } else {
      // Handle single character input
      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Auto-focus next input if this one is filled
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveInput(index + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move focus to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
      
      // Also clear the previous input
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
    }
    
    // Move focus with arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only accept numbers
    if (!/^\d*$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    
    // Distribute the pasted characters across inputs
    for (let i = 0; i < pastedData.length && index + i < length; i++) {
      newOtp[index + i] = pastedData[i];
    }
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
      setActiveInput(nextEmptyIndex);
    } else {
      inputRefs.current[length - 1]?.focus();
      setActiveInput(length - 1);
    }
  };

  const handleFocus = (index: number) => {
    setActiveInput(index);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center space-x-2">
        {Array.from({ length }, (_, index) => (
          <div key={index} className="relative">
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index] || ''}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={e => handlePaste(e, index)}
              onFocus={() => handleFocus(index)}
              disabled={disabled}
              className={`h-12 w-12 rounded-md border text-center text-xl shadow-sm focus:outline-none transition-all duration-200 ${
                activeInput === index 
                  ? 'border-primary-500 ring-2 ring-primary-200' 
                  : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 opacity-50' : 'bg-white'}`}
              aria-label={`Digit ${index + 1}`}
            />
            {index < length - 1 && index % 3 === 2 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-gray-400">-</div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500 text-center">
        {t('auth.otpHelp', 'Enter the 6-digit code sent to your email')}
      </p>
    </div>
  );
};

export default OTPInput;
