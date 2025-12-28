
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiAI } from '../services/geminiService';
import { IconChat, IconSend, IconSparkles } from './Icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const GlobalChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const ai = getGeminiAI();

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || !ai || isLoading) return;

    const textToSend = input;
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `System: You are a concise, helpful teaching assistant embedded in the SUIS Smart Hub dashboard. Answer efficiently.
            
            User: ${textToSend}`,
        });

        const reply = response.text || "I'm having trouble connecting right now.";
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={`fixed z-[100] flex flex-col items-end pointer-events-none transition-all duration-300 ${isOpen ? 'inset-0 bg-black/50 md:bg-transparent md:bottom-6 md:right-6' : 'bottom-6 right-6'}`}>
       {/* Chat Window */}
       {isOpen && (
         <div className="w-full h-full md:w-96 md:h-[500px] glass-panel md:rounded-2xl flex flex-col overflow-hidden animate-fade-in border-0 md:border border-white/20 shadow-2xl pointer-events-auto bg-black/90 md:bg-black/80 backdrop-blur-xl md:mb-20">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors" onClick={toggleOpen}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gem-blue/20 rounded-lg text-gem-blue">
                        <IconSparkles />
                    </div>
                    <span className="font-bold text-white text-sm">Quick Assist</span>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center p-4">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <IconChat />
                        </div>
                        <p>How can I help you quickly?</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-gem-blue/20 text-white rounded-br-none border border-gem-blue/30' : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/20 pb-safe md:pb-3">
                <div className="flex gap-2 relative">
                    <input 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gem-blue outline-none pr-10 transition-colors placeholder-gray-500"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask anything..."
                        autoFocus
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gem-blue hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-700"
                    >
                        <IconSend />
                    </button>
                </div>
            </div>
         </div>
       )}

       {/* Toggle Button */}
       <button 
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full glass-panel border border-white/20 flex items-center justify-center text-white shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:scale-110 transition-all duration-300 pointer-events-auto z-[101] ${isOpen ? 'hidden md:flex bg-gem-blue border-gem-blue' : 'flex bg-black/40 hover:bg-gem-blue/20'}`}
       >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0' : 'scale-100'}`}>
            <IconChat />
          </div>
          <div className={`absolute transition-transform duration-300 ${isOpen ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}>
            ✕
          </div>
       </button>
    </div>
  );
};
