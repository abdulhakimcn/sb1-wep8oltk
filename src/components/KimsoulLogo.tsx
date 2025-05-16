import React from 'react';

interface KimsoulLogoProps {
  size?: number;
  className?: string;
}

const KimsoulLogo: React.FC<KimsoulLogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Brain background */}
        <circle cx="50" cy="50" r="45" fill="#EBF4FF" />
        
        {/* Brain outline */}
        <path 
          d="M75.5,50c0,14.1-11.4,25.5-25.5,25.5S24.5,64.1,24.5,50S35.9,24.5,50,24.5S75.5,35.9,75.5,50z" 
          fill="#FFFFFF" 
          stroke="#6366F1" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Brain details */}
        <path 
          d="M65,40c0-5.5-4.5-10-10-10s-10,4.5-10,10c0,0.2,0,0.4,0,0.6C44.7,40.2,44.4,40,44,40c-2.2,0-4,1.8-4,4
          c0,1.2,0.5,2.3,1.4,3C41,47.6,40.7,48.3,40.7,49c0,1.1,0.4,2.1,1.1,2.9C41.3,52.5,41,53.2,41,54c0,2.2,1.8,4,4,4
          c0.7,0,1.4-0.2,2-0.5c0.6,0.3,1.3,0.5,2,0.5c2.2,0,4-1.8,4-4c0-0.7-0.2-1.4-0.5-2c0.3-0.6,0.5-1.3,0.5-2c0-2.2-1.8-4-4-4
          c-0.7,0-1.4,0.2-2,0.5c-0.6-0.3-1.3-0.5-2-0.5c-0.2,0-0.4,0-0.6,0.1c0-0.2,0.1-0.4,0.1-0.6c0-2.2-1.8-4-4-4c-0.7,0-1.4,0.2-2,0.5
          c-0.6-0.3-1.3-0.5-2-0.5c-2.2,0-4,1.8-4,4c0,0.7,0.2,1.4,0.5,2c-0.3,0.6-0.5,1.3-0.5,2c0,2.2,1.8,4,4,4c0.7,0,1.4-0.2,2-0.5
          c0.6,0.3,1.3,0.5,2,0.5c0.2,0,0.4,0,0.6-0.1c0,0.2-0.1,0.4-0.1,0.6c0,2.2,1.8,4,4,4c0.7,0,1.4-0.2,2-0.5c0.6,0.3,1.3,0.5,2,0.5
          c2.2,0,4-1.8,4-4c0-0.7-0.2-1.4-0.5-2c0.3-0.6,0.5-1.3,0.5-2c0-0.7-0.2-1.4-0.5-2c0.3-0.6,0.5-1.3,0.5-2c0-2.2-1.8-4-4-4
          c-0.7,0-1.4,0.2-2,0.5c-0.6-0.3-1.3-0.5-2-0.5c-0.2,0-0.4,0-0.6,0.1C64.9,40.4,65,40.2,65,40z"
          fill="#FFFFFF"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* H letter for HakeemZone */}
        <path 
          d="M38,45v10 M38,50h7 M45,45v10" 
          stroke="#4F46E5" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Pulse line */}
        <path 
          d="M50,65h-5l5-20l5,10l5-5h5" 
          stroke="#4F46E5" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Glow effect */}
        <circle cx="50" cy="50" r="35" fill="url(#glow)" />
        
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default KimsoulLogo;