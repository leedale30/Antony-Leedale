import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconImage } from './Icons';

interface GlossaryTerm {
    term: string;
    definition: string;
    example: string;
    visualUrl?: string;
    isLoadingVisual?: boolean;
}

export const MathGlossaryGenerator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('Elementary');
    const [visualStyle, setVisualStyle] = useState('Flat Design');
    const [terms, setTerms] = useState<GlossaryTerm[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Math Glossary Generator",
            subtitle: "Create grade-level appropriate definitions, examples, and visuals.",
            labelTopic: "Math Topic",
            phTopic: "e.g. Geometry, Fractions, Statistics",
            labelGrade: "Grade Level",
            labelStyle: "Visual Style",
            btnGenerate: "Generate Glossary",
            btnGenerating: "Defining Terms...",
            btnVisual: "Generate Visual",
            grades: ["Kindergarten", "Elementary", "Middle School", "High School"],
            styles: ["Flat Design", "Realistic 3D", "Hand-drawn Sketch", "Geometric Abstract", "Pixel Art"]
        },
        zh: {
            title: "数学词汇生成器",
            subtitle: "创建适合该年级的定义、示例和视觉辅助材料。",
            labelTopic: "数学主题",
            phTopic: "例如：几何，分数，统计学",
            labelGrade: "年级",
            labelStyle: "视觉风格",
            btnGenerate: "生成词汇表",
            btnGenerating: "正在定义术语...",
            btnVisual: "生成图解",
            grades: ["幼儿园", "小学", "初中", "高中"],
            styles: ["扁平化设计", "逼真 3D", "手绘素描", "几何抽象", "像素艺术"]
        }
    }[lang];

    const generateGlossary = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setTerms([]);

        try {
            const prompt = `Create a glossary of 5-8 key mathematical terms related to "${topic}" suitable for ${gradeLevel} students.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Return a JSON array where each object has:
            - "term": The mathematical term.
            - "definition": A clear definition suitable for the grade level.
            - "example": A short example or usage of the term.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                term: { type: Type.STRING },
                                definition: { type: Type.STRING },
                                example: { type: Type.STRING }
                            },
                            required: ["term", "definition", "example"]
                        }
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                if (Array.isArray(data)) {
                    setTerms(data);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, gradeLevel, lang]);

    const generateVisual = async (index: number) => {
        if (!ai) return;
        const term = terms[index];
        
        // Update loading state for specific term
        const newTerms = [...terms];
        newTerms[index].isLoadingVisual = true;
        setTerms(newTerms);

        try {
            const prompt = `A clear, simple educational diagram or illustration explaining the math concept: "${term.term}". 
            Context: ${term.definition}. 
            Style: ${visualStyle}, suitable for ${gradeLevel} students. White background.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9",
                        imageSize: "1K"
                    }
                }
            });

            let imageUrl = '';
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }

            if (imageUrl) {
                const updatedTerms = [...terms];
                updatedTerms[index].visualUrl = imageUrl;
                updatedTerms[index].isLoadingVisual = false;
                setTerms(updatedTerms);
            }
        } catch (error) {
            console.error(error);
            const updatedTerms = [...terms];
            updatedTerms[index].isLoadingVisual = false;
            setTerms(updatedTerms);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12 px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center tracking-tight">{t.title}</h2>
            <p className="text-gray-400 mb-10 text-center max-w-2xl mx-auto text-sm md:text-base">{t.subtitle}</p>

            <div className="glass-panel p-6 md:p-8 rounded-2xl mb-10 border border-white/10 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                    <div className="md:col-span-6 lg:col-span-5">
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2 ml-1 tracking-wider">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-blue outline-none transition-all focus:ring-1 focus:ring-gem-blue/50 placeholder-gray-500"
                        />
                    </div>
                    <div className="md:col-span-3 lg:col-span-3">
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2 ml-1 tracking-wider">{t.labelGrade}</label>
                        <div className="relative">
                            <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white outline-none appearance-none cursor-pointer focus:border-gem-blue transition-all">
                                {t.grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-3 lg:col-span-4">
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2 ml-1 tracking-wider">{t.labelStyle}</label>
                        <div className="relative">
                            <select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white outline-none appearance-none cursor-pointer focus:border-gem-blue transition-all">
                                {t.styles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={generateGlossary}
                    disabled={isLoading || !topic}
                    className="w-full bg-gradient-to-r from-gem-blue via-cyan-500 to-gem-blue bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t.btnGenerating}
                        </div>
                    ) : t.btnGenerate}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                {terms.map((item, index) => (
                    <div key={index} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-gem-blue/40 transition-all duration-300 hover:shadow-xl hover:shadow-gem-blue/10 flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gem-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-start mb-4 gap-3">
                             <h3 className="text-2xl font-bold text-white tracking-tight break-words">{item.term}</h3>
                             {!item.visualUrl && (
                                <button 
                                    onClick={() => generateVisual(index)}
                                    disabled={item.isLoadingVisual}
                                    className="shrink-0 text-xs flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-gray-300 transition-all border border-white/5 hover:border-white/20 hover:text-white"
                                    title={t.btnVisual}
                                >
                                    {item.isLoadingVisual ? (
                                        <div className="w-3.5 h-3.5 border-2 border-gem-blue border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <IconImage />
                                    )}
                                    <span className="hidden sm:inline">{t.btnVisual}</span>
                                </button>
                             )}
                        </div>
                        
                        <div className="flex-grow">
                            <p className="text-gray-300 mb-4 leading-relaxed font-light">{item.definition}</p>
                            
                            <div className="bg-black/30 p-4 rounded-xl border-l-4 border-gem-blue/50 mb-4">
                                <p className="text-sm text-gray-400 italic font-medium">
                                    <span className="text-gem-blue/70 not-italic font-bold mr-2">Ex:</span>
                                    {item.example}
                                </p>
                            </div>
                        </div>

                        {item.visualUrl && (
                            <div className="mt-auto rounded-xl overflow-hidden border border-white/10 shadow-lg relative group/image">
                                <div className="absolute inset-0 bg-black/20 group-hover/image:bg-transparent transition-colors z-10 pointer-events-none" />
                                <img src={item.visualUrl} alt={item.term} className="w-full h-48 object-cover transform group-hover/image:scale-105 transition-transform duration-700" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};