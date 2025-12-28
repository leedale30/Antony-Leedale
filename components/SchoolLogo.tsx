
import React from 'react';

export const SchoolLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src="/logo.svg" 
      alt="School Logo" 
      className={`object-contain ${className}`} 
    />
  );
};
