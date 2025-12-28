
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  // Mobile: Just standard left align with text since it's a drawer now
  const baseClasses = 'flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-out w-full group relative overflow-hidden text-sm';
  const activeClasses = 'bg-white/10 text-white shadow-[0_0_20px_rgba(56,189,248,0.15)] border border-white/10';
  const inactiveClasses = 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent';

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} title={label}>
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gem-blue to-gem-purple shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
      )}
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-gem-blue-light drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'group-hover:scale-110 group-hover:text-gray-300'}`}>
        {icon}
      </div>
      <span className="font-medium tracking-wide truncate">{label}</span>
    </button>
  );
};
