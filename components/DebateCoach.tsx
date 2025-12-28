import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const DebateCoach: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [stance, setStance] = useState('Pro (Support)');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Debate Coach",
            subtitle: "Generate comprehensive arguments, rebuttals, and evidence for any topic.",
            labelTopic: "Resolution / Topic",
            phTopic: "e.g. Social media does more harm than good.",
            labelStance: "Your Position",
            btnGenerate: "Prepare Debate Brief",
            btnGenerating: "Researching Arguments...",
            stances: ["Pro (Support)", "Con (Oppose)", "Moderator (Neutral/Both)"]
        },
        zh: {
            title: "辩论教练",
            subtitle: "为任何主题生成全面的论点、反驳和证据。",
            labelTopic: "辩题 / 主题",
            phTopic: "例如：社交媒体弊大于利。",
            labelStance: "您的立场",
            btnGenerate: "准备辩论简报",
            btnGenerating: "正在研究论点...",
            stances: ["正方 (支持)", "反方 (反对)", "主持人 (中立/双方)"]
        }
    }[lang];

    const generateDebate = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Act as a world-class debate coach.
            Topic/Resolution: "${topic}"
            Position: ${stance}
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.

            Please generate a debate brief formatted in Markdown:
            1. **Opening Statement Hook**: A powerful opening line.
            2. **Key Arguments**: 3 strong points with reasoning.
            3. **Evidence/Data**: Suggested statistics or historical examples to support the points.
            4. **Anticipated Counter-Arguments**: What will the other side say?
            5. **Rebuttals**: How to defeat those counter-arguments.
            6. **Logical Fallacies to Watch**: Common mistakes the opponent might make on this topic.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 4096 }
                }
            });

            setResult(response.text || "Failed to generate brief.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, stance, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                 <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gem-blue-light uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-blue-light outline-none"
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gem-blue-light uppercase mb-2">{t.labelStance}</label>
                        <select value={stance} onChange={(e) => setStance(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.stances.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={generateDebate}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-blue-light to-blue-500 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-blue/30 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-blue to-blue-400"></div>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};