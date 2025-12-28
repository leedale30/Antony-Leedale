
import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const WorksheetWizard: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('5th Grade');
    const [type, setType] = useState('Multiple Choice Quiz');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Worksheet Wizard",
            subtitle: "Instantly create printable classroom resources.",
            labelTopic: "Topic",
            phTopic: "e.g. Photosynthesis, Fractions",
            labelGrade: "Grade Level",
            labelType: "Worksheet Type",
            btnGenerate: "Generate Worksheet",
            btnGenerating: "Generating Resource...",
            copy: "Copy Markdown",
            types: [
                "Multiple Choice Quiz",
                "Fill-in-the-Blank",
                "Matching Exercise",
                "Word Problems",
                "Reading Comprehension",
                "Vocabulary List"
            ],
            grades: ["Kindergarten", "1st Grade", "3rd Grade", "5th Grade", "8th Grade", "High School"]
        },
        zh: {
            title: "作业生成向导",
            subtitle: "即时创建可打印的课堂资源。",
            labelTopic: "主题",
            phTopic: "例如：光合作用，分数",
            labelGrade: "年级",
            labelType: "作业类型",
            btnGenerate: "生成作业",
            btnGenerating: "正在生成资源...",
            copy: "复制 Markdown",
            types: [
                "选择题测验",
                "填空题",
                "配对练习",
                "应用题",
                "阅读理解",
                "词汇表"
            ],
            grades: ["幼儿园", "一年级", "三年级", "五年级", "八年级", "高中"]
        }
    }[lang];

    const generateWorksheet = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Create a ${type} worksheet for ${gradeLevel} students about "${topic}".
            
            Requirements:
            1. Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            2. Include a clear Title and Name/Date lines at the top.
            3. Include clear instructions.
            4. Generate 5-10 high-quality questions/items.
            5. At the very bottom, include an "Answer Key" section (separated by a horizontal line).
            6. Format the output using clear Markdown. Use tables for matching exercises.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 4000 }
                }
            });

            setResult(response.text || "Failed to generate worksheet.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, gradeLevel, type, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    <div>
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelGrade}</label>
                        <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelType}</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.types.map(typeVal => <option key={typeVal} value={typeVal}>{typeVal}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={generateWorksheet}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-blue to-gem-teal text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-white/10 relative">
                    <button 
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white"
                    >
                        {t.copy}
                    </button>
                    <div className="prose prose-invert prose-lg max-w-none bg-white/5 p-8 rounded-xl">
                        <div className="whitespace-pre-wrap">{result}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
