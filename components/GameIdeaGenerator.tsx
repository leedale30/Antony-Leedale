import React, { useState, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

export const GameIdeaGenerator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [topic, setTopic] = useState('');
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Lesson Gamifier",
            subtitle: "Turn any boring subject into an exciting classroom activity using Gemini 3.0.",
            label: "What topic do you want to gamify?",
            ph: "e.g. Fractions, Shakespeare's Hamlet, Photosynthesis",
            btn: "Gamify!",
            loading: "Creating..."
        },
        zh: {
            title: "课程游戏化生成器",
            subtitle: "利用 Gemini 3.0 将枯燥的学科变成有趣的课堂活动。",
            label: "您想把什么主题游戏化？",
            ph: "例如：分数、莎士比亚的哈姆雷特、光合作用",
            btn: "生成游戏！",
            loading: "生成中..."
        }
    }[lang];

    const generateIdea = useCallback(async () => {
        if (!ai || !topic) return;
        setIsLoading(true);
        setIdea('');

        const promptEn = `Turn this lesson topic into a fun classroom game concept.
        Topic: ${topic}

        The game design should include:
        1.  **Game Title:** Catchy and educational.
        2.  **Premise:** How does the game work? (e.g., Bingo style, Jeopardy, Team Relay, Roleplay).
        3.  **Educational Objective:** What will students learn?
        4.  **Materials Needed:** Simple things (paper, whiteboard, dice).
        5.  **Rules:** Simple step-by-step instructions.
        6.  **Engagement:** How to keep quiet students involved.
        `;

        const promptZh = `将此课程主题转化为有趣的课堂游戏概念。
        主题：${topic}

        游戏设计应包括：
        1. **游戏标题**：朗朗上口且具有教育意义。
        2. **前提**：游戏如何进行？（例如：宾果游戏、危险边缘、团队接力、角色扮演）。
        3. **教育目标**：学生将学到什么？
        4. **所需材料**：简单的物品（纸、白板、骰子）。
        5. **规则**：简单的分步说明。
        6. **参与度**：如何让安静的学生也参与进来。
        请用中文回答。
        `;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: lang === 'zh' ? promptZh : promptEn,
                config: {
                    systemInstruction: "You are an expert in gamification for education. Create engaging, inclusive games for K-12 classrooms."
                }
            });
            setIdea(response.text || "No idea generated.");
        } catch (error) {
            console.error("Failed to generate game idea:", error);
            setIdea(lang === 'zh' ? "抱歉，生成时出错。" : "Sorry, an error occurred while brainstorming.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, topic, lang]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in text-center pb-12">
            <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
            <p className="text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto mb-8 border border-white/10">
                <label className="block text-left text-gem-teal font-bold mb-2">{t.label}</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t.ph}
                        className="flex-1 p-3 bg-black/40 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-gem-teal outline-none"
                    />
                    <button
                        onClick={generateIdea}
                        disabled={isLoading || !topic}
                        className="bg-gem-teal text-black font-bold py-3 px-6 rounded-xl hover:bg-white disabled:opacity-50 transition-all"
                    >
                        {isLoading ? t.loading : t.btn}
                    </button>
                </div>
            </div>

            {idea && (
                <div className="text-left glass-panel p-8 rounded-2xl border border-gem-teal/30 shadow-2xl shadow-gem-teal/10 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-blue to-gem-teal"></div>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {idea}
                    </div>
                </div>
            )}
        </div>
    );
};