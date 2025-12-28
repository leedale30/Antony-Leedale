
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

type GameState = 'menu_subject' | 'menu_grade' | 'loading' | 'combat' | 'bonus' | 'victory' | 'gameover';

const SUBJECTS = [
    { id: 'Math', icon: '📐', color: 'text-blue-400' },
    { id: 'Science', icon: '🧬', color: 'text-green-400' },
    { id: 'History', icon: '🏛️', color: 'text-yellow-400' },
    { id: 'Language', icon: '📖', color: 'text-pink-400' },
    { id: 'Geography', icon: '🌍', color: 'text-cyan-400' },
    { id: 'CS', icon: '💾', color: 'text-purple-400' },
];

const GRADES = ["3rd", "5th", "8th", "High School", "University"];

export const GamifiedQuiz: React.FC<{ lang: Language }> = ({ lang }) => {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>('menu_subject');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    
    // RPG Stats
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [floor, setFloor] = useState(1);
    const [playerHp, setPlayerHp] = useState(100);
    const [maxPlayerHp] = useState(100);
    const [monsterHp, setMonsterHp] = useState(100);
    const [maxMonsterHp, setMaxMonsterHp] = useState(100);
    
    // Visuals
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [attackAnim, setAttackAnim] = useState<'none' | 'player' | 'monster'>('none');
    const [isBonusFloor, setIsBonusFloor] = useState(false);

    const ai = getGeminiAI();

    const t = {
        en: {
            title: "PIXEL QUEST",
            subtitle: "Roguelike Battle",
            start: "PRESS START",
            loading: "GENERATING FLOOR...",
            floor: "FLOOR",
            hp: "HP",
            bonus: "BONUS ROUND",
            score: "SCORE",
            combo: "COMBO",
            correct: "CRITICAL HIT!",
            wrong: "DODGED!",
            menu: "RETRY",
            gameover: "QUEST FAILED"
        },
        zh: {
            title: "像素大冒险",
            subtitle: "Roguelike 挑战",
            start: "按开始键",
            loading: "生成关卡中...",
            floor: "层数",
            hp: "生命",
            bonus: "奖励关卡",
            score: "得分",
            combo: "连击",
            correct: "暴击！",
            wrong: "被躲开了！",
            menu: "重试",
            gameover: "挑战失败"
        }
    }[lang];

    const startNewFloor = useCallback(async (isBonus = false) => {
        if (!ai || !selectedSubject || !selectedGrade) return;
        setGameState('loading');
        setIsBonusFloor(isBonus);
        
        try {
            const prompt = `Generate 3 ${isBonus ? 'difficult' : 'standard'} multiple-choice questions for a pixel RPG.
            Subject: ${selectedSubject}
            Grade: ${selectedGrade}
            Theme: Roguelike dungeon floor ${floor}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Format: JSON array of objects with {question, options[4], correctIndex, explanation}.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                setQuestions(data);
                setCurrentQIndex(0);
                const newMonsterHp = 100 + (floor * 15) * (isBonus ? 1.5 : 1);
                setMonsterHp(newMonsterHp);
                setMaxMonsterHp(newMonsterHp);
                setGameState('combat');
            }
        } catch (error) {
            console.error(error);
            setGameState('menu_subject');
        }
    }, [ai, selectedSubject, selectedGrade, floor, lang]);

    const handleAnswer = (index: number) => {
        const q = questions[currentQIndex];
        const isCorrect = index === q.correctIndex;
        
        if (isCorrect) {
            setAttackAnim('player');
            const points = (100 + streak * 20) * (isBonusFloor ? 5 : 1);
            setScore(s => s + points);
            setStreak(s => s + 1);
            setFeedbackMsg(`${t.correct} +${points}`);
            
            const damage = Math.ceil(maxMonsterHp / 3) + 10;
            setMonsterHp(h => Math.max(0, h - damage));
        } else {
            setAttackAnim('monster');
            setStreak(0);
            setFeedbackMsg(t.wrong);
            const dmg = 20 + floor;
            setPlayerHp(h => Math.max(0, h - dmg));
        }

        setTimeout(() => {
            setAttackAnim('none');
            setFeedbackMsg('');
            if (playerHp <= 0) {
                setGameState('gameover');
            } else if (monsterHp <= 0 || currentQIndex === questions.length - 1) {
                // End of floor
                setFloor(f => f + 1);
                setPlayerHp(h => Math.min(maxPlayerHp, h + 15));
                const nextIsBonus = (floor + 1) % 3 === 0;
                startNewFloor(nextIsBonus);
            } else {
                setCurrentQIndex(i => i + 1);
            }
        }, 1200);
    };

    const renderHealth = (current: number, max: number, color: string) => (
        <div className="w-full bg-gray-800 h-4 border-2 border-gray-600 rounded-sm overflow-hidden">
            <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${(current/max)*100}%` }} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in font-mono">
            {/* Retro Console Frame */}
            <div className="bg-gray-800 p-4 md:p-8 rounded-[40px] shadow-2xl border-b-[12px] border-gray-900 relative">
                
                {/* Screen */}
                <div className="bg-black rounded-2xl border-8 border-gray-700 min-h-[500px] overflow-hidden flex flex-col relative shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]" />
                    
                    {gameState === 'menu_subject' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 z-20 space-y-8">
                            <h1 className="text-5xl md:text-7xl font-black text-green-500 italic tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse">
                                {t.title}
                            </h1>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
                                {SUBJECTS.map(s => (
                                    <button key={s.id} onClick={() => { setSelectedSubject(s.id); setGameState('menu_grade'); }} className="p-4 bg-gray-900 border-2 border-gray-700 hover:border-green-500 text-white rounded-xl transition-all hover:scale-105">
                                        <div className="text-3xl mb-1">{s.icon}</div>
                                        <div className="text-[10px] font-bold uppercase">{s.id}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState === 'menu_grade' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 z-20 space-y-6">
                            <h2 className="text-2xl text-green-400">SELECT DIFFICULTY</h2>
                            <div className="flex flex-wrap justify-center gap-3">
                                {GRADES.map(g => (
                                    <button key={g} onClick={() => { setSelectedGrade(g); startNewFloor(); }} className="px-6 py-3 bg-gray-900 border-2 border-gray-600 hover:bg-green-600 text-white rounded-lg">
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState === 'loading' && (
                        <div className="flex-1 flex flex-col items-center justify-center z-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent animate-spin rounded-full"></div>
                            <p className="text-green-500 animate-pulse">{t.loading}</p>
                        </div>
                    )}

                    {gameState === 'combat' && questions.length > 0 && (
                        <div className="flex-1 flex flex-col z-20">
                            {/* HUD */}
                            <div className="flex justify-between p-4 bg-gray-900/80 border-b border-gray-700">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase">{t.floor} {floor}</div>
                                    <div className="text-white font-bold">{selectedSubject}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-green-500 uppercase">{t.score}</div>
                                    <div className="text-white text-xl font-bold">{score.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Arena */}
                            <div className="flex-1 relative flex items-center justify-between px-12 md:px-24">
                                {isBonusFloor && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black animate-bounce">{t.bonus}</div>}
                                
                                <div className="text-center space-y-2">
                                    {renderHealth(playerHp, maxPlayerHp, 'bg-green-500')}
                                    <div className={`text-5xl transition-transform ${attackAnim === 'player' ? 'translate-x-20 scale-125' : ''}`}>🛡️</div>
                                    <div className="text-[10px] text-white">LVL {floor} HERO</div>
                                </div>

                                {feedbackMsg && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-50">
                                        <div className="text-3xl font-black text-white bg-black/80 px-4 py-2 rounded-lg border-2 border-white animate-bounce shadow-lg">
                                            {feedbackMsg}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center space-y-2">
                                    {renderHealth(monsterHp, maxMonsterHp, 'bg-red-500')}
                                    <div className={`text-5xl transition-transform ${attackAnim === 'monster' ? '-translate-x-20 scale-125' : ''}`}>👿</div>
                                    <div className="text-[10px] text-red-500">DUNGEON BOSS</div>
                                </div>
                            </div>

                            {/* Question UI */}
                            <div className="bg-gray-900 p-6 border-t-4 border-gray-800">
                                <div className="mb-4 bg-black p-4 border border-green-900 rounded-lg shadow-inner min-h-[80px]">
                                    <p className="text-green-400 text-sm md:text-base leading-tight">
                                        <span className="opacity-40 mr-2">&gt;</span>
                                        {questions[currentQIndex].question}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {questions[currentQIndex].options.map((opt, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleAnswer(i)}
                                            className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 p-3 rounded-xl transition-all active:translate-y-1 group"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black shadow-[0_4px_0_rgba(0,0,0,0.5)] ${['bg-green-500','bg-red-500','bg-blue-500','bg-yellow-500'][i]}`}>
                                                {['A','B','X','Y'][i]}
                                            </div>
                                            <span className="text-left text-xs md:text-sm text-gray-200 group-hover:text-white font-bold">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'gameover' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 z-20 space-y-6 bg-red-950/40">
                            <h2 className="text-6xl font-black text-red-600 tracking-tighter drop-shadow-lg animate-pulse">{t.gameover}</h2>
                            <div className="text-center">
                                <p className="text-white text-xl uppercase">Final Score</p>
                                <p className="text-4xl font-black text-green-500">{score.toLocaleString()}</p>
                            </div>
                            <button onClick={() => { setPlayerHp(100); setScore(0); setFloor(1); setGameState('menu_subject'); }} className="px-12 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition-all shadow-xl">
                                {t.menu}
                            </button>
                        </div>
                    )}

                </div>

                {/* Physical Console Controls Decor */}
                <div className="flex justify-between items-center mt-6 px-4">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-700 shadow-inner flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-900 rounded-sm rotate-45" />
                        </div>
                        <div className="space-y-1 flex flex-col justify-center">
                            <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
                            <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold tracking-[0.3em]">GEN-SYSTEM PRO</div>
                    <div className="flex gap-2">
                        <div className="w-12 h-12 rounded-full bg-red-600/20 border-2 border-red-600 shadow-lg" />
                        <div className="w-12 h-12 rounded-full bg-green-600/20 border-2 border-green-600 shadow-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
};
