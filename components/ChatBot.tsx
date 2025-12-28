
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { getGeminiAI } from '../services/geminiService';
import type { Language, Tab } from '../App';
import { IconPi } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type Mode = 'planner' | 'admin' | 'creative';

const modelConfig = {
    planner: 'gemini-3-pro-preview', 
    admin: 'gemini-3-flash-preview', 
    creative: 'gemini-3-pro-preview', 
};

// Templates with bilingual support
const TEMPLATES = {
    en: {
        planner: [
            { label: "Unit Plan", prompt: "Create a 2-week unit plan for [Topic] for [Grade Level]. Include learning objectives, daily activities, and assessments." },
            { label: "Lesson Plan", prompt: "Create a detailed 45-minute lesson plan for [Topic]. Include objectives, materials, direct instruction, guided practice, and independent practice." },
            { label: "Quiz Gen", prompt: "Generate a 10-question multiple choice quiz on [Topic] with an answer key." },
            { label: "Exit Ticket", prompt: "Create 3 exit ticket questions to check understanding of [Topic] at the end of class." },
            { label: "IEP Accommodations", prompt: "Suggest list of IEP accommodations for a student with [Challenge] in a [Subject] class." }
        ],
        admin: [
            { label: "Parent Email", prompt: "Draft a polite email to parents regarding [Topic/Event]." },
            { label: "Speech Writer", prompt: "Write a short, inspiring speech for [Event] (e.g., Morning Assembly, Graduation)." },
            { label: "Behavior Report", prompt: "Write a formal incident report describing [Incident] involving [Student] keeping a neutral tone." },
            { label: "Recommendation", prompt: "Draft a letter of recommendation for [Student Name] applying for [Program]. Highlight their [Strength]." },
            { label: "Newsletter", prompt: "Write a weekly classroom newsletter highlighting [Events/Topics]." }
        ],
        creative: [
            { label: "Story Starter", prompt: "Write 5 creative writing prompts about [Theme]." },
            { label: "Icebreakers", prompt: "Suggest 3 fun, quick icebreaker activities for [Grade Level] students." },
            { label: "Roleplay Scenario", prompt: "Design a roleplay scenario for students to learn [Concept]." },
            { label: "Class Trivia", prompt: "Generate 5 fun trivia questions about [Topic] for a class warm-up." },
            { label: "Simplify Text", prompt: "Rewrite the following text to be readable for a [Grade Level] student: [Paste Text]" }
        ]
    },
    zh: {
        planner: [
            { label: "单元计划", prompt: "为[年级]制作关于[主题]的2周单元计划。包括学习目标、日常活动和评估。" },
            { label: "详细教案", prompt: "为[主题]创建一个详细的45分钟教案。包括目标、材料、直接指导、指导练习和独立练习。" },
            { label: "测验生成", prompt: "生成关于[主题]的10道选择题测验，并附带答案。" },
            { label: "出门条 (Exit Ticket)", prompt: "设计3个问题以检查学生对[主题]的理解，用于下课前。" },
            { label: "IEP 调整", prompt: "针对[科目]课上遇到[挑战]的学生，建议一份 IEP 调整清单。" }
        ],
        admin: [
            { label: "家长邮件", prompt: "起草一封关于[主题/事件]的给家长的礼貌邮件。" },
            { label: "演讲稿", prompt: "为[活动]（例如：晨会、毕业典礼）写一篇简短、鼓舞人心的演讲稿。" },
            { label: "行为报告", prompt: "撰写一份正式的事故报告，描述涉及[学生]的[事故]，保持中立语气。" },
            { label: "推荐信", prompt: "为申请[项目]的[学生姓名]起草一封推荐信。突出他们的[优势]。" },
            { label: "班级通讯", prompt: "撰写一份每周班级通讯，重点介绍[活动/主题]。" }
        ],
        creative: [
            { label: "故事开头", prompt: "写5个关于[主题]的创意写作提示。" },
            { label: "破冰活动", prompt: "为[年级]学生建议3个有趣、快速的破冰活动。" },
            { label: "角色扮演", prompt: "设计一个角色扮演场景，让学生学习[概念]。" },
            { label: "课堂趣闻", prompt: "生成5个关于[主题]的趣味问答，作为课堂热身。" },
            { label: "简化文本", prompt: "重写以下文本，使其适合[年级]学生阅读：[粘贴文本]" }
        ]
    }
};

interface ChatBotProps {
    lang: Language;
    onNavigate: (tab: Tab) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ lang, onNavigate }) => {
  const [mode, setMode] = useState<Mode>('planner');
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false); // Mobile template toggle
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const ai = getGeminiAI();

  const t = {
      en: {
          curriculum: "Curriculum",
          admin: "Admin",
          creative: "Creative",
          welcomeTitle: "Teacher's Command Center",
          welcomeSubtitle: "Select a Quick Action below or type your request.",
          working: "Gemini is working...",
          typePlaceholder: "Type your request here...",
          send: "SEND",
          quickActions: "Quick Actions",
          tip: "Tip: You can ask follow-up questions to refine the output, like \"Make it shorter\" or \"Add more examples\".",
          featured: "New Feature",
          showTemplates: "Show Templates",
          hideTemplates: "Hide Templates"
      },
      zh: {
          curriculum: "课程设计",
          admin: "行政管理",
          creative: "创意灵感",
          welcomeTitle: "教师指挥中心",
          welcomeSubtitle: "选择下方的快速操作或直接输入您的请求。",
          working: "Gemini 正在思考...",
          typePlaceholder: "在此输入您的请求...",
          send: "发送",
          quickActions: "快速操作",
          tip: "提示：您可以追问以完善输出，例如“简短一点”或“增加更多例子”。",
          featured: "新功能",
          showTemplates: "显示模板",
          hideTemplates: "隐藏模板"
      }
  }[lang];

  useEffect(() => {
    if (ai) {
        let config: any = {};
        let sysInstruct = "";
        const langInstruction = lang === 'zh' ? " Respond in Chinese (Simplified)." : " Respond in English.";

        if (mode === 'planner') {
            sysInstruct = "You are an expert curriculum designer. Focus on standards alignment, clear objectives, and differentiation." + langInstruction;
            config = { thinkingConfig: { thinkingBudget: 4000 } };
        } else if (mode === 'admin') {
            sysInstruct = "You are a professional school administrator assistant. Be formal, polite, clear, and concise." + langInstruction;
        } else {
            sysInstruct = "You are a creative muse for teachers. Inspire engagement and fun." + langInstruction;
        }

        chatRef.current = ai.chats.create({
            model: modelConfig[mode],
            config: { systemInstruction: sysInstruct, ...config }
        });
    }
  }, [mode, ai, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const sendMessage = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatRef.current || isLoading) return;

    setIsLoading(true);
    const userInput: Message = { role: 'user', text: textToSend };
    setHistory(prev => [...prev, userInput]);
    if(!textOverride) setInput('');
    // Mobile: close templates if open
    setShowTemplates(false);

    try {
      const result = await chatRef.current.sendMessage({ message: textToSend });
      const modelResponse: Message = { role: 'model', text: result.text };
      setHistory(prev => [...prev, modelResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse: Message = { role: 'model', text: lang === 'zh' ? "抱歉，出错了。请重试。" : "Sorry, I encountered an error. Please try again." };
      setHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, lang]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const loadTemplate = (prompt: string) => {
      setInput(prompt);
      // Optional: Auto-send? Let's just fill input for review.
      setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] max-w-6xl mx-auto animate-fade-in relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
             <div className="flex space-x-1 md:space-x-2 glass-panel p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                <button onClick={() => { setMode('planner'); setHistory([]); }} className={`px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'planner' ? 'bg-gem-blue/20 text-gem-blue shadow-[0_0_15px_rgba(14,165,233,0.3)] border border-gem-blue/30' : 'text-gray-400 hover:text-white'}`}>{t.curriculum}</button>
                <button onClick={() => { setMode('admin'); setHistory([]); }} className={`px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'admin' ? 'bg-gem-teal/20 text-gem-teal shadow-[0_0_15px_rgba(45,212,191,0.3)] border border-gem-teal/30' : 'text-gray-400 hover:text-white'}`}>{t.admin}</button>
                <button onClick={() => { setMode('creative'); setHistory([]); }} className={`px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${mode === 'creative' ? 'bg-gem-purple/20 text-gem-purple shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-gem-purple/30' : 'text-gray-400 hover:text-white'}`}>{t.creative}</button>
            </div>
            
            {/* Mobile Template Toggle */}
            <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="lg:hidden w-full md:w-auto px-4 py-2 bg-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white border border-white/10"
            >
                {showTemplates ? t.hideTemplates : t.showTemplates}
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden relative">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-white/5 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
                    {history.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                                <span className="text-3xl">✨</span>
                            </div>
                            <p className="text-xl font-bold mb-2 text-glow">{t.welcomeTitle}</p>
                            <p className="text-sm">{t.welcomeSubtitle}</p>
                        </div>
                    )}
                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl backdrop-blur-md border ${msg.role === 'user' ? 'bg-gem-blue/20 border-gem-blue/30 text-white rounded-br-sm shadow-[0_0_15px_rgba(14,165,233,0.1)]' : 'bg-white/5 border-white/10 text-gray-100 rounded-bl-sm'}`}>
                                <MarkdownRenderer content={msg.text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-sm flex items-center space-x-2">
                                <span className="text-sm text-gray-400 font-mono animate-pulse">{t.working}</span>
                                <div className="w-1.5 h-1.5 bg-gem-blue-light rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-white/5 bg-black/40">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t.typePlaceholder}
                            className="flex-1 glass-input p-3 md:p-4 placeholder-gray-500 text-sm md:text-base"
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            className="glass-btn p-3 md:p-4 px-4 md:px-6 text-gem-blue-light font-bold rounded-xl text-sm md:text-base"
                        >
                            {t.send}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions Sidebar - Responsive */}
            <div className={`
                fixed inset-0 z-20 bg-black/90 p-4 transition-transform duration-300 lg:static lg:bg-transparent lg:p-0 lg:w-64 lg:block lg:transform-none lg:glass-panel lg:border lg:border-white/5 lg:overflow-y-auto lg:rounded-2xl
                ${showTemplates ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{t.quickActions}</h3>
                    <button onClick={() => setShowTemplates(false)} className="text-white p-2">✕</button>
                </div>
                
                <h3 className="hidden lg:block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.quickActions}</h3>
                
                <div className="space-y-2 h-full overflow-y-auto lg:h-auto pb-20 lg:pb-0">
                    {TEMPLATES[lang][mode].map((template, idx) => (
                        <button 
                            key={idx}
                            onClick={() => loadTemplate(template.prompt)}
                            className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-gem-blue/50 transition-all text-sm text-gray-300 group hover:shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                        >
                            <span className="block font-semibold group-hover:text-gem-blue-light">{template.label}</span>
                            <span className="block text-[10px] text-gray-500 truncate mt-1">{template.prompt}</span>
                        </button>
                    ))}
                    
                    <div className="mt-6 border-t border-white/10 pt-4">
                        <h3 className="text-[10px] font-bold text-gem-purple uppercase tracking-[0.2em] mb-2">{t.featured}</h3>
                        <button 
                            onClick={() => onNavigate('mathGlossary')}
                            className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-gem-purple/10 to-gem-blue/10 hover:from-gem-purple/20 hover:to-gem-blue/20 border border-gem-purple/30 transition-all text-sm text-white group flex items-center space-x-2"
                        >
                            <IconPi />
                            <span className="font-semibold">Math Glossary</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            {t.tip}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
