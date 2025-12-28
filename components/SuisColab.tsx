import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { 
    IconGroup, IconCheck, IconHeart, IconAtom, IconPi, 
    IconTools, IconGame, IconImage, IconBook, IconTranslate 
} from './Icons';

interface Project {
    id: number;
    title: string;
    author: string;
    description: string;
    subject: string;
    grade: string;
    image?: string; // Placeholder for image URL
    likes: number;
    tags: string[];
}

const SUBJECTS = [
    { id: 'Science', icon: <IconAtom />, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    { id: 'Math', icon: <IconPi />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    { id: 'Engineering', icon: <IconTools />, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    { id: 'Technology', icon: <IconGame />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
    { id: 'Arts', icon: <IconImage />, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
    { id: 'Language', icon: <IconBook />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    { id: 'Social Studies', icon: <IconTranslate />, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
];

const GRADES = ["KG", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12"];

// Dummy initial data
const INITIAL_PROJECTS: Project[] = [
    { id: 1, title: "Cardboard Hydraulic Arm", author: "Alex", subject: "Engineering", grade: "G6", description: "A robotic arm made from cardboard, syringes, and tubing. It uses water pressure to move.", likes: 12, tags: ["Physics", "DIY"] },
    { id: 2, title: "Plastic Bottle Planter", author: "Sam", subject: "Science", grade: "G4", description: "A self-watering system for classrooms using recycled bottles.", likes: 8, tags: ["Biology", "Recycling"] },
    { id: 3, title: "Scratch Maze Game", author: "Lily", subject: "Technology", grade: "G5", description: "A difficult maze game with 3 levels programmed in Scratch.", likes: 15, tags: ["CS", "Game Design"] },
    { id: 4, title: "Fractal Art", author: "Jordan", subject: "Math", grade: "G8", description: "Exploring the Mandelbrot set through digital art generation.", likes: 20, tags: ["Geometry", "Art"] },
    { id: 5, title: "Ancient Rome Minecraft", author: "Team Alpha", subject: "Social Studies", grade: "G7", description: "A full recreation of the Roman Forum in Minecraft Education Edition.", likes: 35, tags: ["History", "Gaming"] },
];

export const SuisColab: React.FC<{ lang: Language }> = ({ lang }) => {
    const [view, setView] = useState<'browse' | 'create'>('browse');
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [activeGrade, setActiveGrade] = useState<string | null>(null);
    
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    
    // Create Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newSubject, setNewSubject] = useState('Science');
    const [newGrade, setNewGrade] = useState('G6');
    const [mentorFeedback, setMentorFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const ai = getGeminiAI();

    const t = {
        en: {
            title: "SUIS COLAB",
            subtitle: "Collaborative Learning Hub",
            btnCreate: "Share Project",
            btnBrowse: "Browse Hub",
            labelTitle: "Project Title",
            labelDesc: "Description (Process, Challenges, Outcome)",
            labelSub: "Subject Area",
            labelGrade: "Grade Level",
            btnSubmit: "Post Project",
            btnMentor: "Ask AI Mentor",
            btnMentoring: "Mentoring...",
            feedbackTitle: "AI Mentor Feedback",
            likes: "Likes",
            breadcrumbs: { home: "Subjects" },
            empty: "No projects found for this grade yet. Be the first!"
        },
        zh: {
            title: "SUIS 协作平台",
            subtitle: "协作学习中心",
            btnCreate: "分享项目",
            btnBrowse: "浏览中心",
            labelTitle: "项目标题",
            labelDesc: "描述（过程，挑战，结果）",
            labelSub: "学科领域",
            labelGrade: "年级",
            btnSubmit: "发布项目",
            btnMentor: "咨询 AI 导师",
            btnMentoring: "指导中...",
            feedbackTitle: "AI 导师反馈",
            likes: "赞",
            breadcrumbs: { home: "学科" },
            empty: "该年级暂无项目。成为第一个吧！"
        }
    }[lang];

    const handleGetFeedback = useCallback(async () => {
        if (!ai || !newDesc) return;
        setIsLoading(true);
        setMentorFeedback('');

        try {
            const prompt = `Act as an encouraging ${newSubject} teacher mentor for a ${newGrade} student. 
            Analyze this project description: "${newDesc}".
            Title: "${newTitle}".
            
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.

            Provide:
            1. **Strengths**: One specific thing they did well.
            2. **Deep Thinking**: One question to challenge them further.
            3. **Next Steps**: A fun idea for Version 2.0.
            Keep the tone inspiring and age-appropriate.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setMentorFeedback(response.text || "Keep up the good work!");
        } catch (error) {
            console.error(error);
            setMentorFeedback("Could not connect to AI Mentor.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, newDesc, newTitle, newSubject, newGrade, lang]);

    const handleSubmit = () => {
        if (!newTitle || !newDesc) return;
        
        const newProject: Project = {
            id: Date.now(),
            title: newTitle,
            author: "You (Student)",
            subject: newSubject,
            grade: newGrade,
            description: newDesc,
            likes: 0,
            tags: [newSubject, newGrade]
        };

        setProjects([newProject, ...projects]);
        setView('browse');
        setActiveSubject(newSubject);
        setActiveGrade(newGrade);
        
        // Reset form
        setNewTitle('');
        setNewDesc('');
        setMentorFeedback('');
    };

    const filteredProjects = projects.filter(p => 
        (!activeSubject || p.subject === activeSubject) && 
        (!activeGrade || p.grade === activeGrade)
    );

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="bg-gradient-to-r from-gem-blue to-gem-purple text-transparent bg-clip-text">
                            {t.title}
                        </span>
                        <span className="text-sm font-normal text-gray-400 bg-white/10 px-2 py-1 rounded-full">{t.subtitle}</span>
                    </h2>
                    
                    {/* Breadcrumbs */}
                    {view === 'browse' && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                            <button 
                                onClick={() => { setActiveSubject(null); setActiveGrade(null); }} 
                                className={`hover:text-white transition-colors ${!activeSubject ? 'text-gem-blue font-bold' : ''}`}
                            >
                                {t.breadcrumbs.home}
                            </button>
                            {activeSubject && (
                                <>
                                    <span>/</span>
                                    <button 
                                        onClick={() => setActiveGrade(null)} 
                                        className={`hover:text-white transition-colors ${!activeGrade ? 'text-gem-blue font-bold' : ''}`}
                                    >
                                        {activeSubject}
                                    </button>
                                </>
                            )}
                            {activeGrade && (
                                <>
                                    <span>/</span>
                                    <span className="text-gem-blue font-bold">{activeGrade}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex space-x-4 mt-4 md:mt-0">
                    <button onClick={() => setView('browse')} className={`px-6 py-2 rounded-xl font-bold transition-all border ${view === 'browse' ? 'bg-gem-blue text-white border-gem-blue' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}>
                        {t.btnBrowse}
                    </button>
                    <button onClick={() => setView('create')} className={`px-6 py-2 rounded-xl font-bold transition-all border ${view === 'create' ? 'bg-gem-purple text-white border-gem-purple' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}>
                        {t.btnCreate}
                    </button>
                </div>
            </div>

            {/* BROWSE VIEW */}
            {view === 'browse' && (
                <>
                    {/* Level 1: Subject Selection */}
                    {!activeSubject && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                            {SUBJECTS.map(sub => (
                                <button 
                                    key={sub.id} 
                                    onClick={() => setActiveSubject(sub.id)}
                                    className={`group glass-panel p-6 rounded-2xl border ${sub.border} hover:scale-105 transition-all duration-300 text-left flex flex-col h-40 justify-between relative overflow-hidden`}
                                >
                                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${sub.bg} blur-2xl group-hover:blur-xl transition-all`}></div>
                                    <div className={`text-3xl ${sub.color}`}>{sub.icon}</div>
                                    <span className="text-xl font-bold text-white z-10">{sub.id}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Level 2: Grade Selection */}
                    {activeSubject && !activeGrade && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl text-white font-bold mb-6 flex items-center gap-2">
                                <span className={SUBJECTS.find(s=>s.id===activeSubject)?.color}>{SUBJECTS.find(s=>s.id===activeSubject)?.icon}</span>
                                {activeSubject}
                            </h3>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {GRADES.map(grade => (
                                    <button 
                                        key={grade} 
                                        onClick={() => setActiveGrade(grade)}
                                        className="glass-panel p-4 rounded-xl border border-white/10 hover:bg-white/10 hover:border-gem-blue transition-all text-center"
                                    >
                                        <span className="text-lg font-bold text-gray-200">{grade}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Level 3: Project Gallery */}
                    {activeSubject && activeGrade && (
                        <div className="animate-fade-in">
                            {filteredProjects.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 glass-panel rounded-2xl border border-white/5 border-dashed">
                                    <p className="text-2xl mb-4">📭</p>
                                    <p>{t.empty}</p>
                                    <button onClick={() => setView('create')} className="mt-4 text-gem-blue hover:underline font-bold">
                                        {t.btnCreate}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProjects.map(p => (
                                        <div key={p.id} className="glass-panel rounded-2xl overflow-hidden hover:border-gem-blue/50 transition-all cursor-pointer group flex flex-col h-full" onClick={() => setSelectedProject(p)}>
                                            <div className="h-40 bg-gradient-to-br from-gray-900 to-black relative flex items-center justify-center border-b border-white/5">
                                                <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-500">
                                                    {SUBJECTS.find(s=>s.id===p.subject)?.icon}
                                                </span>
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-mono text-gem-blue border border-gem-blue/30">
                                                    {p.grade}
                                                </div>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gem-blue transition-colors line-clamp-1">{p.title}</h3>
                                                <p className="text-xs text-gem-purple mb-4 font-bold uppercase tracking-wider">{p.author}</p>
                                                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">{p.description}</p>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex gap-2">
                                                        {p.tags.slice(0,2).map(tag => (
                                                            <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">#{tag}</span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center text-xs text-pink-400 font-bold gap-1">
                                                        <IconHeart /> {p.likes}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* CREATE VIEW */}
            {view === 'create' && (
                <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
                    {/* Form Side */}
                    <div className="w-full lg:w-1/2 glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelSub}</label>
                                <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-gem-purple transition-all">
                                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelGrade}</label>
                                <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-gem-purple transition-all">
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelTitle}</label>
                            <input 
                                type="text" 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-purple outline-none transition-all"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gem-purple uppercase mb-2">{t.labelDesc}</label>
                            <textarea 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                rows={8}
                                className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-purple outline-none resize-none transition-all"
                            />
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button 
                                onClick={handleGetFeedback}
                                disabled={isLoading || !newDesc}
                                className="flex-1 bg-white/5 text-gem-purple border border-gem-purple/50 font-bold py-3 rounded-xl hover:bg-gem-purple/20 transition-all flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        {t.btnMentoring}
                                    </>
                                ) : t.btnMentor}
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={!newTitle || !newDesc}
                                className="flex-1 bg-gradient-to-r from-gem-purple to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 transition-all"
                            >
                                {t.btnSubmit}
                            </button>
                        </div>
                    </div>

                    {/* Feedback Side */}
                    <div className="w-full lg:w-1/2">
                        {mentorFeedback ? (
                            <div className="glass-panel p-8 rounded-2xl border border-gem-purple/50 bg-gem-purple/5 animate-fade-in relative h-full">
                                <div className="absolute -top-4 -left-4 bg-gem-purple text-white p-3 rounded-xl shadow-lg border border-white/20 text-2xl">
                                    🤖
                                </div>
                                <h3 className="text-xl font-bold text-gem-purple mb-6 ml-8">{t.feedbackTitle}</h3>
                                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none whitespace-pre-wrap">
                                    {mentorFeedback}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[300px] flex items-center justify-center text-gray-500 italic p-8 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
                                <div className="text-center max-w-xs">
                                    <p className="text-4xl mb-4 opacity-50">💡</p>
                                    <p>Select your Subject and Grade, write your description, and ask the AI Mentor for advice before you post!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedProject(null)}>
                    <div className="glass-panel max-w-3xl w-full p-8 rounded-3xl border border-white/10 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/20">✕</button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-gem-blue/20 text-gem-blue text-xs font-bold uppercase tracking-wider border border-gem-blue/30">{selectedProject.subject}</span>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold border border-white/10">{selectedProject.grade}</span>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-2">{selectedProject.title}</h2>
                        <div className="flex items-center gap-2 mb-8 text-gray-400">
                            <span>By {selectedProject.author}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-pink-400"><IconHeart /> {selectedProject.likes}</span>
                        </div>
                        
                        <div className="bg-black/40 p-8 rounded-2xl border border-white/5 mb-8 text-lg text-gray-200 leading-relaxed shadow-inner">
                            {selectedProject.description}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedProject.tags.map(tag => (
                                <span key={tag} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 border border-white/5">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};