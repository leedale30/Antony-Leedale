import React from 'react';

export const LionPath = () => (
    <path d="M25,25 Q35,20 35,35 Q35,45 25,55 Q20,60 30,65 L25,80 Q15,70 15,55 Q15,30 25,25 M20,30 L15,25 M35,35 L40,30" />
);

export const DragonPath = () => (
    <path d="M75,25 Q65,20 65,35 Q65,45 75,55 Q80,60 70,65 L75,80 Q85,70 85,55 Q85,30 75,25 M80,30 L85,25 M65,35 L60,30" />
);

export const SchoolLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer Ring */}
      <circle cx="100" cy="100" r="95" fill="white" stroke="#003399" strokeWidth="6" />
      <circle cx="100" cy="100" r="82" fill="none" stroke="#003399" strokeWidth="2" opacity="0.5" />
      
      {/* Stars Ring (Top) */}
      {[...Array(5)].map((_, i) => {
          const angle = (i - 2) * 22 * (Math.PI / 180) - Math.PI / 2;
          const r = 88;
          const x = 100 + r * Math.cos(angle);
          const y = 100 + r * Math.sin(angle);
          return (
             <path key={`star-top-${i}`} transform={`translate(${x}, ${y}) scale(1.2)`} fill="#003399" d="M0,-3 L0.9,-0.9 H3 L1.3,0.4 L2,2.5 L0,1.2 L-2,2.5 L-1.3,0.4 L-3,-0.9 H-0.9 Z" />
          );
      })}
      
      {/* Stars Ring (Sides) */}
      {[...Array(6)].map((_, i) => {
           const side = i < 3 ? -1 : 1;
           const offset = i % 3;
           const angle = (side * Math.PI/2) + ((offset - 1) * 0.3);
           const r = 88;
           const x = 100 + r * Math.cos(angle);
           const y = 100 + r * Math.sin(angle);
           return (
              <path key={`star-side-${i}`} transform={`translate(${x}, ${y}) scale(1.2)`} fill="#003399" d="M0,-3 L0.9,-0.9 H3 L1.3,0.4 L2,2.5 L0,1.2 L-2,2.5 L-1.3,0.4 L-3,-0.9 H-0.9 Z" />
           );
      })}

      {/* Shield Container */}
      <g transform="translate(50, 45) scale(1)">
        {/* Shield Outline */}
        <path d="M50,5 L90,5 L90,45 Q90,95 50,105 Q10,95 10,45 L10,5 L50,5 Z" fill="#E6E7E8" stroke="#003399" strokeWidth="4" />
        
        {/* Shield Split - Right Side (Blue) */}
        <path d="M50,5 L90,5 L90,45 Q90,95 50,105 V5 Z" fill="#003399" />
        
        {/* Abstract Lion (Left - Blue on Silver) */}
        <g stroke="#003399" strokeWidth="3" strokeLinecap="round" fill="none">
            <LionPath />
        </g>
        
        {/* Abstract Dragon (Right - Silver on Blue) */}
        <g stroke="#E6E7E8" strokeWidth="3" strokeLinecap="round" fill="none">
            <DragonPath />
        </g>
      </g>
    </svg>
  );
};