import React, { useState, useEffect, useRef } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { IconMusic } from './Icons';

type Tab = 'notes' | 'composer' | 'learn';

interface Note {
    name: string; // 'C', 'D', 'E'...
    position: number; // Y-offset for drawing
    isLine: boolean;
}

const NOTES: Note[] = [
    { name: 'C', position: 70, isLine: true }, // Middle C (Ledger)
    { name: 'D', position: 60, isLine: false },
    { name: 'E', position: 50, isLine: true },
    { name: 'F', position: 40, isLine: false },
    { name: 'G', position: 30, isLine: true },
    { name: 'A', position: 20, isLine: false },
    { name: 'B', position: 10, isLine: true },
    { name: 'C', position: 0, isLine: false } // High C
];

export const MusicTheoryBear: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<Tab>('notes');

    const t = {
        en: {
            title: "Music Theory Bear",
            subtitle: "Learn music with your fuzzy friend!",
            tabs: { notes: "Note Quest", composer: "Rhythm Builder", learn: "Theory Buddy" }
        },
        zh: {
            title: "乐理小熊",
            subtitle: "和毛茸茸的朋友一起学音乐！",
            tabs: { notes: "识谱任务", composer: "节奏工坊", learn: "乐理伙伴" }
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-amber-400">🐻</span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {(Object.keys(t.tabs) as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === tab ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.tabs[tab]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-6 border border-amber-500/20 bg-black/40 relative overflow-hidden">
                {activeTab === 'notes' && <NoteQuest lang={lang} />}
                {activeTab === 'composer' && <RhythmBuilder lang={lang} />}
                {activeTab === 'learn' && <TheoryBuddy lang={lang} />}
            </div>
        </div>
    );
};

const NoteQuest: React.FC<{ lang: Language }> = ({ lang }) => {
    const [currentNote, setCurrentNote] = useState<Note>(NOTES[0]);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const pickNote = () => {
        const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
        setCurrentNote(randomNote);
        setMessage('');
    };

    const checkAnswer = (guess: string) => {
        if (guess === currentNote.name) {
            setScore(s => s + 1);
            setMessage('Correct! 🎉');
            setTimeout(pickNote, 1000);
        } else {
            setScore(0);
            setMessage('Try Again! 🐾');
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw Staff
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // Lines (E, G, B, D, F are lines usually, simplifying visualization relative to index)
        // Let's assume standard treble staff lines: E4, G4, B4, D5, F5
        // Y coords: 50, 40, 30, 20, 10 relative to base logic?
        // Let's just draw 5 horizontal lines in the middle
        const startY = 60;
        const spacing = 20;
        for (let i = 0; i < 5; i++) {
            const y = startY + (i * spacing);
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(350, y);
            ctx.stroke();
        }

        // Draw Treble Clef (Simplified or Image)
        ctx.font = '80px serif';
        ctx.fillStyle = '#f59e0b'; // Amber
        ctx.fillText('🎼', 60, 130);

        // Draw Note
        // Mapping our simple index to Y coordinate
        // Base Note C4 is below the staff.
        // Bottom line E4 is at startY + 4*spacing = 140
        // C4 needs to be at 160 (ledger line)
        // Let's align visually:
        // Top line F5: startY = 60
        // NOTES[7] (High C) -> Space below top line?
        // Let's just map manually for visual simplicity in this toy example
        
        const noteYMap: Record<string, number> = {
            'High C': 60, // Space? No wait.
            // Let's standardise:
            // F5 (Top line) = 60
            // E5 (Space) = 70
            // D5 (Line) = 80
            // C5 (Space) = 90
            // B4 (Line) = 100
            // A4 (Space) = 110
            // G4 (Line) = 120
            // F4 (Space) = 130
            // E4 (Line) = 140
            // D4 (Space) = 150
            // C4 (Line) = 160
        };
        
        // Mapping currentNote index to Y
        // NOTES array: C, D, E, F, G, A, B, High C
        const yPositions = [160, 150, 140, 130, 120, 110, 100, 90]; 
        const y = yPositions[NOTES.indexOf(currentNote)];

        ctx.beginPath();
        ctx.ellipse(200, y, 12, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.stroke();

        // Ledger line for Middle C
        if (currentNote.name === 'C' && y === 160) {
            ctx.beginPath();
            ctx.moveTo(180, 160);
            ctx.lineTo(220, 160);
            ctx.stroke();
        }

    }, [currentNote]);

    return (
        <div className="flex flex-col items-center h-full justify-center">
            <div className="text-2xl font-bold text-amber-400 mb-4">Score: {score}</div>
            
            <div className="bg-white/10 p-4 rounded-3xl mb-8 border-4 border-amber-500/50">
                <canvas ref={canvasRef} width={400} height={200} />
            </div>

            <div className="text-xl font-bold text-white h-8 mb-6 animate-bounce">{message}</div>

            <div className="flex gap-2 flex-wrap justify-center">
                {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => (
                    <button
                        key={note}
                        onClick={() => checkAnswer(note)}
                        className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-600 hover:border-amber-400 hover:bg-amber-900/50 text-2xl font-bold text-white transition-all shadow-lg active:scale-95"
                    >
                        {note}
                    </button>
                ))}
            </div>
        </div>
    );
};

const RhythmBuilder: React.FC<{ lang: Language }> = ({ lang }) => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtx = useRef<AudioContext | null>(null);

    const playSequence = async () => {
        if (sequence.length === 0) return;
        setIsPlaying(true);
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        let time = audioCtx.current.currentTime;
        
        sequence.forEach(duration => {
            const osc = audioCtx.current!.createOscillator();
            const gain = audioCtx.current!.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.current!.destination);
            
            // Randomish pleasant pitch
            osc.frequency.value = 261.63; // C4
            osc.type = 'triangle';
            
            osc.start(time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + (duration * 0.5));
            osc.stop(time + (duration * 0.5));
            
            time += duration * 0.6; // Gap
        });

        setTimeout(() => setIsPlaying(false), time * 1000);
    };

    const addNote = (type: number) => {
        setSequence([...sequence, type]);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto p-4 bg-white/5 rounded-2xl mb-6 border border-white/10 min-h-[150px]">
                {sequence.length === 0 && <span className="text-gray-500 italic mx-auto">Add notes to build a rhythm...</span>}
                {sequence.map((dur, i) => (
                    <div key={i} className={`h-20 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold shadow-lg animate-fade-in`} style={{ width: `${dur * 50}px` }}>
                        {dur === 1 ? '♩' : dur === 0.5 ? '♪' : '𝅗'}
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => addNote(2)} className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 border border-gray-600 flex flex-col items-center">
                    <span className="text-3xl">𝅗</span>
                    <span className="text-xs mt-1">Half</span>
                </button>
                <button onClick={() => addNote(1)} className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 border border-gray-600 flex flex-col items-center">
                    <span className="text-3xl">♩</span>
                    <span className="text-xs mt-1">Quarter</span>
                </button>
                <button onClick={() => addNote(0.5)} className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 border border-gray-600 flex flex-col items-center">
                    <span className="text-3xl">♪</span>
                    <span className="text-xs mt-1">Eighth</span>
                </button>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={playSequence} 
                    disabled={isPlaying || sequence.length === 0}
                    className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-500 disabled:opacity-50 transition-all text-xl shadow-lg"
                >
                    {isPlaying ? 'Playing...' : '▶ Play Rhythm'}
                </button>
                <button 
                    onClick={() => setSequence([])} 
                    className="px-6 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/40 border border-red-500/30"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

const TheoryBuddy: React.FC<{ lang: Language }> = ({ lang }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const askBear = async () => {
        if (!ai || !question) return;
        setIsLoading(true);
        setAnswer('');

        try {
            const prompt = `You are a friendly, fuzzy Music Theory Bear teaching a child.
            Answer this question simply and with fun emojis: "${question}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Keep it short (under 50 words).`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setAnswer(response.text || "Bear is confused... try again!");
        } catch (e) {
            setAnswer("Bear is sleeping (Network Error).");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🐻</div>
            <h3 className="text-2xl font-bold text-white mb-6">Ask me anything about music!</h3>
            
            <div className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="e.g. What is a sharp? Who is Mozart?"
                    className="flex-1 bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-amber-500 outline-none"
                    onKeyDown={e => e.key === 'Enter' && askBear()}
                />
                <button 
                    onClick={askBear}
                    disabled={isLoading}
                    className="bg-amber-500 text-black font-bold px-6 rounded-xl hover:bg-amber-400 transition-all"
                >
                    Ask
                </button>
            </div>

            {answer && (
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 animate-fade-in relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-800 border-t border-l border-white/20 rotate-45"></div>
                    <p className="text-xl text-amber-100 font-medium leading-relaxed">"{answer}"</p>
                </div>
            )}
        </div>
    );
};