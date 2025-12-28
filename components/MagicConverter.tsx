import React, { useState, useCallback } from 'react';
import { getGeminiAI, fileToBase64 } from '../services/geminiService';
import type { Language } from '../App';

type ConverterMode = 'digitize' | 'extract' | 'format';

export const MagicConverter: React.FC<{ lang: Language }> = ({ lang }) => {
    const [mode, setMode] = useState<ConverterMode>('digitize');
    const [file, setFile] = useState<File | null>(null);
    const [inputText, setInputText] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Magic Resource Converter",
            subtitle: "Digitize worksheets, extract data from tables, and reformat text instantly.",
            modes: {
                digitize: "Digitize Worksheet (OCR)",
                extract: "Extract Data to CSV",
                format: "Reformat Text"
            },
            labels: {
                upload: "Upload Photo/Image",
                input: "Paste Text",
                btn: "Convert",
                loading: "Processing..."
            },
            placeholders: {
                input: "Paste your text here...",
                format: "e.g., Convert to JSON, HTML, or summarize..."
            }
        },
        zh: {
            title: "魔法资源转换器",
            subtitle: "即时数字化作业纸，从表格中提取数据，并重新格式化文本。",
            modes: {
                digitize: "数字化作业 (OCR)",
                extract: "提取数据为 CSV",
                format: "重新格式化文本"
            },
            labels: {
                upload: "上传照片/图片",
                input: "粘贴文本",
                btn: "开始转换",
                loading: "处理中..."
            },
            placeholders: {
                input: "在此粘贴文本...",
                format: "例如：转换为 JSON, HTML 或摘要..."
            }
        }
    }[lang];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(f);
        }
    };

    const processConversion = useCallback(async () => {
        if (!ai) return;
        setIsLoading(true);
        setResult('');

        try {
            let prompt = "";
            let parts: any[] = [];

            if (mode === 'digitize') {
                prompt = "Digitize this image. Extract all text, questions, and formatting. If there are math equations, output them in LaTeX. Output as clean Markdown.";
                if (file) {
                    const base64 = await fileToBase64(file);
                    parts = [
                        { text: prompt },
                        { inlineData: { mimeType: file.type, data: base64 } }
                    ];
                }
            } else if (mode === 'extract') {
                prompt = "Analyze this image. If it contains a table or list, extract the data and output it strictly as a CSV file format (Comma Separated Values). Do not add markdown code blocks.";
                if (file) {
                    const base64 = await fileToBase64(file);
                    parts = [
                        { text: prompt },
                        { inlineData: { mimeType: file.type, data: base64 } }
                    ];
                }
            } else if (mode === 'format') {
                prompt = `Reformat the following text. 
                Instruction: ${inputText.split('\n')[0]} (Treat the first line as instruction if provided, otherwise convert to structured JSON).
                Input Text: ${inputText}`;
                parts = [{ text: prompt }];
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: { parts },
                config: { thinkingConfig: { thinkingBudget: 2048 } }
            });

            setResult(response.text || "Conversion failed.");

        } catch (error) {
            console.error(error);
            setResult("An error occurred during conversion.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, mode, file, inputText]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 border border-white/10">
                <div className="flex space-x-2 mb-6 bg-black/20 p-1 rounded-lg">
                    {(Object.keys(t.modes) as ConverterMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setFile(null); setPreview(null); setResult(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === m ? 'bg-gem-teal text-black shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.modes[m]}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        {mode !== 'format' ? (
                            <div className="border-2 border-dashed border-gray-600 rounded-xl h-64 flex flex-col items-center justify-center relative hover:border-gem-teal transition-colors bg-black/20">
                                {preview ? (
                                    <img src={preview} alt="Upload" className="h-full w-full object-contain rounded-xl" />
                                ) : (
                                    <div className="text-gray-400 text-center p-4">
                                        <p className="text-2xl mb-2">📷</p>
                                        <p>{t.labels.upload}</p>
                                    </div>
                                )}
                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        ) : (
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-64 bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-teal outline-none"
                                placeholder={t.placeholders.input}
                            />
                        )}
                        
                        <button 
                            onClick={processConversion}
                            disabled={isLoading || (mode !== 'format' && !file) || (mode === 'format' && !inputText)}
                            className="w-full mt-4 bg-gem-teal text-black font-bold py-3 rounded-xl hover:bg-white disabled:opacity-50 transition-all"
                        >
                            {isLoading ? t.labels.loading : t.labels.btn}
                        </button>
                    </div>

                    <div className="flex-1">
                         <div className="h-full min-h-[300px] glass-panel bg-black/20 rounded-xl p-4 relative overflow-hidden">
                            <h3 className="text-xs font-bold text-gem-teal uppercase mb-2">Output</h3>
                            {result ? (
                                <>
                                    <div className="prose prose-invert prose-sm max-w-none h-[calc(100%-40px)] overflow-y-auto whitespace-pre-wrap">
                                        {result}
                                    </div>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(result)}
                                        className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white"
                                    >
                                        Copy
                                    </button>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                                    Result will appear here...
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};