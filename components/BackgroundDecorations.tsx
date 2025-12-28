import React from 'react';
import { LionPath, DragonPath } from './SchoolLogo';

export const BackgroundDecorations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
        {/* Left Side Lion */}
        <div className="absolute top-1/4 -left-20 opacity-[0.03] text-white w-96 h-96 animate-float" style={{ animationDelay: '0s' }}>
             <svg viewBox="0 0 100 100" className="w-full h-full">
                 <g transform="translate(0, 0) scale(1.5)">
                    <g stroke="currentColor" strokeWidth="1" fill="none">
                        <LionPath />
                    </g>
                 </g>
             </svg>
        </div>

        {/* Right Side Dragon */}
        <div className="absolute bottom-1/4 -right-20 opacity-[0.03] text-white w-96 h-96 animate-float" style={{ animationDelay: '2s' }}>
             <svg viewBox="0 0 100 100" className="w-full h-full">
                 <g transform="translate(-50, 0) scale(1.5)">
                    <g stroke="currentColor" strokeWidth="1" fill="none">
                        <DragonPath />
                    </g>
                 </g>
             </svg>
        </div>
        
        {/* Center Top Shield Outline (Very Subtle) */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-[0.02] text-white w-[500px] h-[500px]">
            <svg viewBox="0 0 100 120" className="w-full h-full">
                 <path d="M50,5 L90,5 L90,45 Q90,95 50,105 Q10,95 10,45 L10,5 L50,5 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
        </div>
    </div>
  );
};