import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const SelHub: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [ageGroup, setAgeGroup] = useState('Elementary');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "SEL Hub",
            subtitle: "Social Emotional Learning scenarios and activities.",
            labelTopic: "Topic or Challenge",
            phTopic: "e.g. Test Anxiety, Dealing with Bullies, Sharing Toys",
            labelAge: "Age Group",
            btnGenerate: "Generate Activity",
            btnGenerating: "Creating Scenario...",
            ages: ["Preschool", "Elementary", "Middle School", "High School"]
        },
        zh: {
            title: "SEL 中心",
            subtitle: "社交情感学习场景和活动。",
            labelTopic: "主题或挑战",
            phTopic: "例如：考试焦虑，应对欺凌，分享玩具",
            labelAge: "年龄组",
            btnGenerate: "生成活动",
            btnGenerating: "正在创建场景...",
            ages: ["学前班", "小学", "初中", "高中"]
        }
    }[lang];

    const generateActivity = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Create a Social Emotional Learning (SEL) activity for ${ageGroup} students about "${topic}".
            
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Format clearly with headings using Markdown:
            1. **The Scenario**: A short, relatable story about the topic.
            2. **Discussion Questions**: 3-4 open-ended questions to ask the class.
            3. **Activity**: A role-play script or a quick hands-on group activity.
            4. **Teacher Tip**: One piece of advice for handling this topic.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            setResult(response.text || "Failed to generate activity.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, ageGroup, lang]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                     <label className="block text-xs font-bold text-gem-pink uppercase mb-2">{t.labelTopic}</label>
                     <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t.phTopic}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-gem-pink outline-none"
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-gem-pink uppercase mb-2">{t.labelAge}</label>
                    <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white outline-none">
                        {t.ages.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={generateActivity}
                        disabled={isLoading || !topic}
                        className="w-full md:w-auto bg-gem-pink text-white font-bold py-3 px-8 rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-all whitespace-nowrap"
                    >
                        {isLoading ? t.btnGenerating : t.btnGenerate}
                    </button>
                </div>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-pink/30 animate-fade-in">
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};