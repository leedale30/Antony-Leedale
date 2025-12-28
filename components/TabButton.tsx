import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  const baseClasses = 'flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ease-out w-full group relative overflow-hidden';
  const activeClasses = 'bg-white/10 text-white shadow-lg border border-white/10';
  const inactiveClasses = 'text-gray-400 hover:bg-white/5 hover:text-white';

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-gem-blue rounded-r-full"></div>}
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-gem-blue-light' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-medium hidden md:inline text-sm tracking-wide">{label}</span>
    </button>
  );
};