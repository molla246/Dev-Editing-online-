import React from 'react';

export const GoogleKeyLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
      }}
      title="Google Password Manager"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue Key Bow / Ring */}
        <circle
          cx="16"
          cy="24"
          r="9"
          stroke="#4285F4"
          strokeWidth="4.5"
          fill="none"
        />
        {/* Yellow Shaft */}
        <path
          d="M23 24H42"
          stroke="#FBBC05"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Green Tooth */}
        <path
          d="M34 24V31"
          stroke="#34A853"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Red Tooth */}
        <path
          d="M40 24V29"
          stroke="#EA4335"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
