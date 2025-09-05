import React from 'react';

interface KakaoLogoProps {
  className?: string;
  size?: number;
}

export const KakaoLogo: React.FC<KakaoLogoProps> = ({ 
  className = '', 
  size = 20 
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3C6.486 3 2 6.262 2 10.2c0 2.4 1.44 4.5 3.6 5.7L4.2 20.4c-.1.3.2.5.4.3l2.7-1.8c.6.1 1.2.1 1.8.1 5.514 0 10-3.262 10-7.2S17.514 3 12 3z"
        fill="#FEE500"
      />
      <path
        d="M8.4 8.4c-.3 0-.6.3-.6.6s.3.6.6.6h7.2c.3 0 .6-.3.6-.6s-.3-.6-.6-.6H8.4z"
        fill="#3C1E1E"
      />
      <path
        d="M8.4 11.4c-.3 0-.6.3-.6.6s.3.6.6.6h7.2c.3 0 .6-.3.6-.6s-.3-.6-.6-.6H8.4z"
        fill="#3C1E1E"
      />
    </svg>
  );
};

export default KakaoLogo;
