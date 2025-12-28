
import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';

export const ZpdGuide: React.FC<{ lang: Language }> = ({ lang }) => {
    const [currentSkill, setCurrentSkill] = useState('');
    const [targetSkill, setTargetSkill] = useState('');
    const [scaffolding, setScaffolding] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Zone of Proximal Development (ZPD)",
            subtitle: "Learn about Vygotsky's theory and generate scaffolding strategies.",
            comfort: "Comfort Zone (What I can do)",
            zpd: "ZPD (What I can do with help)",
            panic: "Panic Zone (What I can't do yet)",
            scaffoldTitle: "Scaffolding Generator",
            labelCurrent: "Current Skill Level",
            labelTarget: "Target Learning Goal",
            phCurrent: "e.g. Can add single digit numbers",
            phTarget: "e.g. Add double digit numbers with regrouping",
            btnGenerate: "Generate Strategies",
            btnGenerating: "Designing Scaffolds...",
            resultTitle: "Bridging Strategies"
        },
        zh: {
            title: "最近发展区 (ZPD)",
            subtitle: "学习维果茨基的理论并生成脚手架策略。",
            comfort: "舒适区 (我能做到的)",
            zpd: "ZPD (我在帮助下能做到的)",
            panic: "恐慌区 (我还做不到的)",
            scaffoldTitle: "脚手架生成器",
            labelCurrent: "当前技能水平",
            labelTarget: "学习目标",
            phCurrent: "例如：能进行一位数加法",
            phTarget: "例如：能进行带进位的两位数加法",
            btnGenerate: "生成策略",
            btnGenerating: "正在设计脚手架...",
            resultTitle: "桥接策略"
        }
    }[lang];

    const generateScaffolding = useCallback(async () => {
        if (!ai || !currentSkill || !targetSkill) return;
        setIsLoading(true);
        setScaffolding('');

        try {
            const prompt = `Act as an expert pedagogue specializing in Vygotsky's Zone of Proximal Development.
            Current Skill: "${currentSkill}"
            Target Skill: "${targetSkill}"
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Provide a list of 3-5 specific instructional scaffolding strategies to help a student move from their current level to the target level. 
            Format as bullet points with bold headings.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setScaffolding(response.text || "Failed to generate strategies.");
        } catch (error) {
            console.error(error);
            setScaffolding("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, currentSkill, targetSkill, lang]);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Visual Model */}
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                    <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
                        {/* Panic Zone */}
                        <div className="absolute inset-0 rounded-full border-4 border-red-500/30 bg-red-900/10 flex items-start justify-center pt-4">
                            <span className="text-red-400 text-xs font-bold uppercase tracking-widest bg-black/60 px-2 py-1 rounded">{t.panic}</span>
                        </div>
                        {/* ZPD */}
                        <div className="absolute inset-[15%] rounded-full border-4 border-yellow-500/50 bg-yellow-900/20 flex items-start justify-center pt-8">
                            <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest bg-black/60 px-2 py-1 rounded">{t.zpd}</span>
                        </div>
                        {/* Comfort Zone */}
                        <div className="absolute inset-[35%] rounded-full border-4 border-green-500/50 bg-green-900/30 flex items-center justify-center">
                            <span className="text-green-400 text-sm font-bold uppercase tracking-widest text-center px-2">{t.comfort}</span>
                        </div>
                    </div>
                </div>

                {/* Generator Tool */}
                <div className="w-full lg:w-1/2 glass-panel p-8 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-gem-blue mb-6 flex items-center gap-2">
                        <span>🏗️</span> {t.scaffoldTitle}
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-green-400 uppercase mb-2">{t.labelCurrent}</label>
                            <input 
                                type="text" 
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                placeholder={t.phCurrent}
                                className="w-full bg-black/40 border border-green-500/30 rounded-lg p-3 text-white focus:border-green-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">{t.labelTarget}</label>
                            <input 
                                type="text" 
                                value={targetSkill}
                                onChange={(e) => setTargetSkill(e.target.value)}
                                placeholder={t.phTarget}
                                className="w-full bg-black/40 border border-yellow-500/30 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={generateScaffolding}
                        disabled={isLoading || !currentSkill || !targetSkill}
                        className="w-full bg-gradient-to-r from-green-600 to-yellow-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                    >
                        {isLoading ? t.btnGenerating : t.btnGenerate}
                    </button>

                    {scaffolding && (
                        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">{t.resultTitle}</h4>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="whitespace-pre-wrap">{scaffolding}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
