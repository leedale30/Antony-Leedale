
import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { 
    IconCertificate, IconRocket, IconBrain, IconCheck, IconClipboard, 
    IconLayers, IconMagic, IconCoffee, IconImage, IconGame, IconHeart, IconChart 
} from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ModuleDef {
    id: string;
    title: { en: string; zh: string };
    icon: React.ReactNode;
    prompt: string;
}

const MODULES: ModuleDef[] = [
    { 
        id: 'basics', 
        title: { en: 'AI Fundamentals', zh: 'AI 基础' }, 
        icon: <IconBrain />,
        prompt: 'Create a training lesson about "AI Fundamentals" for teachers. Cover: What are LLMs? How do they "think"? Key limitations (hallucinations). 3 simple ways to start using AI today.'
    },
    { 
        id: 'prompting', 
        title: { en: 'Prompt Engineering', zh: '提示词工程' }, 
        icon: <IconRocket />,
        prompt: 'Create a training lesson about "Prompt Engineering" for teachers. Explain: The "Act As" persona, Specificity, Iteration, and Few-Shot prompting (giving examples). Provide a template for a perfect prompt.'
    },
    { 
        id: 'ethics', 
        title: { en: 'Ethics & Safety', zh: '伦理与安全' }, 
        icon: <IconCheck />,
        prompt: 'Create a training lesson about "AI Ethics & Safety" in schools. Cover: Data privacy (PII), Bias in AI, Plagiarism detection realities, and how to cite AI usage.'
    },
    { 
        id: 'assessment', 
        title: { en: 'AI for Assessment', zh: 'AI 评估辅助' }, 
        icon: <IconClipboard />,
        prompt: 'Create a training lesson about using "AI for Assessment" for teachers. Cover: Designing rubrics, automated feedback generation (not just grading), analyzing student work trends, and creating quiz questions.'
    },
    { 
        id: 'differentiation', 
        title: { en: 'Differentiation Strategies', zh: '差异化教学策略' }, 
        icon: <IconLayers />,
        prompt: 'Create a training lesson about "Using AI for Differentiation". Cover: Rewriting texts for different reading levels, generating IEP accommodations, scaffolding complex tasks, and creating extension activities for advanced learners.'
    },
    { 
        id: 'planning', 
        title: { en: 'Lesson Planning Magic', zh: '教案生成魔法' }, 
        icon: <IconMagic />,
        prompt: 'Create a training lesson about "AI-Powered Lesson Planning". Cover: Generating unit outlines, creating hooks and engagement activities, generating real-world connections (PBL), and finding creative resources.'
    },
    { 
        id: 'productivity', 
        title: { en: 'Admin & Productivity', zh: '行政与生产力' }, 
        icon: <IconCoffee />,
        prompt: 'Create a training lesson about "AI for Teacher Productivity". Cover: Drafting emails to parents, writing newsletters, summarizing meeting notes, and organizing classroom schedules.'
    },
    {
        id: 'creative',
        title: { en: 'Creative AI Studio', zh: '创意 AI 工作室' },
        icon: <IconImage />,
        prompt: 'Create a training lesson about "Using AI for Creativity in the Classroom". Cover: Generating visual aids with image models, creating coloring pages, storyboarding for visual arts, and using AI as a creative writing muse.'
    },
    {
        id: 'gamification',
        title: { en: 'Gamification & Engagement', zh: '游戏化与互动' },
        icon: <IconGame />,
        prompt: 'Create a training lesson about "AI-Powered Gamification". Cover: Designing classroom escape rooms, creating RPG scenarios for history/literature, generating trivia games, and using AI to build interactive simulations.'
    },
    {
        id: 'wellbeing',
        title: { en: 'Student Wellbeing & SEL', zh: '学生身心健康与 SEL' },
        icon: <IconHeart />,
        prompt: 'Create a training lesson about "AI for Social Emotional Learning (SEL)". Cover: Generating mindfulness scripts, creating role-play scenarios for conflict resolution, and drafting support plans for students.'
    },
    {
        id: 'data',
        title: { en: 'Data-Driven Instruction', zh: '数据驱动教学' },
        icon: <IconChart />,
        prompt: 'Create a training lesson about "Data Analysis for Teachers using AI". Cover: Anonymizing data, analyzing quiz results for trends, identifying learning gaps from spreadsheets, and generating progress reports.'
    }
];

export const AiTraining: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [lessonContent, setLessonContent] = useState<string>('');
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);
    
    // Practice State
    const [userPrompt, setUserPrompt] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const ai = getGeminiAI();

    const t = {
        en: {
            title: "AI Training Academy",
            subtitle: "Master the art of teaching with Artificial Intelligence.",
            start: "Start Module",
            loading: "Generating Lesson...",
            practiceTitle: "Prompt Engineering Dojo",
            practiceDesc: "Type a prompt you would use in class. Gemini will grade it and suggest improvements.",
            phPrompt: "e.g. Write a lesson plan about history.",
            btnAnalyze: "Analyze My Prompt",
            analyzing: "Critiquing...",
            feedbackTitle: "Coach Feedback",
            select: "Select a module to begin your training."
        },
        zh: {
            title: "AI 培训学院",
            subtitle: "掌握在教学中使用人工智能的艺术。",
            start: "开始模块",
            loading: "生成课程中...",
            practiceTitle: "提示词工程道场",
            practiceDesc: "输入您想在课堂上使用的提示词。Gemini 将对其评分并提出改进建议。",
            phPrompt: "例如：写一份关于历史的教案。",
            btnAnalyze: "分析我的提示词",
            analyzing: "正在点评...",
            feedbackTitle: "教练反馈",
            select: "选择一个模块开始您的培训。"
        }
    }[lang];

    const loadModule = useCallback(async (module: ModuleDef) => {
        if (!ai) return;
        setActiveModule(module.id);
        setIsLoadingLesson(true);
        setLessonContent('');
        
        try {
            const prompt = `${module.prompt}
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format: Markdown with clear headings, bullet points, and a "Key Takeaway" box.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setLessonContent(response.text || "Failed to load lesson.");
        } catch (error) {
            console.error(error);
            setLessonContent("Error loading content.");
        } finally {
            setIsLoadingLesson(false);
        }
    }, [ai, lang]);

    const analyzePrompt = useCallback(async () => {
        if (!ai || !userPrompt) return;
        setIsAnalyzing(true);
        setFeedback('');

        try {
            const prompt = `Act as an expert AI Prompt Engineer Coach for teachers.
            Analyze this user prompt: "${userPrompt}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Provide:
            1. **Grade**: S, A, B, C, or D tier.
            2. **Strengths**: What did they do right?
            3. **Weaknesses**: What is missing? (Context, Persona, Format, Constraints?)
            4. **Improved Version**: Rewrite their prompt to be excellent.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 2048 } }
            });

            setFeedback(response.text || "Feedback unavailable.");
        } catch (error) {
            console.error(error);
            setFeedback("Error analyzing prompt.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [ai, userPrompt, lang]);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <span className="text-amber-400"><IconCertificate /></span> {t.title}
                </h2>
                <p className="text-gray-400">{t.subtitle}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Sidebar: Modules */}
                <div className="w-full lg:w-72 glass-panel rounded-2xl p-4 overflow-y-auto border border-white/10 shrink-0">
                    <div className="space-y-3">
                        {MODULES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => loadModule(m)}
                                className={`w-full text-left p-4 rounded-xl transition-all border group relative overflow-hidden ${activeModule === m.id ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                            >
                                <div className="flex items-center gap-3 z-10 relative">
                                    <div className={`text-2xl ${activeModule === m.id ? 'text-amber-400' : 'text-gray-500 group-hover:text-amber-400'}`}>{m.icon}</div>
                                    <span className="font-bold text-sm">{m.title[lang]}</span>
                                </div>
                                {activeModule === m.id && <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6 min-h-0">
                    {/* Lesson Viewer */}
                    <div className="flex-1 glass-panel rounded-2xl p-8 overflow-y-auto border border-white/10 relative bg-black/20">
                        {isLoadingLesson ? (
                            <div className="h-full flex flex-col items-center justify-center text-amber-400">
                                <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="animate-pulse">{t.loading}</p>
                            </div>
                        ) : lessonContent ? (
                            <MarkdownRenderer content={lessonContent} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                                <IconCertificate />
                                <p className="mt-4">{t.select}</p>
                            </div>
                        )}
                    </div>

                    {/* Practice Dojo */}
                    <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 bg-black/40">
                        <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
                            <span>🥋</span> {t.practiceTitle}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">{t.practiceDesc}</p>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <textarea 
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    placeholder={t.phPrompt}
                                    rows={3}
                                    className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-amber-500 outline-none text-sm resize-none"
                                />
                            </div>
                            <button 
                                onClick={analyzePrompt}
                                disabled={isAnalyzing || !userPrompt}
                                className="w-32 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
                            >
                                {isAnalyzing ? t.analyzing : t.btnAnalyze}
                            </button>
                        </div>

                        {feedback && (
                            <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t.feedbackTitle}</h4>
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <MarkdownRenderer content={feedback} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
