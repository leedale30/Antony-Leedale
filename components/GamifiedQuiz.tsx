
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

// --- Types & Interfaces ---
interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    type?: 'combat' | 'bonus'; 
}

type GameState = 'menu_subject' | 'menu_grade' | 'loading' | 'combat' | 'bonus' | 'victory' | 'gameover' | 'error';

// --- Constants ---
const SUBJECTS_DATA = {
    Math: { en: 'Math', zh: '数学', icon: '📐', monsterPrompt: 'geometric shape monster, calculus demon' },
    Science: { en: 'Science', zh: '科学', icon: '🧬', monsterPrompt: 'toxic sludge monster, robot mutant' },
    History: { en: 'History', zh: '历史', icon: '🏛️', monsterPrompt: 'ancient mummy warrior, steampunk soldier' },
    Language: { en: 'Language', zh: '语言', icon: '📖', monsterPrompt: 'book mimic, alphabet golem' },
    Geography: { en: 'Geography', zh: '地理', icon: '🌍', monsterPrompt: 'rock golem, tornado elemental' },
    CS: { en: 'CS', zh: '计算机', icon: '💾', monsterPrompt: 'glitch monster, cyber virus beast' },
};

const GRADES_EN = ["3rd", "5th", "8th", "High School", "University"];
const GRADES_ZH = ["三年级", "五年级", "八年级", "高中", "大学"];

// --- Utility: JSON Cleaner ---
const cleanJson = (text: string): string => {
    try {
        let cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '');
        cleaned = cleaned.trim();
        return cleaned;
    } catch (e) {
        return text;
    }
};

export const GamifiedQuiz: React.FC<{ lang: Language }> = ({ lang }) => {
    // --- State ---
    const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>('menu_subject');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    
    // RPG Stats
    const [score, setScore] = useState(0);
    const [floor, setFloor] = useState(1);
    const [playerHp, setPlayerHp] = useState(100);
    const [maxPlayerHp] = useState(100);
    const [monsterHp, setMonsterHp] = useState(100);
    const [maxMonsterHp, setMaxMonsterHp] = useState(100);
    
    // Visual State
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [screenShake, setScreenShake] = useState(false);
    const [flashColor, setFlashColor] = useState<'red' | 'green' | 'yellow' | null>(null);
    
    // Generated Assets
    const [monsterImage, setMonsterImage] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);
    
    const ai = getGeminiAI();
    const GRADES = lang === 'zh' ? GRADES_ZH : GRADES_EN;

    // --- Translations ---
    const t = {
        en: {
            title: "PIXEL QUEST",
            subtitle: "Roguelike Edu-RPG",
            start: "PRESS START",
            loading: "GENERATING FLOOR...",
            floor: "FLOOR",
            hp: "HP",
            bonus: "BONUS STAGE",
            bonusDesc: "Double Points! Logic Puzzle!",
            score: "SCORE",
            correct: "CRITICAL HIT!",
            solved: "SOLVED! +500 XP",
            wrong: "MISS!",
            failed: "LOCKED FOREVER!",
            menu: "RETRY",
            gameover: "GAME OVER",
            selectDiff: "SELECT DIFFICULTY",
            error: "CONNECTION LOST",
            tryAgain: "Try Again",
            vs: "VS",
            q: "QUEST"
        },
        zh: {
            title: "像素大冒险",
            subtitle: "Roguelike 教育 RPG",
            start: "按开始键",
            loading: "生成关卡中...",
            floor: "层数",
            hp: "生命",
            bonus: "奖励关卡",
            bonusDesc: "双倍积分！逻辑谜题！",
            score: "得分",
            correct: "暴击！",
            solved: "解锁成功！+500 XP",
            wrong: "未命中！",
            failed: "永久锁定！",
            menu: "重试",
            gameover: "游戏结束",
            selectDiff: "选择难度",
            error: "连接丢失",
            tryAgain: "重试",
            vs: "对决",
            q: "任务"
        }
    }[lang];

    // --- Game Logic ---

    const generateSprite = async (prompt: string) => {
        if (!ai) return;
        setLoadingImage(true);
        setMonsterImage(null);
        try {
            const finalPrompt = `Pixel art sprite of a ${prompt}. 
            Style: 16-bit retro RPG video game. 
            View: Front facing battle sprite. 
            Background: Solid Black (Hex #000000). 
            High contrast, vibrant colors.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: finalPrompt }] },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    setMonsterImage(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        } catch (e) {
            console.error("Sprite gen failed", e);
        } finally {
            setLoadingImage(false);
        }
    };

    const startNewFloor = useCallback(async (gradeInput?: string) => {
        if (!ai) {
            setGameState('error');
            return;
        }
        
        const currentGrade = gradeInput || selectedGrade;
        if (!currentGrade || !selectedSubjectKey) return;

        setGameState('loading');
        setMonsterImage(null); // Clear previous sprite
        
        const subjectData = SUBJECTS_DATA[selectedSubjectKey as keyof typeof SUBJECTS_DATA];
        const subjectName = subjectData[lang];
        
        // 25% Chance for a Bonus Chest Room
        const isBonus = (floor > 1 && Math.random() > 0.75);

        try {
            // 1. Trigger Image Gen (Background Process)
            if (isBonus) {
                generateSprite("magical treasure chest, golden glowing, mysterious, pixel art");
            } else {
                generateSprite(`${subjectData.monsterPrompt}, scary, boss monster, pixel art`);
            }

            // 2. Trigger Quiz Gen
            let prompt = "";
            if (isBonus) {
                prompt = `Generate 1 hard logic puzzle or riddle related to ${subjectName} (${currentGrade}).
                Format: JSON array with 1 object: { "question": string, "options": [4 strings], "correctIndex": number, "explanation": string, "type": "bonus" }.
                Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
                The question should be a brain teaser, not a standard fact.`;
            } else {
                prompt = `Generate 3 multiple-choice RPG battle questions.
                Subject: ${subjectName}
                Grade: ${currentGrade}
                Floor: ${floor}.
                Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
                Format: JSON array of objects: { "question": string, "options": [4 strings], "correctIndex": number, "explanation": string, "type": "combat" }.
                Ensure exactly 4 options per question.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const text = cleanJson(response.text || "[]");
            const data = JSON.parse(text);

            if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid Data");

            setQuestions(data);
            setCurrentQIndex(0);
            
            if (isBonus) {
                setGameState('bonus');
            } else {
                // Scale monster HP
                const newMonsterHp = 100 + (floor * 25);
                setMonsterHp(newMonsterHp);
                setMaxMonsterHp(newMonsterHp);
                setGameState('combat');
            }
        } catch (error) {
            console.error(error);
            setGameState('error');
        }
    }, [ai, selectedSubjectKey, selectedGrade, floor, lang]);

    const triggerShake = (color: 'red' | 'green' | 'yellow') => {
        setScreenShake(true);
        setFlashColor(color);
        setTimeout(() => {
            setScreenShake(false);
            setFlashColor(null);
        }, 500);
    };

    const handleAnswer = (index: number) => {
        if (!!feedbackMsg) return; // Prevent double taps

        const q = questions[currentQIndex];
        const isCorrect = index === q.correctIndex;
        const isBonus = q.type === 'bonus';
        
        if (isCorrect) {
            if (isBonus) {
                setFeedbackMsg(t.solved);
                setScore(s => s + 500);
                setPlayerHp(h => Math.min(maxPlayerHp, h + 50));
                triggerShake('yellow');
            } else {
                const points = (100 + floor * 10);
                setScore(s => s + points);
                setFeedbackMsg(`${t.correct} +${points}`);
                
                // Damage Logic
                const damage = Math.ceil(maxMonsterHp / questions.length) + 10;
                setMonsterHp(h => Math.max(0, h - damage));
                triggerShake('green');
            }
        } else {
            if (isBonus) {
                setFeedbackMsg(t.failed);
                triggerShake('red');
            } else {
                setFeedbackMsg(t.wrong);
                const dmg = 25 + (floor * 2);
                setPlayerHp(h => Math.max(0, h - dmg));
                triggerShake('red');
            }
        }

        setTimeout(() => {
            setFeedbackMsg('');
            
            if (playerHp <= 0 && !isCorrect && !isBonus) {
                setGameState('gameover');
                return;
            }

            if (isBonus) {
                setFloor(f => f + 1);
                startNewFloor();
            } else if (currentQIndex === questions.length - 1) {
                // End of floor
                setFloor(f => f + 1);
                setPlayerHp(h => Math.min(maxPlayerHp, h + 20)); // Small heal between floors
                startNewFloor();
            } else {
                setCurrentQIndex(i => i + 1);
            }
        }, 1500);
    };

    // --- Components ---

    const HealthBar = ({ current, max, color, label }: { current: number, max: number, color: string, label: string }) => (
        <div className="flex flex-col w-full max-w-[120px] md:max-w-[200px]">
            <div className="flex justify-between text-[8px] md:text-[10px] font-bold text-gray-400 mb-1">
                <span>{label}</span>
                <span>{Math.ceil(current)}/{Math.ceil(max)}</span>
            </div>
            <div className="h-2 md:h-3 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden relative">
                <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${Math.max(0, (current/max)*100)}%` }} />
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/30"></div>
            </div>
        </div>
    );

    const XboxButton = ({ label, colorClass, onClick, optionText, positionClass }: any) => (
        <div className={`absolute ${positionClass} flex flex-col items-center justify-center group pointer-events-auto`}>
            {optionText && (
                <div className={`
                    absolute mb-1 w-28 md:w-48 bg-gray-900/95 border border-white/20 p-1.5 md:p-2 rounded-lg text-[10px] md:text-xs text-center text-white font-mono pointer-events-none z-20 
                    shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all border-l-4
                    ${positionClass.includes('bottom') ? 'bottom-full mb-3 border-l-green-500' : 
                      positionClass.includes('top-2') ? 'top-full mt-3 border-l-yellow-400' :
                      positionClass.includes('left-6') ? 'top-full mt-2 border-l-blue-500' : 
                      'top-full mt-2 border-l-red-500'}
                `}>
                    {optionText}
                </div>
            )}
            <button
                onClick={onClick}
                disabled={!!feedbackMsg}
                className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all
                    flex items-center justify-center font-black text-lg md:text-2xl text-black/80
                    ${colorClass} border-t-2 border-white/40 relative overflow-hidden backdrop-brightness-110
                `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/20 pointer-events-none"></div>
                <span className="drop-shadow-sm relative z-10">{label}</span>
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col items-center justify-start p-2 md:p-4 font-mono select-none animate-fade-in pb-4 md:pb-20">
            
            {/* TV Frame - Mobile Optimized */}
            <div className={`
                relative bg-[#222] p-1 md:p-3 rounded-xl md:rounded-[2rem] 
                shadow-[0_10px_30px_rgba(0,0,0,0.6)] md:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                border-b-[4px] md:border-b-[8px] border-r-[1px] md:border-r-[2px] border-l-[1px] md:border-l-[2px] border-[#111] 
                w-full max-w-4xl aspect-[4/3] md:aspect-video flex flex-col overflow-hidden shrink-0
                ${screenShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}
            `}>
                {/* Branding */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[6px] md:text-[8px] text-gray-600 font-black tracking-[0.2em] z-20">GEMINI-VISION-3000</div>

                {/* Screen */}
                <div className="relative flex-1 bg-black rounded-lg md:rounded-xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,1)] md:shadow-[inset_0_0_80px_rgba(0,0,0,1)] border-2 md:border-4 border-[#0a0a0a]">
                    
                    {/* CRT Effects */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-40"></div>
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 z-20 pointer-events-none"></div>
                    
                    {/* Screen Flash */}
                    {flashColor && <div className={`absolute inset-0 z-30 opacity-40 mix-blend-overlay ${flashColor === 'green' ? 'bg-green-500' : flashColor === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>}

                    {/* Game Content Layer */}
                    <div className="relative z-0 h-full flex flex-col">
                        
                        {/* HUD */}
                        {(gameState === 'combat' || gameState === 'bonus') && (
                            <div className="flex justify-between p-2 md:p-4 text-[10px] md:text-xs font-bold text-white bg-black/60 backdrop-blur-sm border-b border-white/10 z-10">
                                <div className="flex gap-3 md:gap-6">
                                    <div className="text-yellow-400 flex items-center gap-1">
                                        <span>🏆</span> FLR {floor}
                                    </div>
                                    <div className="text-blue-400 flex items-center gap-1">
                                        <span>{SUBJECTS_DATA[selectedSubjectKey as keyof typeof SUBJECTS_DATA]?.icon}</span> 
                                        {SUBJECTS_DATA[selectedSubjectKey as keyof typeof SUBJECTS_DATA]?.[lang]}
                                    </div>
                                </div>
                                <div className="text-green-400 font-mono tracking-widest">{score.toString().padStart(6, '0')} PTS</div>
                            </div>
                        )}

                        {/* MENU SCREEN */}
                        {gameState === 'menu_subject' && (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:space-y-8 bg-black relative">
                                {/* Moving Grid Background */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 perspective-1000 transform rotate-x-60 scale-150 origin-bottom animate-pulse"></div>
                                
                                <div className="text-center z-10 mt-4 md:mt-0">
                                    <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-emerald-800 tracking-tighter filter drop-shadow-[0_4px_0_rgba(255,255,255,0.2)] mb-1 md:mb-2">
                                        {t.title}
                                    </h1>
                                    <p className="text-gray-500 text-[10px] md:text-xs tracking-[0.8em] uppercase font-bold">{t.subtitle}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 z-10 p-4">
                                    {Object.entries(SUBJECTS_DATA).map(([key, data]) => (
                                        <button 
                                            key={key} 
                                            onClick={() => { setSelectedSubjectKey(key); setGameState('menu_grade'); }} 
                                            className="w-20 h-20 md:w-24 md:h-24 bg-gray-900 border-2 border-gray-700 hover:border-green-400 hover:bg-green-900/30 hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] text-white rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                                        >
                                            <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">{data.icon}</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-green-300">{data[lang]}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-green-500 animate-pulse text-[10px] md:text-xs tracking-widest mt-4 md:mt-8 pb-4">{t.start}</p>
                            </div>
                        )}

                        {/* GRADE SELECTION */}
                        {gameState === 'menu_grade' && (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:space-y-8 bg-black z-10">
                                <h2 className="text-lg md:text-2xl font-bold text-green-400 uppercase tracking-wide border-b-2 border-green-900 pb-2">{t.selectDiff}</h2>
                                <div className="flex flex-col gap-2 md:gap-3 w-48 md:w-64">
                                    {GRADES.map(g => (
                                        <button 
                                            key={g} 
                                            onClick={() => { setSelectedGrade(g); startNewFloor(g); }} 
                                            className="px-4 py-2 md:px-6 md:py-3 bg-gray-900 border-l-4 border-gray-600 hover:border-green-500 hover:bg-green-900/20 text-white text-left font-bold transition-all text-xs md:text-sm group"
                                        >
                                            <span className="group-hover:mr-2 transition-all">►</span> {g}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setGameState('menu_subject')} className="text-xs text-gray-500 hover:text-white uppercase tracking-widest">Back</button>
                            </div>
                        )}

                        {/* LOADING SCREEN */}
                        {gameState === 'loading' && (
                            <div className="flex-1 flex flex-col items-center justify-center bg-black z-10">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-4 h-4 bg-green-500 animate-bounce"></div>
                                    <div className="w-4 h-4 bg-green-500 animate-bounce delay-75"></div>
                                    <div className="w-4 h-4 bg-green-500 animate-bounce delay-150"></div>
                                </div>
                                <p className="text-green-500 font-bold tracking-widest text-xs">{t.loading}</p>
                            </div>
                        )}

                        {/* GAMEPLAY SCREEN */}
                        {(gameState === 'combat' || gameState === 'bonus') && questions.length > 0 && (
                            <div className="flex-1 flex flex-col relative bg-black/90">
                                
                                {/* Battle Scene */}
                                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                    
                                    {/* Monster Sprite */}
                                    <div className="relative z-10 transform scale-125 md:scale-[2]">
                                        {loadingImage ? (
                                            <div className="w-32 h-32 flex items-center justify-center">
                                                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : monsterImage ? (
                                            <img 
                                                src={monsterImage} 
                                                alt="Monster" 
                                                className={`w-32 h-32 md:w-40 md:h-40 object-contain pixelated drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${feedbackMsg.includes('HIT') ? 'animate-pulse grayscale-0' : ''}`}
                                            />
                                        ) : (
                                            <div className="text-6xl md:text-8xl animate-bounce">{gameState === 'bonus' ? '🎁' : '👾'}</div>
                                        )}
                                    </div>

                                    {/* Feedback Overlay */}
                                    {feedbackMsg && (
                                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                                            <div className={`
                                                text-2xl md:text-5xl font-black italic px-4 py-2 md:px-8 md:py-4 
                                                bg-black border-4 rounded-xl transform -rotate-3 scale-110
                                                shadow-[10px_10px_0_rgba(0,0,0,0.5)] animate-bounce
                                                ${feedbackMsg.includes('MISS') || feedbackMsg.includes('LOCK') ? 'text-red-500 border-red-500' : 'text-yellow-400 border-yellow-400'}
                                            `}>
                                                {feedbackMsg}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Combat Stats Bar */}
                                <div className="h-16 md:h-24 bg-gray-900 border-t-2 md:border-t-4 border-white/10 flex items-center justify-between px-4 md:px-8 relative z-20">
                                    {/* Player Stats */}
                                    <HealthBar current={playerHp} max={maxPlayerHp} color="bg-green-500" label="PLAYER" />
                                    
                                    {/* Center Info */}
                                    <div className="text-center hidden md:block">
                                        {gameState === 'bonus' ? (
                                            <div className="px-4 py-2 bg-yellow-900/50 border border-yellow-500 text-yellow-400 text-xs md:text-sm rounded uppercase tracking-wider font-black animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                                ★ {t.bonus} ★
                                            </div>
                                        ) : (
                                            <div className="text-xl font-black text-red-500 italic tracking-widest">{t.vs}</div>
                                        )}
                                    </div>

                                    {/* Enemy Stats */}
                                    {gameState === 'combat' && <HealthBar current={monsterHp} max={maxMonsterHp} color="bg-red-500" label="ENEMY" />}
                                    {gameState === 'bonus' && <div className="text-yellow-400 text-xs font-bold text-right w-[120px] md:w-[200px]">{t.bonusDesc}</div>}
                                </div>

                                {/* Question Box Overlay (Bottom) */}
                                <div className={`border-t-2 md:border-t-4 border-white p-3 md:p-4 min-h-[90px] md:min-h-[120px] flex items-center justify-center text-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative z-20 ${gameState === 'bonus' ? 'bg-yellow-900/90' : 'bg-blue-900/90'}`}>
                                    <div className={`absolute top-0 left-0 text-blue-900 px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase ${gameState === 'bonus' ? 'bg-yellow-400' : 'bg-white'}`}>{gameState === 'bonus' ? 'BONUS ROUND' : `${t.q} ${currentQIndex + 1}`}</div>
                                    <p className="text-white text-xs md:text-lg font-bold leading-relaxed max-w-3xl drop-shadow-md">
                                        {questions[currentQIndex].question}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* GAME OVER SCREEN */}
                        {gameState === 'gameover' && (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:space-y-6 bg-red-900/20 z-10">
                                <h1 className="text-4xl md:text-6xl font-black text-red-600 tracking-tighter animate-pulse drop-shadow-[4px_4px_0_#000]">{t.gameover}</h1>
                                <div className="text-xl md:text-3xl text-white font-bold font-mono">{t.score}: {score}</div>
                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => { setPlayerHp(100); setScore(0); setFloor(1); setGameState('menu_subject'); }} className="px-6 py-2 md:px-8 md:py-3 bg-white text-black font-bold rounded hover:scale-105 transition-transform uppercase tracking-widest text-xs md:text-sm">
                                        {t.menu}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PHYSICAL CONTROLLER - Mobile Optimized */}
            {(gameState === 'combat' || gameState === 'bonus') && (
                <div className="relative w-full max-w-[280px] md:max-w-sm h-48 md:h-64 mt-4 md:mt-8 flex-shrink-0 mx-auto select-none touch-manipulation">
                    {/* Controller Body Hint */}
                    <div className="absolute inset-0 bg-[#2d2d2d] rounded-[2rem] md:rounded-[3rem] shadow-2xl transform scale-110 border border-white/5"></div>

                    {/* Xbox Layout: Y(Top), X(Left), B(Right), A(Bottom) */}
                    
                    {/* Y - Index 3 */}
                    <XboxButton 
                        label="Y" 
                        colorClass="bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black" 
                        positionClass="top-2 md:top-4 left-1/2 -translate-x-1/2" 
                        onClick={() => handleAnswer(3)} 
                        optionText={questions[currentQIndex]?.options[3]} 
                    />

                    {/* X - Index 2 */}
                    <XboxButton 
                        label="X" 
                        colorClass="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white" 
                        positionClass="top-1/2 left-6 md:left-8 -translate-y-1/2" 
                        onClick={() => handleAnswer(2)} 
                        optionText={questions[currentQIndex]?.options[2]} 
                    />

                    {/* B - Index 1 */}
                    <XboxButton 
                        label="B" 
                        colorClass="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white" 
                        positionClass="top-1/2 right-6 md:right-8 -translate-y-1/2" 
                        onClick={() => handleAnswer(1)} 
                        optionText={questions[currentQIndex]?.options[1]} 
                    />

                    {/* A - Index 0 */}
                    <XboxButton 
                        label="A" 
                        colorClass="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white" 
                        positionClass="bottom-2 md:bottom-4 left-1/2 -translate-x-1/2" 
                        onClick={() => handleAnswer(0)} 
                        optionText={questions[currentQIndex]?.options[0]} 
                    />
                    
                    {/* Center D-Pad / Decor - Smaller on mobile */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 bg-[#1a1a1a] rounded-full border-2 md:border-4 border-[#333] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-black shadow-[inset_0_1px_5px_rgba(255,255,255,0.2)] flex items-center justify-center">
                            <div className="text-white/20 font-black text-lg md:text-2xl font-mono">X</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
