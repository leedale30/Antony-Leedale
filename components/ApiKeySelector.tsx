import React, { useState, useEffect } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasKey(keyStatus);
        if(keyStatus) {
            onKeySelected();
        }
      }
      setIsChecking(false);
    };
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasKey(true);
        onKeySelected();
      } catch (error) {
        console.error("Error opening API key selection:", error);
      }
    }
  };

  if (isChecking) {
    return <p className="text-center text-gray-400">Checking credentials...</p>;
  }

  if (hasKey) {
    return null; 
  }

  return (
    <div className="glass-panel p-8 rounded-2xl border border-gem-blue/50 text-center animate-fade-in max-w-lg mx-auto">
      <div className="mb-4 text-4xl">🔑</div>
      <h3 className="text-2xl font-bold text-white mb-2">Veo Creator Access</h3>
      <p className="text-gray-300 mb-6">
        Video generation requires a specific paid API key. Please select your project key to continue.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        Billing info: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-gem-blue-light hover:underline">ai.google.dev/gemini-api/docs/billing</a>
      </p>
      <button
        onClick={handleSelectKey}
        className="bg-gem-blue hover:bg-white hover:text-gem-blue text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg shadow-gem-blue/20"
      >
        Select API Key
      </button>
    </div>
  );
};