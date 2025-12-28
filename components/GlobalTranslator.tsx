import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

const LANGUAGES = ["Spanish", "French", "Chinese (Simplified)", "Chinese (Traditional)", "Mandarin", "Arabic", "Portuguese", "Vietnamese", "Japanese", "German", "Russian"];
const TONES = ["Professional & Formal", "Warm & Friendly", "Direct & Simple", "Urgent"];

export const GlobalTranslator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [text, setText] = useState('');
    const [targetLang, setTargetLang] = useState('Spanish');
    const [tone, setTone] = useState('Professional & Formal');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Global Communicator",
            subtitle: "Bridge language barriers with parents and students instantly.",
            labelOriginal: "Original Message",
            phOriginal: "Dear parents, just a reminder that the field trip is tomorrow...",
            labelTarget: "Target Language",
            labelTone: "Tone",
            btnTranslate: "Translate Message",
            btnTranslating: "Translating...",
            labelResult: "Translation",
            copy: "Copy to Clipboard",
            placeholder: "Translation will appear here..."
        },
        zh: {
            title: "全球沟通助手",
            subtitle: "即时跨越语言障碍，与家长和学生沟通。",
            labelOriginal: "原始消息",
            phOriginal: "亲爱的家长，提醒一下明天的实地考察...",
            labelTarget: "目标语言",
            labelTone: "语气",
            btnTranslate: "翻译消息",
            btnTranslating: "正在翻译...",
            labelResult: "译文",
            copy: "复制到剪贴板",
            placeholder: "译文将显示在这里..."
        }
    }[lang];

    const handleTranslate = useCallback(async () => {
        if (!ai || !text) return;
        setIsLoading(true);

        try {
            const prompt = `Translate the following text into ${targetLang}. 
            Context: This is a message from a teacher to a parent or student.
            Tone: ${tone}.
            Ensure cultural appropriateness and clarity.
            
            Original Text: "${text}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setTranslatedText(response.text || "Translation failed.");
        } catch (error) {
            console.error(error);
            setTranslatedText("Error executing translation.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, text, targetLang, tone]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Input Side */}
                <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10">
                    <label className="block text-xs font-bold text-gem-blue-light uppercase mb-2">{t.labelOriginal}</label>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        placeholder={t.phOriginal}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-gem-blue outline-none mb-4"
                    />
                    
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">{t.labelTarget}</label>
                            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2 text-white">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">{t.labelTone}</label>
                            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-black/40 border border-gray-600 rounded-lg p-2 text-white">
                                {TONES.map(tOption => <option key={tOption} value={tOption}>{tOption}</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleTranslate}
                        disabled={isLoading || !text}
                        className="w-full bg-gem-blue text-white font-bold py-3 rounded-xl hover:bg-gem-blue-light disabled:opacity-50 transition-all"
                    >
                        {isLoading ? t.btnTranslating : t.btnTranslate}
                    </button>
                </div>

                {/* Output Side */}
                <div className="flex-1 glass-panel p-6 rounded-2xl border border-gem-blue/30 bg-gem-blue/5">
                    <label className="block text-xs font-bold text-gem-teal uppercase mb-2">{t.labelResult} ({targetLang})</label>
                    {translatedText ? (
                        <div className="prose prose-invert">
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                            <button 
                                onClick={() => navigator.clipboard.writeText(translatedText)}
                                className="mt-4 text-xs text-gem-blue-light hover:text-white"
                            >
                                {t.copy}
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 italic">
                            {t.placeholder}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};