import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const RubricGenerator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('8th Grade');
    const [scale, setScale] = useState('4');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Rubric Builder",
            subtitle: "Create professional grading rubrics in seconds.",
            labelTopic: "Assignment Description",
            phTopic: "e.g. Persuasive Essay on Climate Change, Science Fair Project",
            labelGrade: "Grade Level",
            labelScale: "Grading Scale",
            btnGenerate: "Generate Rubric",
            btnGenerating: "Designing...",
            scales: ["4-Point (Exceeds - Emerging)", "5-Point (A - F)", "Percentage Range"],
            copy: "Copy Markdown"
        },
        zh: {
            title: "评分标准生成器",
            subtitle: "几秒钟内创建专业的评分标准。",
            labelTopic: "作业描述",
            phTopic: "例如：关于气候变化的议论文，科学展览项目",
            labelGrade: "年级",
            labelScale: "评分量表",
            btnGenerate: "生成评分标准",
            btnGenerating: "设计中...",
            scales: ["4分制 (超出预期 - 起步)", "5分制 (A - F)", "百分比范围"],
            copy: "复制 Markdown"
        }
    }[lang];

    const generateRubric = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Create a grading rubric for a ${gradeLevel} assignment about "${topic}".
            
            Scale: ${scale}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Output Requirements:
            1. Return ONLY a standard Markdown Table.
            2. Columns should be the scale levels (e.g., 4, 3, 2, 1).
            3. Rows should be the Criteria (e.g., Content, Organization, Mechanics).
            4. Cells should contain specific descriptions of performance.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 2048 }
                }
            });

            setResult(response.text || "Failed to generate rubric.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, gradeLevel, scale, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-blue outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelGrade}</label>
                            <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                                <option>Kindergarten</option>
                                <option>Elementary (1-5)</option>
                                <option>Middle School (6-8)</option>
                                <option>High School (9-12)</option>
                                <option>University</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelScale}</label>
                            <select value={scale} onChange={(e) => setScale(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                                {t.scales.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={generateRubric}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-blue to-gem-teal text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-x-auto">
                    <button 
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white"
                    >
                        {t.copy}
                    </button>
                    <div className="prose prose-invert prose-lg max-w-none bg-white/5 p-8 rounded-xl min-w-[600px]">
                        <div className="whitespace-pre-wrap font-serif">{result}</div>
                    </div>
                </div>
            )}
        </div>
    );
};