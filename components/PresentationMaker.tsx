import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconImage, IconDownload } from './Icons';

interface Slide {
    title: string;
    content: string[];
    speakerNotes: string;
    visualPrompt: string;
    visualUrl?: string;
    isLoadingVisual?: boolean;
}

export const PresentationMaker: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('High School');
    const [slideCount, setSlideCount] = useState(6);
    const [visualStyle, setVisualStyle] = useState('Minimalist Vector');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Presentation Slides Maker",
            subtitle: "Generate a complete slide deck outline with speaker notes and visuals.",
            labelTopic: "Presentation Topic",
            phTopic: "e.g. The Solar System, Introduction to Poetry, Cyber Safety",
            labelAudience: "Target Audience",
            labelCount: "Number of Slides",
            labelStyle: "Visual Style",
            btnGenerate: "Generate Deck Outline",
            btnGenerating: "Outlining Presentation...",
            btnVisual: "Generate Slide Visual",
            speakerNotes: "Speaker Notes",
            audiences: ["Elementary", "Middle School", "High School", "University", "Professional"],
            styles: ["Minimalist Vector", "Corporate Clean", "Playful & Colorful", "Dark Mode Tech", "Watercolor Artistic"]
        },
        zh: {
            title: "演示文稿制作器",
            subtitle: "生成包含演讲者备注和视觉效果的完整幻灯片大纲。",
            labelTopic: "演示主题",
            phTopic: "例如：太阳系，诗歌入门，网络安全",
            labelAudience: "目标受众",
            labelCount: "幻灯片数量",
            labelStyle: "视觉风格",
            btnGenerate: "生成大纲",
            btnGenerating: "正在规划演示文稿...",
            btnVisual: "生成幻灯片配图",
            speakerNotes: "演讲者备注",
            audiences: ["小学", "初中", "高中", "大学", "专业人士"],
            styles: ["极简矢量", "商务简洁", "活泼多彩", "深色科技", "水彩艺术"]
        }
    }[lang];

    const generateDeck = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setSlides([]);

        try {
            const prompt = `Create a ${slideCount}-slide presentation about "${topic}" for ${audience} audience.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Return a JSON array where each object represents a slide with:
            - "title": Slide title.
            - "content": Array of bullet points (strings).
            - "speakerNotes": Detailed script for the presenter.
            - "visualPrompt": A detailed image generation prompt to create a background or diagram for this slide (Style: ${visualStyle}).
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
                                title: { type: Type.STRING },
                                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                                speakerNotes: { type: Type.STRING },
                                visualPrompt: { type: Type.STRING }
                            },
                            required: ["title", "content", "speakerNotes", "visualPrompt"]
                        }
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                if (Array.isArray(data)) {
                    setSlides(data);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, audience, slideCount, visualStyle, lang]);

    const generateSlideVisual = async (index: number) => {
        if (!ai) return;
        const slide = slides[index];
        
        const newSlides = [...slides];
        newSlides[index].isLoadingVisual = true;
        setSlides(newSlides);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: slide.visualPrompt }] },
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
                const updatedSlides = [...slides];
                updatedSlides[index].visualUrl = imageUrl;
                updatedSlides[index].isLoadingVisual = false;
                setSlides(updatedSlides);
            }
        } catch (error) {
            console.error(error);
            const updatedSlides = [...slides];
            updatedSlides[index].isLoadingVisual = false;
            setSlides(updatedSlides);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12 px-4">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            {/* Controls */}
            <div className="glass-panel p-6 rounded-2xl mb-10 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-2">
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
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelAudience}</label>
                        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.audiences.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelCount}</label>
                         <select value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {[4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} Slides</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelStyle}</label>
                         <select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                            {t.styles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="lg:col-span-3 flex items-end">
                        <button 
                            onClick={generateDeck}
                            disabled={isLoading || !topic}
                            className="w-full bg-gradient-to-r from-gem-blue to-cyan-600 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                        >
                            {isLoading ? t.btnGenerating : t.btnGenerate}
                        </button>
                    </div>
                </div>
            </div>

            {/* Slides Grid */}
            <div className="grid grid-cols-1 gap-12">
                {slides.map((slide, index) => (
                    <div key={index} className="flex flex-col lg:flex-row gap-6 glass-panel p-6 rounded-2xl border border-white/5 animate-fade-in">
                        {/* Slide Visual Area */}
                        <div className="w-full lg:w-1/2 aspect-video bg-black/40 rounded-xl border border-white/10 relative group overflow-hidden flex flex-col items-center justify-center">
                            {slide.visualUrl ? (
                                <>
                                    <img src={slide.visualUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                                    <a href={slide.visualUrl} download={`slide-${index + 1}.png`} className="absolute bottom-4 right-4 bg-black/70 hover:bg-gem-blue text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                        <IconDownload />
                                    </a>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                     <p className="text-gray-500 mb-4 text-sm">{slide.visualPrompt.substring(0, 100)}...</p>
                                     <button 
                                        onClick={() => generateSlideVisual(index)}
                                        disabled={slide.isLoadingVisual}
                                        className="bg-white/10 hover:bg-gem-blue text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                                    >
                                        {slide.isLoadingVisual ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : <IconImage />}
                                        {t.btnVisual}
                                    </button>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                Slide {index + 1}
                            </div>
                        </div>

                        {/* Slide Content Area */}
                        <div className="w-full lg:w-1/2 flex flex-col">
                            <h3 className="text-2xl font-bold text-white mb-4">{slide.title}</h3>
                            <ul className="list-disc list-outside ml-5 space-y-2 mb-6 text-gray-200">
                                {slide.content.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                ))}
                            </ul>
                            
                            <div className="mt-auto bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-gem-blue uppercase mb-2">{t.speakerNotes}</h4>
                                <p className="text-sm text-gray-400 italic leading-relaxed">{slide.speakerNotes}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};