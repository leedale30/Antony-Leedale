import React, { useState, useCallback } from 'react';
import { getGeminiAI, fileToBase64 } from '../services/geminiService';
import { IconDownload } from './Icons';
import type { Language } from '../App';

type ImageTool = 'generate' | 'analyze' | 'edit';

export const ImageTools: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTool, setActiveTool] = useState<ImageTool>('generate');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageSize, setImageSize] = useState('1K');
    const ai = getGeminiAI();

    const t = {
        en: {
            btnCreate: "Create",
            btnAnalyze: "Analyze",
            btnEdit: "Edit",
            uploadLabel: "Click to upload",
            uploadSub: "or drag and drop",
            phCreate: "e.g., A detailed diagram of a plant cell...",
            phAnalyze: "e.g., Explain the historical significance...",
            phEdit: "e.g., Add a label to this diagram...",
            labelAspect: "Aspect Ratio",
            labelRes: "Resolution",
            btnProcessing: "Processing...",
            btnAction: { generate: "Create Visual", analyze: "Analyze Image", edit: "Modify Image" },
            promptLabel: { generate: 'Describe the visual aid you need:', analyze: 'What should students notice in this image?', edit: 'How should I modify this educational image?' },
            resultTitle: { edit: 'Result', gen: 'Generated Visual' },
            insights: "Insights"
        },
        zh: {
            btnCreate: "创作",
            btnAnalyze: "分析",
            btnEdit: "编辑",
            uploadLabel: "点击上传",
            uploadSub: "或拖拽文件",
            phCreate: "例如：植物细胞的详细图解...",
            phAnalyze: "例如：解释其历史意义...",
            phEdit: "例如：给这幅图加个标签...",
            labelAspect: "长宽比",
            labelRes: "分辨率",
            btnProcessing: "处理中...",
            btnAction: { generate: "生成图像", analyze: "分析图像", edit: "修改图像" },
            promptLabel: { generate: '描述您需要的教学视觉素材：', analyze: '学生应该注意这张图的什么？', edit: '如何修改这张教学图片？' },
            resultTitle: { edit: '结果', gen: '生成的视觉素材' },
            insights: "洞察"
        }
    }[lang];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setGeneratedImage(null);
            setAnalysisResult('');
        }
    };

    const resetState = () => {
        setIsLoading(false);
        setError(null);
        setGeneratedImage(null);
        setAnalysisResult('');
    };

    const handleGenerate = useCallback(async () => {
        if (!prompt || !ai) return;
        resetState();
        setIsLoading(true);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any,
                        imageSize: imageSize as any
                    }
                }
            });
            
            let foundImage = false;
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const base64EncodeString: string = part.inlineData.data;
                    setGeneratedImage(`data:image/png;base64,${base64EncodeString}`);
                    foundImage = true;
                    break;
                }
            }
            if(!foundImage) {
                setError("No image generated.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate image.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio, imageSize, ai]);

    const handleAnalyze = useCallback(async () => {
        if (!prompt || !imageFile || !ai) return;
        resetState();
        setIsLoading(true);

        try {
            const base64Image = await fileToBase64(imageFile);
            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image,
                },
            };
            const textPart = { text: `Analyze this image for educational purposes: ${prompt}. Respond in ${lang === 'zh' ? 'Chinese' : 'English'}.` };
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: { parts: [textPart, imagePart] },
            });
            setAnalysisResult(response.text || "No analysis returned.");
        } catch (err) {
            console.error(err);
            setError('Failed to analyze image.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile, ai, lang]);

    const handleEdit = useCallback(async () => {
        if (!prompt || !imageFile || !ai) return;
        resetState();
        setIsLoading(true);
        
        try {
            const base64Image = await fileToBase64(imageFile);
            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image,
                },
            };
            const textPart = { text: prompt };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
            });

            const part = response.candidates?.[0]?.content?.parts[0];
            if (part && 'inlineData' in part && part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                setGeneratedImage(`data:image/png;base64,${base64ImageBytes}`);
            } else {
                setError('Could not get edited image.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to edit image.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile, ai]);


    const renderToolUI = () => {
        const handleSubmit = () => {
            if (activeTool === 'generate') handleGenerate();
            else if (activeTool === 'analyze') handleAnalyze();
            else if (activeTool === 'edit') handleEdit();
        };

        return (
            <>
                { (activeTool === 'analyze' || activeTool === 'edit') && (
                     <div className="w-full mb-6">
                         <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-black/20 hover:bg-black/40 hover:border-gem-blue transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">{t.uploadLabel}</span> {t.uploadSub}</p>
                                    <p className="text-xs text-gray-500">PNG, JPG</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                     </div>
                )}
                 <div className="w-full mb-6">
                    <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gem-blue-light">{t.promptLabel[activeTool]}</label>
                    <textarea
                        id="prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-4 bg-black/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gem-blue text-white"
                        placeholder={activeTool === 'generate' ? t.phCreate : activeTool === 'analyze' ? t.phAnalyze : t.phEdit}
                    />
                </div>
                 {activeTool === 'generate' && (
                    <div className="w-full mb-6 flex space-x-4">
                         <div className="flex-1">
                             <label className="block mb-2 text-sm font-medium text-gray-400">{t.labelAspect}</label>
                             <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-2 bg-black/30 border border-gray-600 rounded-lg text-white">
                                 <option value="1:1">Square (1:1)</option>
                                 <option value="16:9">Landscape (16:9)</option>
                                 <option value="4:3">Presentation (4:3)</option>
                                 <option value="3:4">Poster (3:4)</option>
                             </select>
                         </div>
                         <div className="flex-1">
                             <label className="block mb-2 text-sm font-medium text-gray-400">{t.labelRes}</label>
                             <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="w-full p-2 bg-black/30 border border-gray-600 rounded-lg text-white">
                                 <option value="1K">Standard (1K)</option>
                                 <option value="2K">High (2K)</option>
                             </select>
                         </div>
                    </div>
                )}
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-gem-blue to-gem-purple text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-gem-blue/30 disabled:opacity-50 transition-all transform hover:-translate-y-1"
                >
                    {isLoading ? t.btnProcessing : t.btnAction[activeTool]}
                </button>
            </>
        );
    };

    const renderOutput = () => {
        const resultTitle = activeTool === 'edit' ? t.resultTitle.edit : t.resultTitle.gen;
        
        return (
            <div className="w-full lg:w-1/2 p-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                         <div className="w-16 h-16 border-4 border-gem-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-gem-blue-light animate-pulse">{t.btnProcessing}</p>
                    </div>
                )}
                {error && <div className="p-4 bg-red-900/40 border border-red-500/50 text-red-200 rounded-lg text-center">{error}</div>}
                
                <div className="grid grid-cols-1 gap-6">
                   {imagePreview && (activeTool === 'analyze' || activeTool === 'edit') && (
                        <div className="glass-panel p-2 rounded-xl">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Preview</h3>
                            <img src={imagePreview} alt="Preview" className="rounded-lg w-full h-auto object-cover" />
                        </div>
                    )}
                    {generatedImage && (
                        <div className="glass-panel p-2 rounded-xl animate-fade-in">
                             <h3 className="text-xs font-bold text-gem-teal uppercase tracking-widest mb-2 px-2">{resultTitle}</h3>
                            <div className="relative group">
                                <img src={generatedImage} alt="Generated" className="rounded-lg w-full h-auto shadow-2xl" />
                                <a href={generatedImage} download="schoolclass-visual.png" className="absolute bottom-4 right-4 bg-black/70 hover:bg-gem-blue text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                    <IconDownload />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                {analysisResult && (
                    <div className="mt-6 glass-panel p-6 rounded-xl border border-gem-teal/30">
                         <h3 className="text-lg font-bold text-gem-teal mb-3">{t.insights}</h3>
                         <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">{analysisResult}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto gap-8">
            <div className="w-full lg:w-1/2 glass-panel p-8 rounded-2xl border border-white/5">
                <div className="flex justify-between space-x-2 mb-8 bg-black/40 p-1.5 rounded-xl">
                    <button onClick={() => setActiveTool('generate')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTool === 'generate' ? 'bg-gem-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.btnCreate}</button>
                    <button onClick={() => setActiveTool('analyze')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTool === 'analyze' ? 'bg-gem-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.btnAnalyze}</button>
                    <button onClick={() => setActiveTool('edit')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTool === 'edit' ? 'bg-gem-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.btnEdit}</button>
                </div>
                {renderToolUI()}
            </div>
            {renderOutput()}
        </div>
    );
};