import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { IconClipboard, IconChart } from './Icons';

export const SmartManager: React.FC<{ lang: Language }> = ({ lang }) => {
    const [tab, setTab] = useState<'report' | 'data'>('report');
    
    // Report Card State
    const [studentName, setStudentName] = useState('');
    const [course, setCourse] = useState('');
    const [grade, setGrade] = useState('A');
    const [traits, setTraits] = useState<string[]>([]);
    const [reportOutput, setReportOutput] = useState('');
    
    // Data Analysis State
    const [dataInput, setDataInput] = useState('');
    const [analysisOutput, setAnalysisOutput] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Smart Class Manager",
            subtitle: "Automate reports and analyze classroom data.",
            tabReport: "Report Card Writer",
            tabData: "Data Insights",
            // Report
            labelName: "Student Name",
            labelCourse: "Subject/Course",
            labelGrade: "Grade",
            labelTraits: "Attributes",
            btnGenerate: "Generate Comment",
            placeholderTraits: "e.g. Participative, Helpful, Needs focus...",
            // Data
            labelDataInput: "Paste Classroom Data (CSV)",
            placeholderData: "Name, Attendance, Math Score, Science Score\nAlice, 95%, 88, 92\nBob, 82%, 74, 65...",
            btnAnalyze: "Analyze Trends",
            btnLoading: "Processing...",
            // Traits
            traitOptions: ["Hardworking", "Creative", "Helpful", "Distracted", "Improving", "Leader", "Quiet"]
        },
        zh: {
            title: "智能班级管家",
            subtitle: "自动化报告并分析课堂数据。",
            tabReport: "成绩单评语生成",
            tabData: "数据洞察",
            // Report
            labelName: "学生姓名",
            labelCourse: "科目/课程",
            labelGrade: "成绩",
            labelTraits: "特征",
            btnGenerate: "生成评语",
            placeholderTraits: "例如：积极参与，乐于助人，需要专注...",
            // Data
            labelDataInput: "粘贴课堂数据 (CSV)",
            placeholderData: "姓名, 出勤率, 数学成绩, 科学成绩\nAlice, 95%, 88, 92\nBob, 82%, 74, 65...",
            btnAnalyze: "分析趋势",
            btnLoading: "处理中...",
            // Traits
            traitOptions: ["勤奋", "有创造力", "乐于助人", "分心", "进步中", "领导力", "安静"]
        }
    }[lang];

    const toggleTrait = (trait: string) => {
        if (traits.includes(trait)) {
            setTraits(traits.filter(t => t !== trait));
        } else {
            setTraits([...traits, trait]);
        }
    };

    const generateReport = useCallback(async () => {
        if (!ai || !studentName) return;
        setIsLoading(true);
        setReportOutput('');

        try {
            const prompt = `Write a professional report card comment for a student.
            Name: ${studentName}
            Course: ${course}
            Grade: ${grade}
            Attributes: ${traits.join(', ')}
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Tone: Professional, constructive, and encouraging. 
            Highlight strengths first, then mention areas for growth if applicable based on the grade/attributes.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setReportOutput(response.text || "Failed to generate report.");
        } catch (error) {
            console.error(error);
            setReportOutput("Error generating report.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, studentName, course, grade, traits, lang]);

    const analyzeData = useCallback(async () => {
        if (!ai || !dataInput) return;
        setIsLoading(true);
        setAnalysisOutput('');

        try {
            const prompt = `Analyze the following classroom data (CSV format).
            Data:
            ${dataInput}
            
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Provide:
            1. **General Trends**: What is the overall class performance?
            2. **Outliers**: Which students are struggling or excelling significantly?
            3. **Correlations**: Is there a link between columns (e.g. Attendance vs Score)?
            4. **Recommendations**: 2 specific actions the teacher can take.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            setAnalysisOutput(response.text || "Failed to analyze data.");
        } catch (error) {
            console.error(error);
            setAnalysisOutput("Error analyzing data.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, dataInput, lang]);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
                <div className="bg-black/40 p-1 rounded-xl flex space-x-2 border border-white/10">
                    <button 
                        onClick={() => setTab('report')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${tab === 'report' ? 'bg-gem-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <IconClipboard /> {t.tabReport}
                    </button>
                    <button 
                        onClick={() => setTab('data')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${tab === 'data' ? 'bg-gem-teal text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <IconChart /> {t.tabData}
                    </button>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/10">
                {tab === 'report' ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-1/2 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelName}</label>
                                <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-blue outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelCourse}</label>
                                    <input type="text" value={course} onChange={e => setCourse(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-gem-blue outline-none" />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelGrade}</label>
                                    <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white outline-none">
                                        {["A", "B", "C", "D", "F"].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gem-blue uppercase mb-2">{t.labelTraits}</label>
                                <div className="flex flex-wrap gap-2">
                                    {t.traitOptions.map(trait => (
                                        <button 
                                            key={trait} 
                                            onClick={() => toggleTrait(trait)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${traits.includes(trait) ? 'bg-gem-blue text-white border-gem-blue' : 'bg-transparent text-gray-400 border-gray-600 hover:border-white'}`}
                                        >
                                            {trait}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={generateReport} 
                                disabled={isLoading || !studentName}
                                className="w-full bg-gem-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all mt-4"
                            >
                                {isLoading ? t.btnLoading : t.btnGenerate}
                            </button>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="h-full min-h-[300px] bg-black/20 rounded-xl p-6 border border-white/5 relative">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Output</h3>
                                {reportOutput ? (
                                    <div className="prose prose-invert">
                                        <p className="whitespace-pre-wrap">{reportOutput}</p>
                                        <button onClick={() => navigator.clipboard.writeText(reportOutput)} className="absolute top-4 right-4 text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">Copy</button>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 italic">Result will appear here...</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-1/2">
                            <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelDataInput}</label>
                            <textarea 
                                value={dataInput}
                                onChange={e => setDataInput(e.target.value)}
                                rows={12}
                                placeholder={t.placeholderData}
                                className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm focus:border-gem-teal outline-none resize-none"
                            />
                            <button 
                                onClick={analyzeData} 
                                disabled={isLoading || !dataInput}
                                className="w-full bg-gem-teal text-white font-bold py-3 rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all mt-4"
                            >
                                {isLoading ? t.btnLoading : t.btnAnalyze}
                            </button>
                        </div>
                        <div className="w-full lg:w-1/2">
                             <div className="h-full min-h-[300px] bg-black/20 rounded-xl p-6 border border-white/5 relative">
                                <h3 className="text-xs font-bold text-gem-teal uppercase mb-4">AI Analysis</h3>
                                {analysisOutput ? (
                                    <div className="prose prose-invert max-w-none">
                                        <div className="whitespace-pre-wrap">{analysisOutput}</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 italic">Analysis will appear here...</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};