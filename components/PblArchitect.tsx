import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const PblArchitect: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('8th Grade');
    const [duration, setDuration] = useState('2 Weeks');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "PBL Architect",
            subtitle: "Design rigorous Project Based Learning units that inspire.",
            labelTopic: "Project Topic / Standard",
            phTopic: "e.g. Sustainable Cities, The American Revolution, Biodiversity",
            labelGrade: "Grade Level",
            labelDuration: "Duration",
            btnGenerate: "Draft Project Plan",
            btnGenerating: "Architecting Unit...",
            durations: ["1 Week", "2 Weeks", "4 Weeks", "Semester"]
        },
        zh: {
            title: "PBL 架构师",
            subtitle: "设计严谨且鼓舞人心的项目式学习单元。",
            labelTopic: "项目主题 / 标准",
            phTopic: "例如：可持续城市，美国革命，生物多样性",
            labelGrade: "年级",
            labelDuration: "时长",
            btnGenerate: "起草项目计划",
            btnGenerating: "正在架构单元...",
            durations: ["1 周", "2 周", "4 周", "学期"]
        }
    }[lang];

    const generateProject = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Design a high-quality Project Based Learning (PBL) unit.
            Topic: ${topic}
            Grade: ${gradeLevel}
            Duration: ${duration}
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.

            Please format using Markdown with the following sections:
            1. **Driving Question**: A provocative, open-ended question.
            2. **Project Summary**: A brief hook/overview.
            3. **Entry Event**: How to launch the project (video, guest speaker, field trip).
            4. **Student Products**: What will they make? (Individual & Team).
            5. **Public Audience**: Who will they present to?
            6. **Weekly Milestones**: A rough timeline of checks for understanding.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 4096 }
                }
            });

            setResult(response.text || "Failed to generate project.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, gradeLevel, duration, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                            <option>Kindergarten</option>
                            <option>Elementary (1-5)</option>
                            <option>Middle School (6-8)</option>
                            <option>High School (9-12)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelDuration}</label>
                        <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.durations.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={generateProject}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-blue to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-blue/30 animate-fade-in">
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};