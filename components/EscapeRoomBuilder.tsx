import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const EscapeRoomBuilder: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [theme, setTheme] = useState('Haunted House');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Escape Room Builder",
            subtitle: "Turn review day into an adventure. Generate puzzles and a storyline.",
            labelTopic: "Subject / Content to Review",
            phTopic: "e.g. Multiplication Tables, The Periodic Table, Romeo & Juliet",
            labelTheme: "Adventure Theme",
            btnGenerate: "Build Escape Room",
            btnGenerating: "Locking the doors...",
            themes: ["Haunted House", "Space Station Crisis", "Detective Agency", "Jungle Ruins", "Super Spy Mission", "Zombie Apocalypse"]
        },
        zh: {
            title: "密室逃脱生成器",
            subtitle: "让复习日充满冒险。生成谜题和故事情节。",
            labelTopic: "复习科目 / 内容",
            phTopic: "例如：乘法表，元素周期表，罗密欧与朱丽叶",
            labelTheme: "冒险主题",
            btnGenerate: "构建密室",
            btnGenerating: "正在锁门...",
            themes: ["鬼屋", "空间站危机", "侦探社", "丛林遗迹", "超级间谍任务", "僵尸末日"]
        }
    }[lang];

    const generateGame = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Create a classroom "Escape Room" activity.
            Topic: ${topic}
            Theme: ${theme}
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.

            Please format using Markdown:
            1. **The Mission**: A dramatic backstory to set the scene for students.
            2. **The Goal**: What are they trying to find or unlock? (e.g. a 4-digit code).
            3. **Puzzle 1**: Description of a puzzle related to the topic. (e.g. solve math problems to get letters).
            4. **Puzzle 2**: A different type of puzzle (logic, cipher, matching).
            5. **Puzzle 3**: The final challenge.
            6. **Answer Key**: The codes/answers for the teacher.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 4096 }
                }
            });

            setResult(response.text || "Failed to generate game.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, theme, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                 <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-purple outline-none"
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelTheme}</label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.themes.map(th => <option key={th} value={th}>{th}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={generateGame}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-purple to-purple-800 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-purple/30 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-purple to-pink-500"></div>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};