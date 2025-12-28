import React, { useState, useCallback } from 'react';
import { getGeminiAI, fileToBase64 } from '../services/geminiService';
import type { Language } from '../App';

export const AssessmentTools: React.FC<{ lang: Language }> = ({ lang }) => {
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [gradeLevel, setGradeLevel] = useState('10th Grade');
    const [subject, setSubject] = useState('General');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "AI Grader & Feedback",
            subtitle: "Upload handwriting or paste text for instant grading and feedback.",
            labelGrade: "Grade Level",
            labelSubject: "Subject",
            btnText: "Text Input",
            btnImage: "Upload Image",
            phText: "Paste student essay, answer, or paragraph here...",
            phImage: "Click to upload student work",
            phImageSub: "(Handwriting supported)",
            btnAction: "Grade Assignment",
            btnLoading: "Grading & Analyzing..."
        },
        zh: {
            title: "AI 智能评分与反馈",
            subtitle: "上传手写作业或粘贴文本，即时获得评分和反馈。",
            labelGrade: "年级",
            labelSubject: "科目",
            btnText: "文本输入",
            btnImage: "上传图片",
            phText: "在此粘贴学生的文章、答案或段落...",
            phImage: "点击上传学生作业",
            phImageSub: "（支持手写识别）",
            btnAction: "开始评分",
            btnLoading: "正在评分与分析..."
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

    const handleAssessment = useCallback(async () => {
        if (!ai) return;
        setIsLoading(true);
        setFeedback('');

        try {
            const systemPrompt = `You are an expert ${subject} teacher for ${gradeLevel} students. 
            Analyze the student submission provided. 
            Language: Respond in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            1. Identify the likely assignment or topic.
            2. Check for factual accuracy and conceptual understanding.
            3. Provide a grade (0-100%) based on standard rubric criteria.
            4. Provide 3 bullet points of constructive, encouraging feedback.
            5. Suggest one specific resource or practice exercise to help them improve.
            Format the output clearly using Markdown.`;

            let response;

            if (mode === 'image' && imageFile) {
                const base64Image = await fileToBase64(imageFile);
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: {
                        parts: [
                            { text: systemPrompt },
                            { inlineData: { mimeType: imageFile.type, data: base64Image } }
                        ]
                    },
                    config: { thinkingConfig: { thinkingBudget: 4000 } }
                });
            } else {
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: `System: ${systemPrompt}\n\nStudent Submission:\n${input}`,
                    config: { thinkingConfig: { thinkingBudget: 2048 } }
                });
            }

            setFeedback(response.text || "No feedback generated.");

        } catch (error) {
            console.error(error);
            setFeedback(lang === 'zh' ? "评分生成错误，请重试。" : "Error generating assessment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, mode, input, imageFile, gradeLevel, subject, lang]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-6 rounded-2xl mb-6 border border-white/10">
                <div className="flex gap-4 mb-6">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelGrade}</label>
                        <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2 text-white">
                            <option>Elementary (K-5)</option>
                            <option>Middle School (6-8)</option>
                            <option>High School (9-12)</option>
                            <option>Undergraduate</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelSubject}</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2 text-white">
                            <option>Math</option>
                            <option>English / Lit</option>
                            <option>History</option>
                            <option>Science</option>
                            <option>Foreign Language</option>
                        </select>
                    </div>
                </div>

                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setMode('text')} className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'text' ? 'bg-gem-purple text-white' : 'bg-black/20 text-gray-400'}`}>{t.btnText}</button>
                    <button onClick={() => setMode('image')} className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'image' ? 'bg-gem-purple text-white' : 'bg-black/20 text-gray-400'}`}>{t.btnImage}</button>
                </div>

                {mode === 'text' ? (
                    <textarea 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        rows={6} 
                        className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-purple outline-none" 
                        placeholder={t.phText} 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-xl bg-black/20 hover:border-gem-purple transition-all relative">
                        {imagePreview ? (
                            <img src={imagePreview} className="h-full object-contain" alt="Preview" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <p>{t.phImage}</p>
                                <p className="text-xs mt-2">{t.phImageSub}</p>
                            </div>
                        )}
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                )}
                
                <button 
                    onClick={handleAssessment} 
                    disabled={isLoading || (mode === 'text' && !input) || (mode === 'image' && !imageFile)}
                    className="w-full mt-6 bg-gradient-to-r from-gem-purple to-gem-blue text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-gem-purple/30 disabled:opacity-50 transition-all"
                >
                    {isLoading ? t.btnLoading : t.btnAction}
                </button>
            </div>

            {feedback && (
                <div className="glass-panel p-8 rounded-2xl border border-gem-purple/30 animate-fade-in">
                    <div className="prose prose-invert prose-lg max-w-none">
                         <div className="whitespace-pre-wrap">{feedback}</div>
                    </div>
                </div>
            )}
        </div>
    );
};