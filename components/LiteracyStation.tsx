import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const LiteracyStation: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [phonics, setPhonics] = useState('Short "a"');
    const [sightWords, setSightWords] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Literacy Station",
            subtitle: "Generate decodable passages for early readers.",
            labelTopic: "Story Theme/Topic",
            phTopic: "e.g. A cat and a rat, A day at the park",
            labelPhonics: "Target Sound/Phonics",
            phPhonics: "e.g. Short 'a', 'ch' digraph, Silent 'e'",
            labelWords: "Sight Words to Include",
            phWords: "e.g. the, and, is, see",
            btnGenerate: "Write Story",
            btnGenerating: "Writing...",
        },
        zh: {
            title: "识字加油站",
            subtitle: "为早期阅读者生成可解码的阅读篇章。",
            labelTopic: "故事主题",
            phTopic: "例如：猫和老鼠，公园的一天",
            labelPhonics: "目标发音/拼读规则",
            phPhonics: "例如：短元音 'a'，'ch' 二合字母",
            labelWords: "包含的视觉词 (Sight Words)",
            phWords: "例如：the, and, is, see",
            btnGenerate: "编写故事",
            btnGenerating: "正在编写...",
        }
    }[lang];

    const generateStory = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Write a short decodable story for early readers (Kindergarten - 1st Grade).
            Theme: ${topic}
            Target Phonics Rule: ${phonics}
            Sight Words to Include: ${sightWords}
            Language: ${lang === 'zh' ? 'Chinese (Simplified) and English' : 'English'}.

            Instructions:
            1. Keep sentences simple and repetitive.
            2. Bold the words that use the target phonics rule.
            3. Highlight the sight words in italics.
            4. Provide 3 simple comprehension questions at the end.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 2048 }
                }
            });

            setResult(response.text || "Failed to generate story.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, phonics, sightWords, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gem-pink uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-pink outline-none"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gem-pink uppercase mb-2">{t.labelPhonics}</label>
                         <input 
                            type="text" 
                            value={phonics}
                            onChange={(e) => setPhonics(e.target.value)}
                            placeholder={t.phPhonics}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-pink outline-none"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gem-pink uppercase mb-2">{t.labelWords}</label>
                         <input 
                            type="text" 
                            value={sightWords}
                            onChange={(e) => setSightWords(e.target.value)}
                            placeholder={t.phWords}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-pink outline-none"
                        />
                    </div>
                </div>
                <button 
                    onClick={generateStory}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-pink to-rose-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-pink-900/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-pink/30 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-pink to-rose-400"></div>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};