
import React, { useState, useCallback, useRef } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { IconHeart, IconSun, IconChat, IconClipboard } from './Icons';

type Tab = 'checkin' | 'plan' | 'mindfulness';

export const StudentWellbeing: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<Tab>('checkin');

    const t = {
        en: {
            title: "Student Wellbeing",
            subtitle: "Tools for emotional support, daily check-ins, and mindfulness.",
            tabs: { checkin: "Check-in Builder", plan: "Support Plan", mindfulness: "Mindfulness Coach" }
        },
        zh: {
            title: "学生身心健康",
            subtitle: "情感支持、每日签到和正念练习工具。",
            tabs: { checkin: "签到生成器", plan: "支持计划", mindfulness: "正念教练" }
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-orange-400"><IconSun /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {(Object.keys(t.tabs) as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.tabs[tab]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-6 border border-orange-500/20 bg-black/40 relative overflow-hidden flex flex-col">
                {activeTab === 'checkin' && <CheckInBuilder lang={lang} />}
                {activeTab === 'plan' && <SupportPlanGenerator lang={lang} />}
                {activeTab === 'mindfulness' && <MindfulnessCoach lang={lang} />}
            </div>
        </div>
    );
};

const CheckInBuilder: React.FC<{ lang: Language }> = ({ lang }) => {
    const [grade, setGrade] = useState('Middle School');
    const [vibe, setVibe] = useState('Fun & Creative');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            labelGrade: "Grade Level",
            labelVibe: "Question Vibe",
            btnGenerate: "Generate Questions",
            loading: "Creating questions...",
            vibes: ["Fun & Creative", "Deep & Reflective", "Weekend/Monday", "Gratitude", "Team Building"],
            grades: ["Elementary", "Middle School", "High School"]
        },
        zh: {
            labelGrade: "年级",
            labelVibe: "问题氛围",
            btnGenerate: "生成问题",
            loading: "正在创建问题...",
            vibes: ["有趣创意", "深度反思", "周末/周一", "感恩", "团队建设"],
            grades: ["小学", "初中", "高中"]
        }
    }[lang];

    const generateQuestions = useCallback(async () => {
        if (!ai) return;
        setIsLoading(true);
        try {
            const prompt = `Generate 5 creative "Morning Meeting" or "Advisory" check-in questions for ${grade} students.
            Vibe: ${vibe}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Keep them engaging and age-appropriate. Avoid yes/no questions.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setResult(response.text || "");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, grade, vibe, lang]);

    return (
        <div className="h-full flex flex-col max-w-3xl mx-auto w-full">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-orange-400 uppercase mb-2">{t.labelGrade}</label>
                    <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none">
                        {t.grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-orange-400 uppercase mb-2">{t.labelVibe}</label>
                    <select value={vibe} onChange={e => setVibe(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none">
                        {t.vibes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            
            <button 
                onClick={generateQuestions} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl hover:scale-[1.01] transition-all shadow-lg mb-8 disabled:opacity-50"
            >
                {isLoading ? t.loading : t.btnGenerate}
            </button>

            {result && (
                <div className="flex-1 glass-panel p-8 rounded-2xl border border-white/10 overflow-y-auto animate-fade-in bg-black/20">
                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">{result}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SupportPlanGenerator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [observation, setObservation] = useState('');
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            labelObs: "Student Observation / Concern",
            phObs: "e.g. Student seems withdrawn lately, head on desk frequently, grades dropping in Math...",
            btn: "Draft Support Plan",
            loading: "Drafting plan...",
            disclaimer: "Note: This is an AI suggestion for non-clinical school support strategies."
        },
        zh: {
            labelObs: "学生观察 / 关注点",
            phObs: "例如：学生最近显得孤僻，经常趴在桌子上，数学成绩下降...",
            btn: "起草支持计划",
            loading: "正在起草计划...",
            disclaimer: "注意：这是针对非临床学校支持策略的 AI 建议。"
        }
    }[lang];

    const generatePlan = useCallback(async () => {
        if (!ai || !observation) return;
        setIsLoading(true);
        try {
            const prompt = `Create a gentle, actionable student wellbeing support plan based on this observation: "${observation}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format using Markdown:
            1. **Potential Triggers/Causes**: Brief hypothesis (non-medical).
            2. **In-Class Strategies**: 3 simple things the teacher can do.
            3. **Conversation Starters**: How to approach the student.
            4. **Goal**: A small, achievable wellbeing goal.
            Tone: Empathetic, supportive, and professional.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 2048 } }
            });
            setPlan(response.text || "");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, observation, lang]);

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
                <label className="block text-xs font-bold text-orange-400 uppercase mb-2">{t.labelObs}</label>
                <textarea 
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    placeholder={t.phObs}
                    rows={4}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-orange-500 outline-none resize-none"
                />
                <button 
                    onClick={generatePlan} 
                    disabled={isLoading || !observation}
                    className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                    {isLoading ? t.loading : t.btn}
                </button>
                <p className="text-[10px] text-gray-500 mt-2 text-center">{t.disclaimer}</p>
            </div>

            {plan && (
                <div className="flex-1 glass-panel p-8 rounded-2xl border border-orange-500/20 overflow-y-auto animate-fade-in relative bg-black/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">{plan}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MindfulnessCoach: React.FC<{ lang: Language }> = ({ lang }) => {
    const [energy, setEnergy] = useState('High / Chaotic');
    const [duration, setDuration] = useState('2 Minutes');
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            labelEnergy: "Class Energy Level",
            labelDuration: "Duration",
            btn: "Write Mindfulness Script",
            loading: "Breathing in...",
            energies: ["High / Chaotic", "Low / Sleepy", "Anxious / Test Prep", "Post-Recess"],
            durations: ["1 Minute", "2 Minutes", "5 Minutes"]
        },
        zh: {
            labelEnergy: "班级能量水平",
            labelDuration: "时长",
            btn: "编写正念脚本",
            loading: "吸气...",
            energies: ["高 / 混乱", "低 / 困倦", "焦虑 / 考前", "课间休息后"],
            durations: ["1 分钟", "2 分钟", "5 分钟"]
        }
    }[lang];

    const generateScript = useCallback(async () => {
        if (!ai) return;
        setIsLoading(true);
        try {
            const prompt = `Write a short, calming mindfulness script for a teacher to read to the class.
            Current Class Energy: ${energy}.
            Goal: ${energy.includes('High') ? 'Calm down' : energy.includes('Low') ? 'Energize gently' : 'Focus'}.
            Duration: ${duration}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Structure:
            - Gentle opening.
            - Breathing instruction (Inhale... Exhale...).
            - Short visualization or body scan suitable for the energy level.
            - Positive closing.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setScript(response.text || "");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, energy, duration, lang]);

    return (
        <div className="h-full flex flex-col md:flex-row gap-8">
            {/* Controls */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <label className="block text-xs font-bold text-orange-400 uppercase mb-2">{t.labelEnergy}</label>
                    <select value={energy} onChange={e => setEnergy(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none mb-4">
                        {t.energies.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>

                    <label className="block text-xs font-bold text-orange-400 uppercase mb-2">{t.labelDuration}</label>
                    <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none mb-6">
                        {t.durations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <button 
                        onClick={generateScript} 
                        disabled={isLoading}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
                    >
                        {isLoading ? t.loading : t.btn}
                    </button>
                </div>

                {/* Breathing Visual */}
                <div className="flex-1 flex items-center justify-center p-8 glass-panel rounded-2xl border border-white/5 bg-black/20">
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 bg-orange-500/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-8 bg-orange-300/30 rounded-full backdrop-blur-sm flex items-center justify-center border border-white/10">
                            <span className="text-2xl">🧘</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Script Output */}
            <div className="w-full md:w-2/3 glass-panel p-8 rounded-2xl border border-white/10 overflow-y-auto bg-black/30 relative">
                {script ? (
                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="whitespace-pre-wrap leading-loose font-serif text-gray-200">{script}</div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 italic">
                        Select energy level and generate a script...
                    </div>
                )}
            </div>
        </div>
    );
};
