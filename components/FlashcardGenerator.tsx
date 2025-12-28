import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';

interface Flashcard {
    front: string;
    back: string;
}

export const FlashcardGenerator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Flashcard Generator",
            subtitle: "Turn any topic into an interactive study deck.",
            labelTopic: "Topic or Content",
            phTopic: "e.g. The Water Cycle, French Verbs, Atomic Theory",
            btnGenerate: "Generate Deck",
            btnGenerating: "Creating Cards...",
            count: "Cards",
            flip: "Click card to flip"
        },
        zh: {
            title: "闪卡生成器",
            subtitle: "将任何主题转化为互动学习卡片。",
            labelTopic: "主题或内容",
            phTopic: "例如：水循环，法语动词，原子理论",
            btnGenerate: "生成卡片组",
            btnGenerating: "正在创建卡片...",
            count: "张卡片",
            flip: "点击翻转"
        }
    }[lang];

    const handleGenerate = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);

        try {
            const prompt = `Create 8-12 study flashcards for the topic: "${topic}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Provide a clear term/question on the front, and a concise definition/answer on the back.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                front: { type: Type.STRING },
                                back: { type: Type.STRING }
                            },
                            required: ["front", "back"]
                        }
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                if (Array.isArray(data)) {
                    setCards(data);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, lang]);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10 flex gap-4">
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t.phTopic}
                    className="flex-1 bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-gem-purple outline-none"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !topic}
                    className="bg-gem-purple text-white font-bold px-8 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {cards.length > 0 && (
                <div className="flex flex-col items-center">
                    <div className="perspective-1000 w-full max-w-xl h-80 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className="absolute w-full h-full glass-panel rounded-3xl flex flex-col items-center justify-center p-8 border border-gem-blue/30 backface-hidden bg-gradient-to-br from-gem-slate to-black">
                                <span className="text-xs text-gem-blue-light uppercase tracking-widest font-bold mb-4">Front</span>
                                <p className="text-2xl md:text-3xl text-center font-bold text-white">{cards[currentIndex].front}</p>
                                <p className="absolute bottom-4 text-xs text-gray-500">{t.flip}</p>
                            </div>
                            {/* Back */}
                            <div className="absolute w-full h-full glass-panel rounded-3xl flex flex-col items-center justify-center p-8 border border-gem-purple/30 backface-hidden rotate-y-180 bg-gradient-to-bl from-gem-slate to-black">
                                <span className="text-xs text-gem-purple uppercase tracking-widest font-bold mb-4">Back</span>
                                <p className="text-xl md:text-2xl text-center font-medium text-white">{cards[currentIndex].back}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8 mt-8">
                        <button onClick={handlePrev} className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-sm font-mono text-gray-400">{currentIndex + 1} / {cards.length}</span>
                        <button onClick={handleNext} className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};