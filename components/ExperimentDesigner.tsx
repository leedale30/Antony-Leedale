import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const ExperimentDesigner: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('Middle School');
    const [materials, setMaterials] = useState('Standard Classroom Stuff');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Science Lab Generator",
            subtitle: "Design safe, hands-on experiments based on the materials you have.",
            labelTopic: "Scientific Concept / Topic",
            phTopic: "e.g. Density, Acids & Bases, Friction",
            labelGrade: "Grade Level",
            labelMaterials: "Available Materials",
            btnGenerate: "Design Experiment",
            btnGenerating: "Formulating Hypothesis...",
            materialOpts: ["Standard Lab Equipment", "Kitchen Supplies Only", "Paper & Office Supplies", "Outdoor / Nature"],
            grades: ["Kindergarten", "Elementary", "Middle School", "High School"]
        },
        zh: {
            title: "科学实验生成器",
            subtitle: "根据您现有的材料设计安全、动手的实验。",
            labelTopic: "科学概念 / 主题",
            phTopic: "例如：密度，酸碱，摩擦力",
            labelGrade: "年级",
            labelMaterials: "可用材料",
            btnGenerate: "设计实验",
            btnGenerating: "正在制定假设...",
            materialOpts: ["标准实验室设备", "仅限厨房用品", "纸张和办公用品", "户外 / 大自然"],
            grades: ["幼儿园", "小学", "初中", "高中"]
        }
    }[lang];

    const generateLab = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Design a science experiment for ${gradeLevel} students about "${topic}".
            
            Constraint - Available Materials: ${materials}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.

            Please format using Markdown:
            1. **Title**: Catchy and relevant.
            2. **Objective**: What will students learn?
            3. **Materials List**: Be specific based on the constraint.
            4. **Safety Precautions**: Crucial safety steps (even for simple items).
            5. **Procedure**: Step-by-step instructions.
            6. **The Science**: A brief explanation of the phenomenon observed.
            7. **Discussion Questions**: 3 questions to ask after the lab.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 2048 }
                }
            });

            setResult(response.text || "Failed to design experiment.");
        } catch (error) {
            console.error(error);
            setResult(lang === 'zh' ? "发生错误。" : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, gradeLevel, materials, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-teal outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelGrade}</label>
                         <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelMaterials}</label>
                        <select value={materials} onChange={(e) => setMaterials(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.materialOpts.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={generateLab}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-teal to-green-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-teal-900/20"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-teal/30 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-teal to-green-400"></div>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};