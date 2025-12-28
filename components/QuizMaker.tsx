
import React, { useState, useCallback, useRef } from 'react';
import { getGeminiAI, Type, fileToBase64 } from '../services/geminiService';
import type { Language } from '../App';
import { IconBrain, IconDownload } from './Icons';

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
}

type QuizState = 'input' | 'playing' | 'result';

export const QuizMaker: React.FC<{ lang: Language }> = ({ lang }) => {
    const [gameState, setGameState] = useState<QuizState>('input');
    const [documentContent, setDocumentContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [gradeLevel, setGradeLevel] = useState('8th Grade');
    
    // Quiz Data
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Quiz Maker",
            subtitle: "Turn documents into a gamified class quiz instantly.",
            uploadLabel: "Upload Document (Text/PDF/Image) or Paste Text",
            pastePlaceholder: "Paste text content here...",
            fileButton: "Choose File",
            generateBtn: "Generate Quiz",
            generating: "Reading Document...",
            score: "Score",
            playAgain: "Play Again",
            finalScore: "Final Score",
            correct: "Correct!",
            incorrect: "Wrong!",
            qCount: "Questions",
            grade: "Grade Level"
        },
        zh: {
            title: "测验制作器",
            subtitle: "将文档即时转化为游戏化课堂测验。",
            uploadLabel: "上传文档 (文本/PDF/图片) 或粘贴文本",
            pastePlaceholder: "在此粘贴文本内容...",
            fileButton: "选择文件",
            generateBtn: "生成测验",
            generating: "正在读取文档...",
            score: "得分",
            playAgain: "再玩一次",
            finalScore: "最终得分",
            correct: "正确！",
            incorrect: "错误！",
            qCount: "问题数量",
            grade: "年级"
        }
    }[lang];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const generateQuiz = useCallback(async () => {
        if (!ai) return;
        if (!documentContent && !file) {
            alert(lang === 'zh' ? "请提供内容" : "Please provide content");
            return;
        }

        setIsLoading(true);
        setQuestions([]);
        setScore(0);
        setCurrentQIndex(0);

        try {
            const prompt = `Create a ${numQuestions}-question multiple choice quiz based on the provided content.
            Target Audience: ${gradeLevel}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Requirements:
            - Create challenging but fair questions.
            - Ensure there are exactly 4 options per question.
            - Ensure the correctIndex is accurate (0-3).
            `;

            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER },
                    },
                    required: ["question", "options", "correctIndex"]
                }
            };

            let response;
            if (file) {
                const base64Data = await fileToBase64(file);
                response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: {
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: file.type, data: base64Data } }
                        ]
                    },
                    config: { 
                        responseMimeType: 'application/json',
                        responseSchema: schema
                    }
                });
            } else {
                response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `${prompt}\n\nContent:\n${documentContent}`,
                    config: { 
                        responseMimeType: 'application/json',
                        responseSchema: schema
                    }
                });
            }

            if (response.text) {
                const data = JSON.parse(response.text);
                if (Array.isArray(data)) {
                    setQuestions(data);
                    setGameState('playing');
                }
            }
        } catch (error) {
            console.error("Quiz generation failed", error);
            alert("Failed to generate quiz. Please try again or check your document.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, documentContent, file, numQuestions, gradeLevel, lang]);

    const handleAnswer = (index: number) => {
        if (feedback) return; // Prevent double clicking

        const isCorrect = index === questions[currentQIndex].correctIndex;
        if (isCorrect) setScore(s => s + 1);
        
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            setFeedback(null);
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
            } else {
                setGameState('result');
            }
        }, 1500);
    };

    const reset = () => {
        setGameState('input');
        setQuestions([]);
        setDocumentContent('');
        setFile(null);
        setScore(0);
        setCurrentQIndex(0);
    };

    // Refined button styles with gradients and glass effects
    const buttonStyles = [
        "bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-500/50 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]",
        "bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border-blue-500/50 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]",
        "bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 border-yellow-500/50 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]",
        "bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 border-green-500/50 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]"
    ];

    const shapes = ["▲", "◆", "●", "■"];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <span className="text-purple-400"><IconBrain /></span> {t.title}
                </h2>
                <p className="text-gray-400 text-sm">{t.subtitle}</p>
            </div>

            {gameState === 'input' && (
                <div className="flex-1 glass-panel p-8 rounded-3xl border border-purple-500/20 bg-black/40 flex flex-col gap-6 max-w-2xl mx-auto w-full">
                    <div>
                        <label className="block text-xs font-bold text-purple-400 uppercase mb-2 tracking-widest">{t.uploadLabel}</label>
                        
                        {/* File Input */}
                        <div className="mb-4">
                            <label className={`flex items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 bg-black/40 hover:border-purple-500 hover:bg-purple-500/10'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <p className="text-sm text-gray-400 font-medium">
                                        {file ? `📄 ${file.name}` : t.fileButton}
                                    </p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.jpg,.png,.jpeg" />
                            </label>
                        </div>

                        <div className="flex items-center gap-4 my-2">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">OR</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        {/* Text Area */}
                        <textarea 
                            value={documentContent}
                            onChange={(e) => setDocumentContent(e.target.value)}
                            placeholder={t.pastePlaceholder}
                            rows={6}
                            className="w-full glass-input p-4 focus:border-purple-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-purple-400 uppercase mb-2 tracking-widest">{t.qCount}</label>
                            <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-full glass-input p-3 outline-none">
                                {[3, 5, 10, 15].map(n => <option key={n} value={n} className="bg-gem-slate text-white">{n}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-purple-400 uppercase mb-2 tracking-widest">{t.grade}</label>
                            <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full glass-input p-3 outline-none">
                                <option className="bg-gem-slate text-white">Elementary</option>
                                <option className="bg-gem-slate text-white">Middle School</option>
                                <option className="bg-gem-slate text-white">High School</option>
                                <option className="bg-gem-slate text-white">University</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={generateQuiz} 
                        disabled={isLoading || (!documentContent && !file)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all transform active:scale-[0.98] border border-white/10"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t.generating}</span>
                            </div>
                        ) : t.generateBtn}
                    </button>
                </div>
            )}

            {gameState === 'playing' && questions.length > 0 && (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                    {/* Header Info */}
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="text-xl font-bold text-white bg-black/40 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
                            Q {currentQIndex + 1} / {questions.length}
                        </div>
                        <div className="text-xl font-bold text-green-400 bg-black/40 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
                            {t.score}: {score}
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 mb-8 min-h-[200px] flex items-center justify-center text-center relative overflow-hidden shadow-2xl">
                        {feedback && (
                            <div className={`absolute inset-0 flex items-center justify-center z-10 backdrop-blur-md transition-all duration-300 ${feedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <h2 className={`text-6xl font-black uppercase tracking-widest transform rotate-[-5deg] ${feedback === 'correct' ? 'text-green-400' : 'text-red-500'} drop-shadow-xl scale-125 transition-transform`}>
                                    {feedback === 'correct' ? t.correct : t.incorrect}
                                </h2>
                            </div>
                        )}
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-md">
                            {questions[currentQIndex].question}
                        </h3>
                    </div>

                    {/* Answer Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        {questions[currentQIndex].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={!!feedback}
                                className={`
                                    ${buttonStyles[idx]} 
                                    h-full min-h-[100px] rounded-2xl border border-white/10
                                    transition-all flex items-center p-6 gap-4 group
                                    disabled:opacity-80 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]
                                `}
                            >
                                <span className="text-2xl md:text-4xl font-black opacity-60 group-hover:opacity-100 transition-opacity">
                                    {shapes[idx]}
                                </span>
                                <span className="text-lg md:text-xl font-bold text-left leading-tight w-full drop-shadow-sm">
                                    {opt}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'result' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                    <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center max-w-lg w-full bg-black/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                        <h2 className="text-4xl font-black text-white mb-4">{t.finalScore}</h2>
                        
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 relative z-10 filter drop-shadow-lg">
                                {score} / {questions.length}
                            </div>
                        </div>
                        
                        <div className="mb-10 font-bold">
                            {score === questions.length ? 
                                <span className="text-3xl text-yellow-400 drop-shadow-md">🏆 Perfect!</span> : 
                                score > questions.length / 2 ? 
                                <span className="text-3xl text-blue-400 drop-shadow-md">🎉 Great Job!</span> : 
                                <span className="text-3xl text-gray-400">📚 Keep Studying!</span>
                            }
                        </div>

                        <button 
                            onClick={reset}
                            className="glass-btn w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all text-xl shadow-lg"
                        >
                            {t.playAgain}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
