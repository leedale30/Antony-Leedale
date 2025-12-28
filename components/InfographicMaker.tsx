import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { IconDownload } from './Icons';

export const InfographicMaker: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [type, setType] = useState('Timeline');
    const [dataPoints, setDataPoints] = useState('');
    const [style, setStyle] = useState('Flat Vector');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Infographic Maker",
            subtitle: "Visualize data, timelines, and processes instantly.",
            labelTopic: "Topic / Title",
            phTopic: "e.g. The Water Cycle, History of the Internet",
            labelType: "Layout Type",
            labelData: "Key Points / Data (Bullet points work best)",
            phData: "e.g. \n- 1969: Arpanet\n- 1983: TCP/IP\n- 1991: WWW",
            labelStyle: "Visual Style",
            btnGenerate: "Create Infographic",
            btnGenerating: "Designing Layout...",
            types: ["Timeline", "Process Flow", "Comparison", "Fact Sheet", "Data Visualization"],
            styles: ["Flat Vector", "Hand-Drawn", "Modern Minimalist", "3D Isometric", "Retro/Vintage"]
        },
        zh: {
            title: "信息图制作器",
            subtitle: "即时可视化数据、时间轴和流程。",
            labelTopic: "主题 / 标题",
            phTopic: "例如：水循环，互联网历史",
            labelType: "布局类型",
            labelData: "关键点 / 数据 (建议使用项目符号)",
            phData: "例如：\n- 1969: Arpanet\n- 1983: TCP/IP\n- 1991: WWW",
            labelStyle: "视觉风格",
            btnGenerate: "创建信息图",
            btnGenerating: "设计布局中...",
            types: ["时间轴", "流程图", "对比图", "概况资料单", "数据可视化"],
            styles: ["扁平矢量", "手绘风格", "现代极简", "3D 等距", "复古风格"]
        }
    }[lang];

    const handleGenerate = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const prompt = `Design a high-quality educational infographic.
            Topic: ${topic}
            Type: ${type}
            Style: ${style}
            
            Key Information to Visualize:
            ${dataPoints}
            
            Requirements:
            - Create a clear, readable vertical poster layout (3:4 aspect ratio).
            - Use appropriate icons and illustrations.
            - Focus on visual hierarchy.
            - Text should be legible and minimal.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "3:4",
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
    }, [ai, topic, type, dataPoints, style]);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 glass-panel p-6 rounded-2xl border border-white/10 h-fit">
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelTopic}</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.phTopic}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-teal outline-none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelType}</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.types.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelStyle}</label>
                         <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.styles.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelData}</label>
                        <textarea 
                            value={dataPoints}
                            onChange={(e) => setDataPoints(e.target.value)}
                            placeholder={t.phData}
                            rows={6}
                            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-teal outline-none resize-none"
                        />
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full bg-gradient-to-r from-gem-teal to-emerald-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-teal-900/20"
                    >
                        {isLoading ? t.btnGenerating : t.btnGenerate}
                    </button>
                </div>

                {/* Output Section */}
                <div className="w-full lg:w-2/3 flex items-center justify-center glass-panel p-4 rounded-2xl border border-white/10 min-h-[500px] bg-black/20">
                    {isLoading ? (
                         <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-gem-teal border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gem-teal animate-pulse">{t.btnGenerating}</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                            <img src={generatedImage} alt="Generated Infographic" className="max-h-[700px] w-auto rounded-lg shadow-2xl object-contain" />
                             <a href={generatedImage} download={`infographic-${topic}.png`} className="absolute bottom-6 right-6 bg-black/70 hover:bg-gem-teal text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-xl">
                                <IconDownload />
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center">
                            <div className="text-5xl mb-4 opacity-30">📊</div>
                            <p>Enter details to generate an infographic.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};