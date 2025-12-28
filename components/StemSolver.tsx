import React, { useState, useCallback } from 'react';
import { getGeminiAI, fileToBase64 } from '../services/geminiService';
import type { Language } from '../App';

export const StemSolver: React.FC<{ lang: Language }> = ({ lang }) => {
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [solution, setSolution] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "STEM Step-by-Step",
            subtitle: "Advanced reasoning for Math & Science problems.",
            labelType: "Type Problem",
            labelUpload: "Or Upload Photo",
            phType: "e.g. Calculate the derivative of f(x) = x^3...",
            phUpload: "Snap a photo of the equation",
            btnAction: "Solve Step-by-Step",
            btnThinking: "Thinking (Gemini 3 Pro)...",
            steps: "Solution Steps"
        },
        zh: {
            title: "STEM 分步解题",
            subtitle: "针对数学和科学问题的高级推理。",
            labelType: "输入问题",
            labelUpload: "或上传照片",
            phType: "例如：计算 f(x) = x^3 的导数...",
            phUpload: "拍摄公式照片",
            btnAction: "分步求解",
            btnThinking: "思考中 (Gemini 3 Pro)...",
            steps: "解题步骤"
        }
    }[lang];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSolve = useCallback(async () => {
        if (!ai) return;
        setIsLoading(true);
        setSolution('');

        try {
            const systemPrompt = `You are an expert STEM tutor. 
            Language: Respond in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Solve the problem provided step-by-step. 
            Do NOT just give the answer. 
            Explain the logic for each step clearly so a student can understand.
            If it is a math problem, show the formula used.
            If it is a science problem, explain the concept.
            Use LaTeX formatting for math equations where possible (e.g. $E=mc^2$).`;

            let response;
            
            const config = { thinkingConfig: { thinkingBudget: 8000 } };

            if (imageFile) {
                const base64Image = await fileToBase64(imageFile);
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: {
                        parts: [
                            { text: systemPrompt + (input ? `\nAdditional Context: ${input}` : '') },
                            { inlineData: { mimeType: imageFile.type, data: base64Image } }
                        ]
                    },
                    config: config
                });
            } else {
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: `${systemPrompt}\n\nProblem: ${input}`,
                    config: config
                });
            }

            setSolution(response.text || "Could not solve problem.");

        } catch (error) {
            console.error(error);
            setSolution(lang === 'zh' ? "解题出错，请重试。" : "Error solving problem. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, input, imageFile, lang]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-6 border border-white/10">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelType}</label>
                        <textarea 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            rows={5} 
                            className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-purple outline-none" 
                            placeholder={t.phType} 
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelUpload}</label>
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-xl bg-black/20 hover:border-gem-purple transition-all relative">
                            {imagePreview ? (
                                <img src={imagePreview} className="h-full object-contain" alt="Preview" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <p>{t.phUpload}</p>
                                </div>
                            )}
                            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={handleSolve} 
                    disabled={isLoading || (!input && !imageFile)}
                    className="w-full mt-6 bg-gem-purple text-white font-bold py-3 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-all"
                >
                    {isLoading ? t.btnThinking : t.btnAction}
                </button>
            </div>

            {solution && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-purple/30 animate-fade-in">
                    <h3 className="text-xl font-bold text-gem-purple mb-4">{t.steps}</h3>
                    <div className="prose prose-invert prose-lg max-w-none">
                         <div className="whitespace-pre-wrap">{solution}</div>
                    </div>
                </div>
            )}
        </div>
    );
};