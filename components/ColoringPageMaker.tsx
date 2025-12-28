
import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { IconDownload } from './Icons';

export const ColoringPageMaker: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [complexity, setComplexity] = useState('Kids (Medium)');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Coloring Page Maker",
            subtitle: "Generate custom black & white line art for your class.",
            labelTopic: "Topic / Character",
            phTopic: "e.g. A friendly dragon reading a book, Space rocket",
            labelComp: "Complexity Level",
            btnGenerate: "Create Coloring Page",
            btnGenerating: "Drawing Lines...",
            levels: ["Toddler (Simple/Thick Lines)", "Kids (Medium Detail)", "Adult (Intricate/Mandala)"],
            download: "Download Page"
        },
        zh: {
            title: "填色页制作器",
            subtitle: "为您的班级生成自定义的黑白线稿。",
            labelTopic: "主题 / 角色",
            phTopic: "例如：正在读书的友善龙，太空火箭",
            labelComp: "复杂度",
            btnGenerate: "创建填色页",
            btnGenerating: "正在绘制...",
            levels: ["幼儿 (简单/粗线条)", "儿童 (中等细节)", "成人 (复杂/曼陀罗)"],
            download: "下载页面"
        }
    }[lang];

    const handleGenerate = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            let stylePrompt = "";
            if (complexity.includes("Toddler")) {
                stylePrompt = "Very simple, thick bold outlines, minimal detail, large shapes, easy to color.";
            } else if (complexity.includes("Adult")) {
                stylePrompt = "Highly intricate, mandala style, fine detailed patterns, zentangle style, complex.";
            } else {
                stylePrompt = "Medium detail, clear outlines, cartoon style, storybook illustration.";
            }

            const prompt = `Create a professional black and white coloring page.
            Subject: ${topic}.
            Style: ${stylePrompt}
            Strict Requirements: 
            - Pure black lines on a white background.
            - NO shading, NO greyscale, NO gradients, NO colors.
            - High contrast line art suitable for printing.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "3:4", // Standard paper ratio
                        imageSize: "1K"
                    }
                }
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part && part.inlineData) {
                setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, complexity]);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 glass-panel p-6 rounded-2xl border border-white/10 h-fit">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">{t.labelComp}</label>
                        <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/20"
                    >
                        {isLoading ? t.btnGenerating : t.btnGenerate}
                    </button>
                </div>

                {/* Output Section */}
                <div className="w-full lg:w-2/3 flex items-center justify-center glass-panel p-4 rounded-2xl border border-white/10 min-h-[500px] bg-white/5">
                    {isLoading ? (
                         <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-indigo-400 animate-pulse">{t.btnGenerating}</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                            <img src={generatedImage} alt="Coloring Page" className="max-h-[700px] w-auto rounded-lg shadow-2xl object-contain bg-white" />
                             <a href={generatedImage} download={`coloring-${topic.replace(/\s+/g, '-')}.png`} className="absolute bottom-6 right-6 bg-black/80 hover:bg-indigo-600 text-white px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-xl font-bold flex items-center gap-2">
                                <IconDownload /> {t.download}
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center">
                            <div className="text-5xl mb-4 opacity-30">🎨</div>
                            <p>Ready to create art.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
