import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconCoffee, IconGame, IconHeart } from './Icons';

type StaffTab = 'relax' | 'trivia' | 'vibe' | 'arcade';

export const StaffRoom: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<StaffTab>('arcade');

    const t = {
        en: {
            title: "Teachers' Lounge",
            subtitle: "A digital sanctuary for recharging and destressing.",
            tabs: { relax: "Bubble Pop", trivia: "Coffee Break Trivia", vibe: "Vibe Check", arcade: "Arcade" }
        },
        zh: {
            title: "教师休息室",
            subtitle: "充电和减压的数字避风港。",
            tabs: { relax: "气泡膜", trivia: "茶歇问答", vibe: "氛围调节", arcade: "游乐场" }
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-amber-500"><IconCoffee /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
                    {(Object.keys(t.tabs) as StaffTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.tabs[tab]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-6 border border-amber-500/20 bg-black/40 relative overflow-hidden flex flex-col">
                {activeTab === 'relax' && <BubblePop />}
                {activeTab === 'trivia' && <BreakTrivia lang={lang} />}
                {activeTab === 'vibe' && <VibeCheck lang={lang} />}
                {activeTab === 'arcade' && <ArcadeCabinet lang={lang} />}
            </div>
        </div>
    );
};

const ArcadeCabinet: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeGame, setActiveGame] = useState<string | null>(null);

    const games = [
        { 
            id: 'slingshot', 
            title: 'Gemini Slingshot', 
            url: 'https://aistudio.google.com/apps/bundled/gemini_slingshot?showPreview=true&showAssistant=true', 
            icon: '🚀', 
            desc: lang === 'zh' ? '物理益智游戏' : 'Physics Puzzle Fun' 
        },
        { 
            id: 'runner', 
            title: 'Gemini Runner', 
            url: 'https://aistudio.google.com/apps/bundled/gemini_runner?showPreview=true&showAssistant=true', 
            icon: '🏃', 
            desc: lang === 'zh' ? '无尽跑酷' : 'Endless Runner' 
        },
        { 
            id: 'tempo', 
            title: 'Tempo Strike', 
            url: 'https://aistudio.google.com/apps/bundled/tempo_strike?showPreview=true&showAssistant=true', 
            icon: '🥁', 
            desc: lang === 'zh' ? '节奏打击' : 'Rhythm Action' 
        }
    ];

    if (activeGame) {
        const game = games.find(g => g.id === activeGame);
        return (
            <div className="w-full h-full flex flex-col animate-fade-in">
                <button 
                    onClick={() => setActiveGame(null)} 
                    className="mb-4 text-sm text-amber-400 hover:text-white flex items-center gap-2 self-start font-bold uppercase tracking-wider"
                >
                    <span>←</span> {lang === 'zh' ? '返回游乐场' : 'Back to Arcade'}
                </button>
                <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-black relative shadow-2xl">
                     <iframe 
                        src={game?.url} 
                        className="w-full h-full border-0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera" 
                        allowFullScreen 
                        loading="lazy"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full content-center animate-fade-in">
            {games.map(game => (
                <button 
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/50 hover:bg-white/5 transition-all group flex flex-col items-center justify-center gap-6 h-80 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-lg filter">{game.icon}</div>
                    
                    <div className="text-center z-10">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{game.title}</h3>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300">{game.desc}</p>
                    </div>
                    
                    <div className="mt-2 px-6 py-2 bg-amber-600 text-white font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg z-10">
                        {lang === 'zh' ? '开始游戏' : 'Play Now'}
                    </div>
                </button>
            ))}
        </div>
    );
};

const BubblePop: React.FC = () => {
    // Generate a grid of bubbles
    const [bubbles, setBubbles] = useState(Array(64).fill(false));

    const popBubble = (index: number) => {
        if (!bubbles[index]) {
            const newBubbles = [...bubbles];
            newBubbles[index] = true;
            setBubbles(newBubbles);
            // Optional: Simple visual feedback logic is handled by CSS classes
        }
    };

    const reset = () => setBubbles(Array(64).fill(false));

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="grid grid-cols-8 gap-3 mb-8 p-4 bg-orange-900/20 rounded-2xl border border-orange-500/30">
                {bubbles.map((popped, i) => (
                    <button
                        key={i}
                        onClick={() => popBubble(i)}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200 shadow-inner flex items-center justify-center
                        ${popped 
                            ? 'bg-orange-900/40 scale-90 border border-orange-900/50 shadow-none' 
                            : 'bg-gradient-to-br from-orange-400 to-orange-600 scale-100 hover:scale-105 border-b-4 border-r-4 border-orange-800 active:border-0 active:translate-y-1 active:translate-x-1 cursor-pointer'
                        }`}
                    >
                       {popped && <span className="text-white/20 text-xs">Pop!</span>}
                    </button>
                ))}
            </div>
            <button onClick={reset} className="text-orange-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                Refresh Sheet
            </button>
        </div>
    );
};

interface Question {
    question: string;
    options: string[];
    answer: string;
}

const BreakTrivia: React.FC<{ lang: Language }> = ({ lang }) => {
    const [category, setCategory] = useState('Pop Culture');
    const [quiz, setQuiz] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            btn: "Generate Quiz",
            loading: "Brewing questions...",
            cats: ["Pop Culture", "80s Music", "World Travel", "Food & Drink", "Movies"],
            next: "Next Question",
            reveal: "Reveal Answer"
        },
        zh: {
            btn: "生成测验",
            loading: "正在酝酿问题...",
            cats: ["流行文化", "80年代音乐", "环球旅行", "美食与美酒", "电影"],
            next: "下一题",
            reveal: "显示答案"
        }
    }[lang];

    const generateQuiz = useCallback(async () => {
        if (!ai) return;
        setLoading(true);
        setQuiz([]);
        setCurrentQ(0);
        setShowAnswer(false);

        try {
            const prompt = `Generate 5 fun trivia questions about "${category}" for adults taking a break.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format: JSON Array of objects { "question": string, "options": [string, string, string, string], "answer": string }.
            Keep it lighthearted.`;

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
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                answer: { type: Type.STRING }
                            },
                            required: ["question", "options", "answer"]
                        }
                    }
                }
            });

            if (response.text) {
                setQuiz(JSON.parse(response.text));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [ai, category, lang]);

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center">
            {quiz.length === 0 ? (
                <div className="w-full">
                    <div className="mb-8">
                        <label className="block text-gray-400 mb-4 text-sm uppercase tracking-wider font-bold">Pick a Distraction</label>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {t.cats.map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => setCategory(c)}
                                    className={`px-4 py-2 rounded-full border transition-all ${category === c ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'border-white/20 text-gray-300 hover:border-white'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={generateQuiz}
                        disabled={loading}
                        className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        {loading ? t.loading : t.btn}
                    </button>
                </div>
            ) : (
                <div className="w-full bg-white/5 p-8 rounded-2xl border border-white/10 relative">
                    <span className="absolute top-4 right-4 text-xs text-gray-500 font-mono">{currentQ + 1} / {quiz.length}</span>
                    <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">{quiz[currentQ].question}</h3>
                    
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {quiz[currentQ].options.map((opt, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${showAnswer && opt === quiz[currentQ].answer ? 'bg-green-600 border-green-500 text-white font-bold' : 'border-white/10 bg-black/20 text-gray-300'}`}>
                                {opt}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4">
                        {!showAnswer ? (
                            <button onClick={() => setShowAnswer(true)} className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500">
                                {t.reveal}
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    if (currentQ < quiz.length - 1) {
                                        setCurrentQ(q => q + 1);
                                        setShowAnswer(false);
                                    } else {
                                        setQuiz([]);
                                    }
                                }} 
                                className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200"
                            >
                                {currentQ < quiz.length - 1 ? t.next : "Done"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const VibeCheck: React.FC<{ lang: Language }> = ({ lang }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const ai = getGeminiAI();

    const getNote = async () => {
        if (!ai) return;
        setLoading(true);
        try {
            const prompt = `Write a short, witty, and encouraging note specifically for a tired teacher who needs a break.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Tone: Humorous, empathetic, warm.
            Max 2 sentences.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setNote(response.text || "");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center">
            <button 
                onClick={getNote}
                disabled={loading}
                className="group relative w-48 h-48 rounded-full bg-gradient-to-br from-pink-500 to-amber-500 p-1 mb-8 hover:scale-105 transition-transform shadow-[0_0_40px_rgba(236,72,153,0.3)]"
            >
                <div className="w-full h-full rounded-full bg-black/90 flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/80 transition-colors">
                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">✨</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400 text-sm uppercase tracking-widest">
                        {loading ? "Aligning..." : "Boost Me"}
                    </span>
                </div>
            </button>

            {note && (
                <div className="max-w-lg p-6 bg-white/10 rounded-xl border border-white/10 animate-fade-in">
                    <p className="text-xl font-medium text-white italic">"{note}"</p>
                </div>
            )}
        </div>
    );
};