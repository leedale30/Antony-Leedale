import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';

export const DifferentiationTool: React.FC<{ lang: Language }> = ({ lang }) => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<{ support: string; core: string; enrichment: string } | null>(null);
    const [activeLevel, setActiveLevel] = useState<'support' | 'core' | 'enrichment'>('core');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Differentiation Engine",
            subtitle: "Instantly create leveled reading materials for your diverse classroom.",
            labelInput: "Original Text or Topic",
            phInput: "Paste an article, assignment instructions, or a topic here...",
            btnGenerate: "Differentiate Text",
            btnGenerating: "Generating Levels...",
            levels: {
                support: "Support / ESL",
                core: "On-Level",
                enrichment: "Enrichment"
            },
            desc: {
                support: "Simplified vocabulary, shorter sentences, added definitions.",
                core: "Standard complexity for the grade level.",
                enrichment: "Advanced vocabulary, deeper critical thinking questions."
            }
        },
        zh: {
            title: "差异化教学引擎",
            subtitle: "为多样化的课堂即时创建分级阅读材料。",
            labelInput: "原始文本或主题",
            phInput: "在此粘贴文章、作业说明或主题...",
            btnGenerate: "生成分级文本",
            btnGenerating: "正在生成...",
            levels: {
                support: "基础 / ESL",
                core: "标准",
                enrichment: "拓展"
            },
            desc: {
                support: "简化词汇，短句，增加定义。",
                core: "适合该年级的标准难度。",
                enrichment: "高级词汇，更深层次的批判性思维问题。"
            }
        }
    }[lang];

    const handleGenerate = useCallback(async () => {
        if (!ai || !inputText) return;
        setIsLoading(true);
        setResult(null);

        try {
            const prompt = `Rewrite the following text (or write about the topic) in 3 distinct differentiation levels:
            1. 'support': For struggling readers or ESL students (Lower Lexile, simple sentences).
            2. 'core': For on-level students (Standard complexity).
            3. 'enrichment': For advanced students (Higher Lexile, abstract concepts).
            
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Input: "${inputText}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            support: { type: Type.STRING },
                            core: { type: Type.STRING },
                            enrichment: { type: Type.STRING }
                        },
                        required: ["support", "core", "enrichment"]
                    }
                }
            });

            if (response.text) {
                setResult(JSON.parse(response.text));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ai, inputText, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelInput}</label>
                <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    placeholder={t.phInput}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-teal outline-none mb-4"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !inputText}
                    className="w-full bg-gradient-to-r from-gem-teal to-gem-blue text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="flex border-b border-white/10 bg-black/20">
                        {(['support', 'core', 'enrichment'] as const).map(level => (
                            <button 
                                key={level}
                                onClick={() => setActiveLevel(level)}
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeLevel === level ? 'bg-gem-blue/20 text-gem-blue-light border-b-2 border-gem-blue' : 'text-gray-400 hover:text-white'}`}
                            >
                                {t.levels[level]}
                            </button>
                        ))}
                    </div>
                    <div className="p-8 min-h-[300px]">
                        <p className="text-xs text-gray-500 mb-4 italic">{t.desc[activeLevel]}</p>
                        <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap leading-relaxed">
                            {result[activeLevel]}
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result[activeLevel])}
                            className="mt-6 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors"
                        >
                            Copy Text
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};