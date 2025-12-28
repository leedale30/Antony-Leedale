import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const CareerConnector: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('High School');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Career Connector",
            subtitle: "Answer the question: 'When will I ever use this?'",
            labelTopic: "Lesson Topic / Subject",
            phTopic: "e.g. Quadratic Equations, The Civil War, Thermodynamics",
            labelGrade: "Grade Level",
            btnGenerate: "Find Real-World Connections",
            btnGenerating: "Connecting to Industry...",
            grades: ["Middle School", "High School", "University"]
        },
        zh: {
            title: "职业连接器",
            subtitle: "回答学生的问题：‘我什么时候会用到这个？’",
            labelTopic: "课程主题 / 科目",
            phTopic: "例如：二次方程，南北战争，热力学",
            labelGrade: "年级",
            btnGenerate: "寻找现实世界连接",
            btnGenerating: "正在连接行业...",
            grades: ["初中", "高中", "大学"]
        }
    }[lang];

    const generateConnection = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Connect the topic "${topic}" to real-world careers for ${gradeLevel} students.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Format clearly using Markdown:
            1. **The Hook**: A quick explanation of why this concept matters outside school.
            2. **3 Key Careers**: List 3 specific job titles that use this concept daily. Explain HOW they use it.
            3. **Real-World Scenario**: A detailed paragraph describing a problem a professional would solve using this topic.
            4. **Mini Job Challenge**: A short, practical problem for students to solve (like a mini-internship task).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 2048 }
                }
            });

            setResult(response.text || "Failed to generate connections.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, gradeLevel, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-blue outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelGrade}</label>
                        <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={generateConnection}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-blue to-cyan-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-blue/30 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-blue to-cyan-400"></div>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};