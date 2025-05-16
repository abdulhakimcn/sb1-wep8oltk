import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`inline-flex items-center ${className}`} title="Verified Medical Professional">
      <BadgeCheck className={`${sizeClasses[size]} text-primary-500`} />
    </div>
  );
};

export default VerificationBadge;