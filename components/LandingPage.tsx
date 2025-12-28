
import React from 'react';
import { IconChat, IconImage, IconVideo, IconGame, IconCheck, IconTranslate, IconBrain, IconRocket } from './Icons';
import type { Language } from '../App';

interface LandingPageProps {
    onEnter: () => void;
    lang: Language;
    toggleLang: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, toggleLang }) => {
    const t = {
        en: {
            subtitle: "The AI Operating System for Next-Gen Educators",
            enter: "LAUNCH SYSTEM",
            powered: "POWERED BY GEMINI 3.0 PRO",
            features: {
                plan: { title: "Curriculum Architect", desc: "Design unit plans & assessments instantly." },
                visual: { title: "Visual Studio", desc: "Generate 2K educational assets & diagrams." },
                video: { title: "Veo Video Engine", desc: "Create engaging lesson shorts with AI." },
                global: { title: "Global Connect", desc: "Real-time translation & cultural guides." },
                game: { title: "Gamification Core", desc: "Turn any worksheet into an adventure." },
                grade: { title: "Smart Assessment", desc: "AI grading & handwriting analysis." }
            }
        },
        zh: {
            subtitle: "下一代教育者的 AI 操作系统",
            enter: "启动系统",
            powered: "由 GEMINI 3.0 PRO 驱动",
            features: {
                plan: { title: "课程架构师", desc: "即时设计单元计划和评估。" },
                visual: { title: "视觉工作室", desc: "生成 2K 教育素材和图表。" },
                video: { title: "Veo 视频引擎", desc: "用 AI 制作引人入胜的课程短片。" },
                global: { title: "全球连接", desc: "实时翻译与文化指南。" },
                game: { title: "游戏化核心", desc: "将任何作业变成一场冒险。" },
                grade: { title: "智能评估", desc: "AI 评分与手写分析。" }
            }
        }
    }[lang];

    const features = [
        { icon: <IconChat />, ...t.features.plan, color: "text-blue-400", border: "hover:border-blue-500/50" },
        { icon: <IconImage />, ...t.features.visual, color: "text-purple-400", border: "hover:border-purple-500/50" },
        { icon: <IconVideo />, ...t.features.video, color: "text-pink-400", border: "hover:border-pink-500/50" },
        { icon: <IconTranslate />, ...t.features.global, color: "text-emerald-400", border: "hover:border-emerald-500/50" },
        { icon: <IconGame />, ...t.features.game, color: "text-orange-400", border: "hover:border-orange-500/50" },
        { icon: <IconCheck />, ...t.features.grade, color: "text-cyan-400", border: "hover:border-cyan-500/50" },
    ];

    return (
        <div className="relative z-20 w-full h-full overflow-y-auto overflow-x-hidden">
            
            {/* Top Bar - Fixed to ensure visibility while scrolling */}
            <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
                <button 
                    onClick={toggleLang}
                    className="glass-btn px-4 py-2 rounded-lg text-xs font-bold tracking-widest text-gray-300 hover:text-white backdrop-blur-md"
                >
                    {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
                </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="min-h-full w-full flex flex-col items-center justify-center p-4 md:p-6 py-20 md:py-0">
                <div className="max-w-7xl w-full flex flex-col items-center text-center space-y-8 md:space-y-12 relative">
                    
                    {/* Hero Section */}
                    <div className="space-y-4 md:space-y-6 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-mono text-gray-400 tracking-[0.2em] uppercase">{t.powered}</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            SUIS <span className="bg-gradient-to-r from-gem-blue to-gem-purple text-transparent bg-clip-text">智协</span>
                        </h1>
                        
                        <p className="text-sm md:text-xl lg:text-2xl text-gray-400 font-light tracking-wide max-w-2xl mx-auto px-4">
                            {t.subtitle}
                        </p>
                    </div>

                    {/* Launch Button */}
                    <button 
                        onClick={onEnter}
                        className="group relative px-8 py-4 md:px-12 md:py-6 bg-white text-black rounded-2xl font-black text-lg md:text-xl tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.3)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gem-blue via-gem-purple to-gem-pink opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center gap-3">
                            {t.enter} <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </button>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mt-12 pb-8 md:pb-0">
                        {features.map((f, i) => (
                            <div 
                                key={i}
                                className={`glass-panel p-6 rounded-2xl border border-white/5 ${f.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-${f.color}/10 group text-left`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`text-3xl mb-4 ${f.color} group-hover:scale-110 transition-transform duration-300 origin-left`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
                                <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Footer Decor */}
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};
