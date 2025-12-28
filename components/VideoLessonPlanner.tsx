
import React, { useState, useCallback } from 'react';
import { getGeminiAI, fileToBase64, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconFilm, IconDownload } from './Icons';

export const VideoLessonPlanner: React.FC<{ lang: Language }> = ({ lang }) => {
    const [file, setFile] = useState<File | null>(null);
    const [gradeLevel, setGradeLevel] = useState('8th Grade');
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Video to Class",
            subtitle: "Turn any educational video into a complete lesson plan with notes and quizzes.",
            labelUpload: "Upload Video (MP4/MOV)",
            labelGrade: "Grade Level",
            btnGenerate: "Generate Lesson Package",
            btnGenerating: "Watching & Analyzing...",
            sectionSummary: "Video Summary",
            sectionVocab: "Key Vocabulary",
            sectionQuiz: "Comprehension Quiz",
            sectionDiscuss: "Discussion Questions",
            sectionActivity: "Hands-on Activity",
            copy: "Copy All"
        },
        zh: {
            title: "视频课堂助手",
            subtitle: "将任何教育视频转化为完整的教案、笔记和测验。",
            labelUpload: "上传视频 (MP4/MOV)",
            labelGrade: "年级",
            btnGenerate: "生成课程包",
            btnGenerating: "观看并分析中...",
            sectionSummary: "视频摘要",
            sectionVocab: "关键词汇",
            sectionQuiz: "理解测验",
            sectionDiscuss: "讨论问题",
            sectionActivity: "实践活动",
            copy: "复制全部"
        }
    }[lang];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const generateLesson = useCallback(async () => {
        if (!ai || !file) return;
        setIsLoading(true);
        setResult(null);

        try {
            const base64Data = await fileToBase64(file);
            
            const prompt = `Analyze this educational video for a ${gradeLevel} class.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Output a JSON object with the following fields:
            - summary: A concise paragraph summarizing the video content.
            - vocabulary: Array of objects with "term" and "definition".
            - quiz: Array of 5 multiple choice questions (objects with "question", "options" (array), "answer" (index)).
            - discussion: Array of 3 open-ended discussion questions.
            - activity: A short description of a hands-on classroom activity related to the video.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', // Flash is great for video/long context
                contents: {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: file.type, data: base64Data } }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            vocabulary: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } } 
                                } 
                            },
                            quiz: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        question: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        answer: { type: Type.INTEGER } // index
                                    }
                                }
                            },
                            discussion: { type: Type.ARRAY, items: { type: Type.STRING } },
                            activity: { type: Type.STRING }
                        }
                    }
                }
            });

            if (response.text) {
                setResult(JSON.parse(response.text));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to analyze video. Please try a shorter clip or check format.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, file, gradeLevel, lang]);

    const formatOutput = () => {
        if (!result) return "";
        let text = `Video Lesson Plan (${gradeLevel})\n\n`;
        text += `SUMMARY:\n${result.summary}\n\n`;
        text += `VOCABULARY:\n${result.vocabulary.map((v: any) => `- ${v.term}: ${v.definition}`).join('\n')}\n\n`;
        text += `QUIZ:\n${result.quiz.map((q: any, i: number) => `${i+1}. ${q.question}\n   ${q.options.map((o:string, j:number) => `${['A','B','C','D'][j]}) ${o}`).join(' ')}\n   Answer: ${['A','B','C','D'][q.answer]}`).join('\n\n')}\n\n`;
        text += `DISCUSSION:\n${result.discussion.map((d: string) => `- ${d}`).join('\n')}\n\n`;
        text += `ACTIVITY:\n${result.activity}`;
        return text;
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center flex items-center justify-center gap-3">
                <span className="text-red-500"><IconFilm /></span> {t.title}
            </h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="glass-panel p-8 rounded-2xl border border-white/10 mb-8 max-w-2xl mx-auto">
                <div className="mb-6">
                    <label className="block text-xs font-bold text-red-400 uppercase mb-2 tracking-widest">{t.labelUpload}</label>
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-black/40 hover:border-red-500 hover:bg-red-500/10'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <p className="text-sm text-gray-300 font-medium mb-1">
                                {file ? file.name : t.labelUpload}
                            </p>
                            {!file && <p className="text-xs text-gray-500">Max 50MB recommended</p>}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="video/mp4,video/quicktime" />
                    </label>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-red-400 uppercase mb-2 tracking-widest">{t.labelGrade}</label>
                    <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full glass-input p-3 outline-none">
                        {["Elementary", "Middle School", "High School", "University"].map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
                    </select>
                </div>

                <button 
                    onClick={generateLesson}
                    disabled={isLoading || !file}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 transition-all"
                >
                    {isLoading ? t.btnGenerating : t.btnGenerate}
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-2xl border border-red-500/30 animate-fade-in relative bg-black/40">
                    <button 
                        onClick={() => navigator.clipboard.writeText(formatOutput())}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs transition-colors flex items-center gap-2"
                    >
                        <IconDownload /> {t.copy}
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-red-400 mb-3 border-b border-white/10 pb-2">{t.sectionSummary}</h3>
                            <p className="text-gray-300 leading-relaxed mb-6">{result.summary}</p>

                            <h3 className="text-xl font-bold text-red-400 mb-3 border-b border-white/10 pb-2">{t.sectionVocab}</h3>
                            <ul className="space-y-3 mb-6">
                                {result.vocabulary.map((v: any, i: number) => (
                                    <li key={i} className="text-sm text-gray-300">
                                        <span className="text-white font-bold">{v.term}:</span> {v.definition}
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-xl font-bold text-red-400 mb-3 border-b border-white/10 pb-2">{t.sectionDiscuss}</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {result.discussion.map((d: string, i: number) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-red-400 mb-3 border-b border-white/10 pb-2">{t.sectionQuiz}</h3>
                            <div className="space-y-6 mb-6">
                                {result.quiz.map((q: any, i: number) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="font-bold text-white mb-2">{i+1}. {q.question}</p>
                                        <ul className="space-y-1 pl-2">
                                            {q.options.map((opt: string, j: number) => (
                                                <li key={j} className={`text-sm ${j === q.answer ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                                                    {['A','B','C','D'][j]}) {opt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-xl font-bold text-red-400 mb-3 border-b border-white/10 pb-2">{t.sectionActivity}</h3>
                            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 text-gray-200">
                                {result.activity}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
