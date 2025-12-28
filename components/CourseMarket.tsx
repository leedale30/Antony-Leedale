import React, { useState, useCallback } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconCheck, IconBook, IconAcademic } from './Icons';

interface Course {
    id: number;
    title: string;
    instructor: string;
    rating: number;
    price: string;
    description: string;
    tags: string[];
}

const SAMPLE_COURSES: Course[] = [
    { id: 1, title: "Python for Absolute Beginners", instructor: "Dr. Smith", rating: 4.8, price: "$Free", description: "Learn Python from scratch.", tags: ["CS", "Coding"] },
    { id: 2, title: "Modern World History", instructor: "Ms. Johnson", rating: 4.5, price: "$19.99", description: "A deep dive into the 20th century.", tags: ["History", "Humanities"] },
    { id: 3, title: "Advanced Calculus", instructor: "Prof. Alan", rating: 4.9, price: "$29.99", description: "Master derivatives and integrals.", tags: ["Math", "STEM"] },
];

export const CourseMarket: React.FC<{ lang: Language }> = ({ lang }) => {
    const [view, setView] = useState<'browse' | 'generate'>('browse');
    const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
    const [genTopic, setGenTopic] = useState('');
    const [generatedSyllabus, setGeneratedSyllabus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "StudyHub Marketplace",
            subtitle: "Browse courses or generate your own curriculum instantly.",
            tabBrowse: "Browse Courses",
            tabGen: "AI Course Generator",
            btnCreate: "Generate Course",
            cardStudent: "Students",
            btnEnroll: "Enroll Now",
            genLabel: "What do you want to learn?",
            genPlaceholder: "e.g. Astrophysics, Baking, Japanese History",
            genBtn: "Create Full Course",
            syllabus: "Course Syllabus"
        },
        zh: {
            title: "StudyHub 课程市场",
            subtitle: "浏览课程或即时生成您的专属课程。",
            tabBrowse: "浏览课程",
            tabGen: "AI 课程生成器",
            btnCreate: "生成课程",
            cardStudent: "学生",
            btnEnroll: "立即注册",
            genLabel: "你想学什么？",
            genPlaceholder: "例如：天体物理学，烘焙，日本历史",
            genBtn: "创建完整课程",
            syllabus: "课程大纲"
        }
    }[lang];

    const generateCourse = useCallback(async () => {
        if (!ai || !genTopic) return;
        setIsLoading(true);
        
        try {
            const prompt = `Create a comprehensive course syllabus for "${genTopic}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format as a professional course description with:
            1. **Course Title**: Catchy name.
            2. **Instructor**: AI Generated Name.
            3. **Description**: Engaging summary.
            4. **Modules**: 4-week breakdown of topics.
            5. **Prerequisites**: What is needed.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            setGeneratedSyllabus(response.text || "Failed to generate.");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, genTopic, lang]);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="flex justify-center mb-8 bg-black/40 p-1 rounded-xl w-fit mx-auto border border-white/10">
                <button onClick={() => setView('browse')} className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'browse' ? 'bg-gem-blue text-white' : 'text-gray-400 hover:text-white'}`}>{t.tabBrowse}</button>
                <button onClick={() => setView('generate')} className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'generate' ? 'bg-gem-purple text-white' : 'text-gray-400 hover:text-white'}`}>{t.tabGen}</button>
            </div>

            {view === 'browse' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-gem-blue/50 transition-all group flex flex-col">
                            <div className="h-40 bg-gradient-to-br from-gray-800 to-black rounded-xl mb-4 flex items-center justify-center">
                                <IconAcademic />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-gem-blue/20 text-gem-blue text-xs font-bold px-2 py-1 rounded uppercase">{course.tags[0]}</span>
                                <span className="text-yellow-400 font-bold text-sm">★ {course.rating}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gem-blue transition-colors">{course.title}</h3>
                            <p className="text-xs text-gray-500 mb-4">{course.instructor}</p>
                            <p className="text-gray-400 text-sm mb-6 flex-1">{course.description}</p>
                            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                                <span className="text-lg font-bold text-white">{course.price}</span>
                                <button className="text-sm bg-white/10 hover:bg-gem-blue hover:text-white px-4 py-2 rounded-lg transition-colors font-bold">
                                    {t.btnEnroll}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel p-8 rounded-2xl border border-white/10">
                    <div className="flex gap-4 mb-8">
                        <input 
                            type="text" 
                            value={genTopic}
                            onChange={(e) => setGenTopic(e.target.value)}
                            placeholder={t.genPlaceholder}
                            className="flex-1 bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-purple outline-none"
                        />
                        <button 
                            onClick={generateCourse}
                            disabled={isLoading}
                            className="bg-gem-purple text-white px-8 rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50"
                        >
                            {isLoading ? "..." : t.genBtn}
                        </button>
                    </div>
                    {generatedSyllabus && (
                        <div className="prose prose-invert max-w-none bg-black/20 p-8 rounded-xl">
                            <div className="whitespace-pre-wrap">{generatedSyllabus}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};