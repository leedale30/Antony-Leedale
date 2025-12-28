import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconGlobe, IconImage, IconSearch, IconGame } from './Icons';

type Mode = 'quiz' | 'culture' | 'landmark';

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export const GeoDiscovery: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeMode, setActiveMode] = useState<Mode>('quiz');

    const t = {
        en: {
            title: "Geo Discovery",
            subtitle: "Explore the world through quizzes, culture, and landmarks.",
            modes: { quiz: "Trivia Atlas", culture: "Cultural Passport", landmark: "Landmark Detective" }
        },
        zh: {
            title: "地理发现",
            subtitle: "通过测验、文化和地标探索世界。",
            modes: { quiz: "地理百科", culture: "文化护照", landmark: "地标侦探" }
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-emerald-400"><IconGlobe /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {(Object.keys(t.modes) as Mode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setActiveMode(mode)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeMode === mode ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.modes[mode]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-6 border border-emerald-500/20 bg-black/40 relative overflow-hidden">
                {activeMode === 'quiz' && <TriviaAtlas lang={lang} />}
                {activeMode === 'culture' && <CulturalPassport lang={lang} />}
                {activeMode === 'landmark' && <LandmarkDetective lang={lang} />}
            </div>
        </div>
    );
};

const TriviaAtlas: React.FC<{ lang: Language }> = ({ lang }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [difficulty, setDifficulty] = useState('Easy');
    const ai = getGeminiAI();

    const t = {
        en: {
            start: "Start Quiz",
            next: "Next Question",
            score: "Score",
            diff: "Difficulty",
            loading: "Generating Questions...",
            correct: "Correct!",
            wrong: "Incorrect."
        },
        zh: {
            start: "开始测验",
            next: "下一题",
            score: "得分",
            diff: "难度",
            loading: "生成问题中...",
            correct: "回答正确！",
            wrong: "回答错误。"
        }
    }[lang];

    const generateQuiz = useCallback(async () => {
        if (!ai) return;
        setLoading(true);
        setQuestions([]);
        setCurrentQ(0);
        setScore(0);
        setShowAnswer(false);

        try {
            const prompt = `Generate 5 geography trivia questions.
            Difficulty: ${difficulty}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Topics: Capitals, Flags, Physical Geography, Demographics.
            Format: JSON Array of objects { "question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string }.`;

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
                                correctIndex: { type: Type.INTEGER },
                                explanation: { type: Type.STRING }
                            },
                            required: ["question", "options", "correctIndex", "explanation"]
                        }
                    }
                }
            });

            if (response.text) {
                setQuestions(JSON.parse(response.text));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [ai, difficulty, lang]);

    const handleAnswer = (index: number) => {
        if (showAnswer) return;
        if (index === questions[currentQ].correctIndex) {
            setScore(s => s + 1);
        }
        setShowAnswer(true);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
            {questions.length === 0 ? (
                <div className="w-full">
                    <div className="mb-8">
                        <label className="block text-emerald-400 mb-4 text-sm uppercase tracking-wider font-bold">{t.diff}</label>
                        <div className="flex justify-center gap-4">
                            {['Easy', 'Medium', 'Hard'].map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => setDifficulty(d)}
                                    className={`px-6 py-3 rounded-xl border transition-all ${difficulty === d ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'border-white/20 text-gray-300 hover:border-white'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={generateQuiz}
                        disabled={loading}
                        className="bg-white text-black font-bold py-4 px-12 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 text-xl shadow-lg"
                    >
                        {loading ? t.loading : t.start}
                    </button>
                </div>
            ) : (
                <div className="w-full bg-white/5 p-8 rounded-3xl border border-white/10 relative">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400 font-mono">Q{currentQ + 1} / {questions.length}</span>
                        <span className="text-emerald-400 font-bold">{t.score}: {score}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">{questions[currentQ].question}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {questions[currentQ].options.map((opt, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleAnswer(i)}
                                disabled={showAnswer}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    showAnswer 
                                        ? i === questions[currentQ].correctIndex 
                                            ? 'bg-green-600 border-green-500 text-white' 
                                            : 'bg-black/40 border-white/10 text-gray-500'
                                        : 'bg-black/20 border-white/20 hover:bg-white/10 text-gray-200'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {showAnswer && (
                        <div className="animate-fade-in">
                            <p className="text-gray-300 mb-6 italic">{questions[currentQ].explanation}</p>
                            <button 
                                onClick={() => {
                                    if (currentQ < questions.length - 1) {
                                        setCurrentQ(q => q + 1);
                                        setShowAnswer(false);
                                    } else {
                                        setQuestions([]);
                                    }
                                }} 
                                className="px-8 py-3 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400"
                            >
                                {currentQ < questions.length - 1 ? t.next : "Finish"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CulturalPassport: React.FC<{ lang: Language }> = ({ lang }) => {
    const [country, setCountry] = useState('');
    const [guide, setGuide] = useState('');
    const [loading, setLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            placeholder: "Enter a country (e.g. Japan, Brazil, Kenya)",
            btn: "Get Passport",
            loading: "StampPassport...",
            title: "Cultural Guide"
        },
        zh: {
            placeholder: "输入国家 (例如：日本，巴西，肯尼亚)",
            btn: "获取护照",
            loading: "正在盖章...",
            title: "文化指南"
        }
    }[lang];

    const generateGuide = async () => {
        if (!ai || !country) return;
        setLoading(true);
        setGuide('');

        try {
            const prompt = `Create a fun "Cultural Passport" guide for ${country}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format using Markdown with these sections:
            1. **Greeting**: How to say Hello (with pronunciation).
            2. **Must-Try Food**: One famous dish description.
            3. **Fun Fact**: Something unique about the culture.
            4. **Etiquette Tip**: One do/don't for tourists.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setGuide(response.text || "");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto">
            <div className="flex gap-4 mb-8">
                <input 
                    type="text" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)} 
                    placeholder={t.placeholder}
                    className="flex-1 bg-black/40 border border-emerald-500/50 rounded-xl p-4 text-white focus:border-emerald-400 outline-none"
                    onKeyDown={e => e.key === 'Enter' && generateGuide()}
                />
                <button 
                    onClick={generateGuide} 
                    disabled={loading}
                    className="bg-emerald-600 text-white font-bold px-8 rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all whitespace-nowrap"
                >
                    {loading ? t.loading : t.btn}
                </button>
            </div>

            {guide && (
                <div className="flex-1 bg-[#1a1d21] p-8 rounded-2xl border-2 border-emerald-900/50 shadow-2xl relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <IconGlobe />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-yellow-500 to-blue-500"></div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 uppercase tracking-widest">{t.title}: {country}</h3>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="whitespace-pre-wrap">{guide}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LandmarkDetective: React.FC<{ lang: Language }> = ({ lang }) => {
    const [landmark, setLandmark] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [userGuess, setUserGuess] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const ai = getGeminiAI();

    // List of countries to pick from for variety
    const COUNTRIES = ["France", "Italy", "China", "India", "USA", "Egypt", "Australia", "Brazil", "Russia", "Peru"];

    const t = {
        en: {
            start: "New Mystery",
            guessPlaceholder: "Where is this?",
            submit: "Guess",
            loading: "Traveling...",
            reveal: "Reveal Answer",
            hint: "Hint: It's in..."
        },
        zh: {
            start: "新谜题",
            guessPlaceholder: "这是哪里？",
            submit: "猜一猜",
            loading: "旅行中...",
            reveal: "显示答案",
            hint: "提示：它位于..."
        }
    }[lang];

    const startRound = async () => {
        if (!ai) return;
        setLoading(true);
        setResult('');
        setUserGuess('');
        setImageUrl('');
        setRevealed(false);

        const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        setLandmark(randomCountry); // Store answer

        try {
            const prompt = `A photorealistic image of a famous, iconic landmark in ${randomCountry}. No text.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: "4:3", imageSize: "1K" } }
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part && part.inlineData) {
                setImageUrl(`data:image/png;base64,${part.inlineData.data}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const checkGuess = () => {
        if (userGuess.toLowerCase().includes(landmark.toLowerCase())) {
            setResult('Correct! 🎉');
            setRevealed(true);
        } else {
            setResult('Not quite. Try again!');
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
            {!imageUrl && !loading && (
                <div className="text-center">
                    <div className="text-6xl mb-6">🕵️‍♀️</div>
                    <button 
                        onClick={startRound}
                        className="bg-emerald-500 text-black font-bold py-4 px-12 rounded-full hover:bg-emerald-400 transition-all text-xl shadow-lg"
                    >
                        {t.start}
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-emerald-400">{t.loading}</p>
                </div>
            )}

            {imageUrl && (
                <div className="w-full flex flex-col items-center animate-fade-in">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 mb-8 max-h-[400px]">
                        <img src={imageUrl} alt="Mystery Landmark" className="w-full h-full object-cover" />
                    </div>

                    <div className="w-full flex gap-4 mb-4">
                        <input 
                            type="text" 
                            value={userGuess} 
                            onChange={e => setUserGuess(e.target.value)} 
                            placeholder={t.guessPlaceholder}
                            className="flex-1 bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                            onKeyDown={e => e.key === 'Enter' && checkGuess()}
                        />
                        <button 
                            onClick={checkGuess}
                            className="bg-white/10 text-white font-bold px-8 rounded-xl hover:bg-white/20 border border-white/20"
                        >
                            {t.submit}
                        </button>
                    </div>

                    {result && <p className={`text-xl font-bold mb-4 ${result.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}>{result}</p>}

                    <div className="flex gap-4">
                        {!revealed && (
                            <button onClick={() => setRevealed(true)} className="text-sm text-gray-500 hover:text-white underline">
                                {t.reveal}
                            </button>
                        )}
                        <button onClick={startRound} className="text-sm text-emerald-500 hover:text-emerald-300 underline">
                            {t.start}
                        </button>
                    </div>

                    {revealed && (
                        <p className="mt-4 text-emerald-400 font-bold text-lg animate-bounce">
                            {t.hint} {landmark}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};