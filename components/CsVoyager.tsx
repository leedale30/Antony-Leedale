import React, { useState, useCallback, useEffect } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconCode, IconCheck, IconBook, IconSearch, IconBeaker } from './Icons';

type CourseType = 'web' | 'dsa';
type ViewMode = 'learn' | 'reference';

interface Module {
    id: string;
    title: string;
    description: string;
    icon?: string;
}

const WEB_MODULES: Module[] = [
    { id: 'html-basics', title: "HTML Basics", description: "Structure of the web. Tags, elements, and attributes.", icon: "🌐" },
    { id: 'css-intro', title: "CSS Styling", description: "Colors, fonts, and layouts. Making things look good.", icon: "🎨" },
    { id: 'js-vars', title: "JS Variables", description: "Data types, strings, numbers, and storing information.", icon: "📦" },
    { id: 'js-logic', title: "Logic & Loops", description: "If/Else statements and For loops. Controlling flow.", icon: "🔀" },
    { id: 'dom-manipulation', title: "The DOM", description: "Interacting with the page. Clicking buttons.", icon: "👆" },
];

const DSA_MODULES: Module[] = [
    { id: 'arrays', title: "Arrays & Strings", description: "Contiguous memory, sliding window, prefix sums.", icon: "🔢" },
    { id: 'linked-lists', title: "Linked Lists", description: "Nodes, pointers, reversal, and cycle detection.", icon: "🔗" },
    { id: 'stacks-queues', title: "Stacks & Queues", description: "LIFO/FIFO operations and monotonic stacks.", icon: "🥞" },
    { id: 'recursion', title: "Recursion", description: "Base cases, recursive steps, and the call stack.", icon: "🌀" },
    { id: 'sorting', title: "Sorting & Search", description: "Merge sort, Quick sort, and Binary Search.", icon: "🔍" },
    { id: 'trees', title: "Trees & Graphs", description: "DFS, BFS, traversals, and shortest paths.", icon: "🌳" },
    { id: 'dp', title: "Dynamic Programming", description: "Memoization, tabulation, and optimization.", icon: "📈" },
];

export const CsVoyager: React.FC<{ lang: Language }> = ({ lang }) => {
    const [courseType, setCourseType] = useState<CourseType>('web');
    const [activeModule, setActiveModule] = useState<string>('html-basics');
    const [viewMode, setViewMode] = useState<ViewMode>('learn');
    
    // Content States
    const [lessonContent, setLessonContent] = useState('');
    const [userCode, setUserCode] = useState('');
    const [feedback, setFeedback] = useState('');
    const [referenceContent, setReferenceContent] = useState('');
    
    // Loading States
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [isLoadingReference, setIsLoadingReference] = useState(false);

    const ai = getGeminiAI();

    // Update active module default when course changes
    useEffect(() => {
        setActiveModule(courseType === 'web' ? WEB_MODULES[0].id : DSA_MODULES[0].id);
        setLessonContent('');
        setReferenceContent('');
        setFeedback('');
        setUserCode('');
        setViewMode('learn');
    }, [courseType]);

    const t = {
        en: {
            title: "CS Voyager",
            subtitle: "Interactive Computer Science Curriculum",
            trackWeb: "Web Development",
            trackDsa: "Algorithms (DSA)",
            roadmap: "Modules",
            lesson: "Lesson & Challenge",
            editor: "Code Playground",
            reference: "Code Book Reference",
            btnStart: "Start Lesson",
            btnCheck: "Run & Check",
            btnReference: "View Patterns",
            loadingLesson: "Generating Content...",
            loadingRef: "Fetching Patterns...",
            checking: "Analyzing...",
            feedback: "AI Mentor Feedback",
            selectPrompt: "Select a module to begin.",
            switchTrack: "Switch Track"
        },
        zh: {
            title: "CS 探索者",
            subtitle: "交互式计算机科学课程",
            trackWeb: "Web 开发",
            trackDsa: "算法与数据结构",
            roadmap: "模块",
            lesson: "课程与挑战",
            editor: "代码游乐场",
            reference: "代码宝典",
            btnStart: "开始课程",
            btnCheck: "运行并检查",
            btnReference: "查看模式",
            loadingLesson: "正在生成内容...",
            loadingRef: "正在获取模式...",
            checking: "分析中...",
            feedback: "AI 导师反馈",
            selectPrompt: "选择一个模块开始。",
            switchTrack: "切换轨道"
        }
    }[lang];

    const currentModules = courseType === 'web' ? WEB_MODULES : DSA_MODULES;
    const currentModuleInfo = currentModules.find(m => m.id === activeModule);

    const generateLesson = useCallback(async (moduleId: string) => {
        if (!ai) return;
        setIsLoadingLesson(true);
        setLessonContent('');
        setFeedback('');
        setViewMode('learn');

        // Defaults
        if(courseType === 'web') {
             if(moduleId === 'html-basics') setUserCode('<h1>Hello World</h1>');
             else setUserCode('// Write your code here');
        } else {
             setUserCode('function solve(input) {\n  // Your algorithm here\n  return input;\n}');
        }

        try {
            const prompt = `Create a short, interactive coding lesson.
            Course: ${courseType === 'web' ? 'Web Development for Beginners' : 'Data Structures & Algorithms (LeetCode Style)'}.
            Module: "${currentModuleInfo?.title}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Structure:
            1. **Concept**: Explain the core concept simply. ${courseType === 'dsa' ? 'Include Time/Space Complexity.' : ''}
            2. **Real-World Use**: Why do we use this?
            3. **The Challenge**: A specific problem for the student to solve in the editor.
            4. **Starter Guide**: Hints on how to approach the code.
            
            Keep it concise and engaging.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            setLessonContent(response.text || "Failed to load lesson.");
        } catch (error) {
            console.error(error);
            setLessonContent("Error loading content.");
        } finally {
            setIsLoadingLesson(false);
        }
    }, [ai, lang, courseType, currentModuleInfo]);

    const generateReference = useCallback(async () => {
        if (!ai || !activeModule) return;
        setIsLoadingReference(true);
        setViewMode('reference');

        try {
            const prompt = `Generate a "Code Book" reference page for: "${currentModuleInfo?.title}".
            Context: Data Structures and Algorithms.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Include:
            1. **Key Templates**: Standard code patterns (e.g., if sorting, show QuickSort or MergeSort implementation).
            2. **Common Pitfalls**: What mistakes to avoid.
            3. **Cheat Sheet**: Quick breakdown of operations and Big O complexity.
            
            Format clearly in Markdown with code blocks.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            setReferenceContent(response.text || "Reference unavailable.");
        } catch (error) {
            console.error(error);
            setReferenceContent("Error loading reference.");
        } finally {
            setIsLoadingReference(false);
        }
    }, [ai, lang, activeModule, currentModuleInfo]);

    const checkCode = useCallback(async () => {
        if (!ai || !userCode) return;
        setIsCheckingCode(true);
        setFeedback('');

        try {
            const prompt = `Review this code submission.
            Course: ${courseType === 'web' ? 'Web Dev' : 'Algorithms'}.
            Topic: "${currentModuleInfo?.title}".
            User Code:
            \`\`\`
            ${userCode}
            \`\`\`
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Provide:
            1. **Status**: Pass or Needs Work.
            2. **Analysis**: Correctness ${courseType === 'dsa' ? 'and Efficiency (Big O)' : ''}.
            3. **Feedback**: Constructive tips.
            4. **Improved Version**: A clearer or optimized version of the code.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setFeedback(response.text || "Feedback unavailable.");
        } catch (error) {
            console.error(error);
            setFeedback("Error checking code.");
        } finally {
            setIsCheckingCode(false);
        }
    }, [ai, userCode, activeModule, lang, courseType, currentModuleInfo]);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            {/* Header / Track Switcher */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gem-blue/20 rounded-xl text-gem-blue-light">
                        {courseType === 'web' ? <IconCode /> : <IconBeaker />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white leading-none">{t.title}</h2>
                        <p className="text-gray-400 text-sm mt-1">{courseType === 'web' ? t.trackWeb : t.trackDsa}</p>
                    </div>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setCourseType('web')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${courseType === 'web' ? 'bg-gem-blue text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t.trackWeb}
                    </button>
                    <button 
                        onClick={() => setCourseType('dsa')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${courseType === 'dsa' ? 'bg-gem-purple text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t.trackDsa}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Sidebar: Modules */}
                <div className="w-full lg:w-64 glass-panel rounded-2xl p-4 overflow-y-auto border border-white/10 shrink-0 flex flex-col">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <IconBook /> {t.roadmap}
                    </h3>
                    <div className="space-y-2 flex-1">
                        {currentModules.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => { setActiveModule(m.id); setLessonContent(''); setViewMode('learn'); }}
                                className={`w-full text-left p-3 rounded-xl transition-all border group ${activeModule === m.id ? 'bg-white/10 border-gem-blue text-white' : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                            >
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <span>{m.icon}</span>
                                    <span>{m.title}</span>
                                </div>
                                <div className="text-[10px] opacity-50 mt-1 pl-6 line-clamp-2">{m.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                    {/* Content Pane (Lesson or Reference) */}
                    <div className="flex-1 glass-panel rounded-2xl p-6 overflow-y-auto border border-white/10 scrollbar-hide relative">
                        {/* Tab Toggle for Content Pane */}
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0f172ae6] backdrop-blur-sm p-2 -mx-2 -mt-2 rounded-xl z-10 border-b border-white/5">
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => setViewMode('learn')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === 'learn' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {t.lesson}
                                </button>
                                <button 
                                    onClick={() => { if(!referenceContent) generateReference(); else setViewMode('reference'); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === 'reference' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {t.reference}
                                </button>
                            </div>
                            {viewMode === 'learn' && (
                                <button 
                                    onClick={() => generateLesson(activeModule)}
                                    disabled={isLoadingLesson}
                                    className="bg-gem-blue/20 hover:bg-gem-blue/30 text-gem-blue text-xs font-bold py-1.5 px-3 rounded-lg transition-colors border border-gem-blue/30"
                                >
                                    {isLoadingLesson ? t.loadingLesson : t.btnStart}
                                </button>
                            )}
                        </div>

                        {viewMode === 'learn' ? (
                            lessonContent ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap">{lessonContent}</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
                                    <p className="mb-4 text-4xl opacity-30">🚀</p>
                                    <p>{t.selectPrompt}</p>
                                    <button 
                                        onClick={() => generateLesson(activeModule)}
                                        className="mt-4 text-gem-blue hover:underline font-bold"
                                    >
                                        {t.btnStart}
                                    </button>
                                </div>
                            )
                        ) : (
                            // Reference View
                            isLoadingReference ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gem-purple">
                                    <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p>{t.loadingRef}</p>
                                </div>
                            ) : referenceContent ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap">{referenceContent}</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
                                    <p className="mb-4 text-4xl opacity-30">📚</p>
                                    <p>Unlock standard patterns and cheat sheets.</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Editor Pane */}
                    <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-black/40 p-3 border-b border-white/10 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <IconCode /> {t.editor}
                            </span>
                            <button 
                                onClick={checkCode}
                                disabled={isCheckingCode || !userCode}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingCode ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <IconCheck />}
                                {isCheckingCode ? t.checking : t.btnCheck}
                            </button>
                        </div>
                        
                        <textarea
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            className="flex-1 w-full bg-[#0F172A] text-gray-300 font-mono p-4 resize-none focus:outline-none text-sm leading-relaxed"
                            spellCheck={false}
                            placeholder="// Write your solution here..."
                        />

                        {feedback && (
                            <div className="h-1/3 bg-gray-900/95 border-t border-white/10 p-4 overflow-y-auto">
                                <h4 className="text-xs font-bold text-gem-purple uppercase mb-2 flex items-center gap-2">
                                    <span>🤖</span> {t.feedback}
                                </h4>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-300">{feedback}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};