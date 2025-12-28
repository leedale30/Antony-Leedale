import React, { useState, useCallback, useRef } from 'react';
import type { GenerateVideosOperation } from '@google/genai';
import { getVeoGeminiAI, fileToBase64, getGeminiAI } from '../services/geminiService';
import { ApiKeySelector } from './ApiKeySelector';
import type { Language } from '../App';

type VideoTool = 'generate' | 'analyze';

export const VideoTools: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTool, setActiveTool] = useState<VideoTool>('generate');
    const [prompt, setPrompt] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const loadingIntervalRef = useRef<number | null>(null);

    const t = {
        en: {
            btnCreator: "Veo Creator",
            btnAnalyzer: "Video Analyzer",
            labelStartImage: "Start with an Image (Optional)",
            labelConcept: "Video Concept",
            phConcept: "e.g., A cinematic timelapse of a bean sprouting...",
            labelFormat: "Format",
            formatLand: "Landscape (TV)",
            formatPort: "Portrait (Shorts)",
            btnGenerate: "Generate Educational Video",
            btnAnalyze: "Analyze Content",
            labelUploadVid: "Upload Video",
            labelGoal: "Analysis Goal",
            phGoal: "e.g., Identify any historical inaccuracies...",
            reportTitle: "Analysis Report",
            loadingMsgs: [
                "Setting the scene for your lesson...",
                "Generating educational animations...",
                "Rendering physics and lighting...",
                "Veo is thinking hard...",
                "Almost ready to screen in class..."
            ]
        },
        zh: {
            btnCreator: "Veo 创作工具",
            btnAnalyzer: "视频分析器",
            labelStartImage: "从图片开始（可选）",
            labelConcept: "视频概念",
            phConcept: "例如：豆芽萌发的电影级延时摄影...",
            labelFormat: "格式",
            formatLand: "横屏 (电视)",
            formatPort: "竖屏 (短视频)",
            btnGenerate: "生成教育视频",
            btnAnalyze: "分析内容",
            labelUploadVid: "上传视频",
            labelGoal: "分析目标",
            phGoal: "例如：指出片段中的历史错误...",
            reportTitle: "分析报告",
            loadingMsgs: [
                "正在布置课程场景...",
                "正在生成教学动画...",
                "正在渲染物理和光影...",
                "Veo 正在努力思考...",
                "马上就可以在课堂播放了..."
            ]
        }
    }[lang];

    const startLoadingMessages = () => {
        setLoadingMessage(t.loadingMsgs[0]);
        let i = 1;
        loadingIntervalRef.current = window.setInterval(() => {
            setLoadingMessage(t.loadingMsgs[i % t.loadingMsgs.length]);
            i++;
        }, 5000);
    };

    const stopLoadingMessages = () => {
        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
        setLoadingMessage('');
    };

    const resetState = () => {
        setError(null);
        setGeneratedVideoUrl(null);
        setAnalysisResult('');
    };

    const handleGenerateVideo = useCallback(async () => {
        if (!prompt && !imageFile) {
            setError('Please provide a prompt or an image.');
            return;
        }
        resetState();
        setIsLoading(true);
        startLoadingMessages();

        try {
            const ai = getVeoGeminiAI();
            let base64Image: string | undefined = undefined;
            if (imageFile) {
                base64Image = await fileToBase64(imageFile);
            }

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                ...(base64Image && { image: { imageBytes: base64Image, mimeType: imageFile!.type } }),
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                },
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation }) as GenerateVideosOperation;
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                const response = await fetch(finalUrl);
                const videoBlob = await response.blob();
                setGeneratedVideoUrl(URL.createObjectURL(videoBlob));

            } else {
                throw new Error("Video generation completed but no download link was found.");
            }
        } catch (err: any) {
            console.error(err);
             if (err.message?.includes("Requested entity was not found")) {
                setError("API Key error. Please try selecting your key again.");
                setIsKeySelected(false);
            } else {
                setError(`Failed to generate video. ${err.message || ''}`);
            }
        } finally {
            setIsLoading(false);
            stopLoadingMessages();
        }
    }, [prompt, imageFile, aspectRatio]);
    
    const handleAnalyzeVideo = useCallback(async () => {
        const ai = getGeminiAI();
        if (!videoFile || !prompt || !ai) {
             setError("Please upload a video and provide a prompt.");
             return;
        }
        resetState();
        setIsLoading(true);
        setLoadingMessage("Extracting frames and analyzing...");

        try {
            const videoUrl = URL.createObjectURL(videoFile);
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;

            const frames: string[] = [];
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            videoElement.onloadedmetadata = async () => {
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const duration = videoElement.duration;
                const interval = Math.max(1, duration / 15);

                for (let time = 0; time < duration; time += interval) {
                    videoElement.currentTime = time;
                    await new Promise(r => videoElement.onseeked = r);
                    context?.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
                    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
                    frames.push(base64Data);
                }

                URL.revokeObjectURL(videoUrl);
                
                const imageParts = frames.map(frame => ({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: frame,
                    },
                }));
                const textPart = { text: `Context: educational analysis. Prompt: ${prompt}. Respond in ${lang === 'zh' ? 'Chinese' : 'English'}.` };

                setLoadingMessage("Gemini 3.0 Pro is analyzing...");

                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: { parts: [textPart, ...imageParts] },
                });
                
                setAnalysisResult(response.text || "No analysis generated.");
            };

        } catch(err) {
            console.error(err);
            setError("Failed to analyze video.");
        } finally {
            setIsLoading(false);
            stopLoadingMessages();
        }
    }, [videoFile, prompt, lang]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'image') {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                setVideoFile(file);
            }
        }
    };

    const renderGenerateUI = () => (
         <>
            {!isKeySelected ? <ApiKeySelector onKeySelected={() => setIsKeySelected(true)} /> :
            <div className="w-full animate-fade-in">
                <div className="w-full mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-300">{t.labelStartImage}</label>
                    <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'image')}
                        accept="image/*"
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gem-blue file:text-white hover:file:bg-gem-blue-light bg-black/30 rounded-lg p-2"
                    />
                </div>
                 <div className="w-full mb-6">
                    <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gem-blue-light">{t.labelConcept}</label>
                    <textarea
                        id="prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-4 bg-black/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gem-blue text-white"
                        placeholder={t.phConcept}
                    />
                </div>
                <div className="w-full mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-300">{t.labelFormat}</label>
                    <div className="flex space-x-4">
                        <button onClick={() => setAspectRatio('16:9')} className={`flex-1 px-4 py-3 rounded-xl border border-white/10 transition-all ${aspectRatio === '16:9' ? 'bg-gem-blue text-white shadow-lg' : 'bg-black/30 hover:bg-white/10'}`}>{t.formatLand}</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`flex-1 px-4 py-3 rounded-xl border border-white/10 transition-all ${aspectRatio === '9:16' ? 'bg-gem-blue text-white shadow-lg' : 'bg-black/30 hover:bg-white/10'}`}>{t.formatPort}</button>
                    </div>
                </div>
                <button onClick={handleGenerateVideo} disabled={isLoading} className="w-full bg-gradient-to-r from-gem-blue to-gem-purple text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
                    {isLoading ? loadingMessage : t.btnGenerate}
                </button>
            </div>
            }
        </>
    );

    const renderAnalyzeUI = () => (
        <div className="w-full animate-fade-in">
            <div className="w-full mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-300">{t.labelUploadVid}</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gem-purple file:text-white hover:file:bg-purple-400 bg-black/30 rounded-lg p-2" />
            </div>
            <div className="w-full mb-6">
                <label htmlFor="prompt-analyze" className="block mb-2 text-sm font-medium text-gem-purple">{t.labelGoal}</label>
                <textarea id="prompt-analyze" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-4 bg-black/30 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gem-purple text-white" placeholder={t.phGoal} />
            </div>
            <button onClick={handleAnalyzeVideo} disabled={isLoading} className="w-full bg-gem-purple text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
                 {isLoading ? loadingMessage : t.btnAnalyze}
            </button>
        </div>
    );
    
    return (
        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto gap-8">
            <div className="w-full lg:w-1/2 glass-panel p-8 rounded-2xl border border-white/5">
                <div className="flex justify-center space-x-2 mb-8 bg-black/40 p-1.5 rounded-xl">
                    <button onClick={() => { setActiveTool('generate'); resetState(); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTool === 'generate' ? 'bg-gem-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.btnCreator}</button>
                    <button onClick={() => { setActiveTool('analyze'); resetState(); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTool === 'analyze' ? 'bg-gem-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.btnAnalyzer}</button>
                </div>
                {activeTool === 'generate' ? renderGenerateUI() : renderAnalyzeUI()}
            </div>
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
                 {isLoading && !generatedVideoUrl && !analysisResult && (
                     <div className="text-center">
                        <div className="text-4xl animate-bounce mb-4">🎥</div>
                        <p className="text-gray-300 animate-pulse">{loadingMessage || 'Processing...'}</p>
                     </div>
                 )}
                 {error && <div className="text-center text-red-200 bg-red-900/50 p-6 rounded-xl border border-red-500/30">{error}</div>}
                 
                 {imagePreview && activeTool === 'generate' && !generatedVideoUrl && <div className="glass-panel p-2 rounded-xl"><img src={imagePreview} alt="Preview" className="rounded-lg max-w-xs h-auto opacity-70" /></div>}
                 
                 {generatedVideoUrl && (
                     <div className="glass-panel p-2 rounded-xl w-full animate-fade-in">
                        <video src={generatedVideoUrl} controls autoPlay loop className="rounded-lg w-full shadow-2xl" />
                        <a href={generatedVideoUrl} download="veo-edu-video.mp4" className="block text-center mt-2 text-gem-blue-light hover:underline text-sm">Download MP4</a>
                     </div>
                 )}
                 
                 {analysisResult && (
                    <div className="w-full glass-panel p-6 rounded-xl border border-gem-purple/30 animate-fade-in">
                         <h3 className="text-lg font-bold text-gem-purple mb-4">{t.reportTitle}</h3>
                         <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{analysisResult}</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};