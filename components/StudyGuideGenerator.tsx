import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const StudyGuideGenerator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [input, setInput] = useState('');
    const [guide, setGuide] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Study Guide Generator",
            subtitle: "Turn notes, text, or topics into structured study guides.",
            labelInput: "Content (Text, Notes, or Topic)",
            phInput: "Paste your lecture notes, article text, or a topic like 'The Cold War'...",
            btnGenerate: "Generate Study Guide",
            btnGenerating: "Analyzing & Summarizing...",
            copy: "Copy Guide"
        },
        zh: {
            title: "学习指南生成器",
            subtitle: "将笔记、文本或主题转化为结构化的学习指南。",
            labelInput: "内容 (文本、笔记或主题)",
            phInput: "粘贴您的讲座笔记、文章文本或主题，如“冷战”...",
            btnGenerate: "生成学习指南",
            btnGenerating: "分析与总结中...",
            copy: "复制指南"
        }
    }[lang];

    const generateGuide = useCallback(async () => {
        if (!ai || !input) return;
        setIsLoading(true);
        setGuide('');

        try {
            const prompt = `Create a comprehensive study guide based on the following input: "${input}".
            
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Format clearly using Markdown:
            1. **Key Concepts**: Bulleted summary of the most important points.
            2. **Vocabulary / Terms**: Definitions of key terms found in the text or relevant to the topic.
            3. **Practice Quiz**: 5 Multiple choice questions to test understanding (include the answer key at the very bottom).
            
            Ensure the tone is educational and encouraging.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 4096 }
                }
            });

            setGuide(response.text || "Failed to generate guide.");
        } catch (error) {
            console.error(error);
            setGuide(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, input, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelInput}</label>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={8}
                    placeholder={t.phInput}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-blue outline-none mb-4"
                />
                <button 
                    onClick={generateGuide}
                    disabled={isLoading || !input}
                    className="w-full bg-gradient-to-r from-gem-blue to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {guide && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-blue/30 animate-fade-in relative">
                    <button 
                        onClick={() => navigator.clipboard.writeText(guide)}
                        className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors"
                    >
                        {t.copy}
                    </button>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap leading-relaxed">
                        {guide}
                    </div>
                </div>
            )}
        </div>
    );
};