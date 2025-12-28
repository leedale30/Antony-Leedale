import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getGeminiAI, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconMusic, IconHeadphones } from './Icons';

type Tab = 'playlist' | 'melody';

interface Song {
    title: string;
    artist: string;
    vibe: string;
}

export const ClassroomDj: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<Tab>('playlist');

    const t = {
        en: {
            title: "Classroom DJ",
            subtitle: "Curate the perfect vibe for your classroom.",
            tabs: { playlist: "Smart Playlist", melody: "Melody Maker" }
        },
        zh: {
            title: "课堂 DJ",
            subtitle: "为您的课堂营造完美的氛围。",
            tabs: { playlist: "智能歌单", melody: "旋律生成器" }
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-pink-500"><IconHeadphones /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {(Object.keys(t.tabs) as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === tab ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.tabs[tab]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-6 border border-pink-500/20 bg-black/40 relative overflow-hidden">
                {activeTab === 'playlist' && <PlaylistCurator lang={lang} />}
                {activeTab === 'melody' && <MelodyMaker lang={lang} />}
            </div>
        </div>
    );
};

const PlaylistCurator: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activity, setActivity] = useState('');
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            label: "What's happening in class?",
            ph: "e.g. Quiet reading time, High-energy gym class, Focus for a test",
            btn: "Curate Playlist",
            loading: "Digging through crates...",
            empty: "Enter an activity to get song suggestions."
        },
        zh: {
            label: "课堂正在进行什么活动？",
            ph: "例如：安静阅读时间，充满活力的体育课，考试专注",
            btn: "生成歌单",
            loading: "正在挑选唱片...",
            empty: "输入活动以获取歌曲建议。"
        }
    }[lang];

    const generatePlaylist = useCallback(async () => {
        if (!ai || !activity) return;
        setIsLoading(true);
        setSongs([]);

        try {
            const prompt = `Curate a playlist of 5 songs suitable for a K-12 classroom activity: "${activity}".
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            Return JSON array. Each object: { "title": string, "artist": string, "vibe": string (short explanation of why fits) }.
            Ensure lyrics are appropriate for school.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                artist: { type: Type.STRING },
                                vibe: { type: Type.STRING }
                            },
                            required: ["title", "artist", "vibe"]
                        }
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                setSongs(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, activity, lang]);

    return (
        <div className="h-full flex flex-col max-w-2xl mx-auto">
            <div className="flex gap-4 mb-8">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-pink-400 uppercase mb-2">{t.label}</label>
                    <input 
                        type="text" 
                        value={activity} 
                        onChange={e => setActivity(e.target.value)} 
                        placeholder={t.ph}
                        className="w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-pink-500 outline-none"
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={generatePlaylist} 
                        disabled={isLoading || !activity}
                        className="h-[52px] bg-pink-600 text-white font-bold px-6 rounded-xl hover:bg-pink-500 disabled:opacity-50 transition-all shadow-lg"
                    >
                        {isLoading ? t.loading : t.btn}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {songs.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 mt-20">
                        <div className="text-4xl mb-4 opacity-50">🎵</div>
                        <p>{t.empty}</p>
                    </div>
                )}
                {songs.map((song, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{song.title}</h4>
                                <p className="text-pink-400 text-sm">{song.artist}</p>
                            </div>
                        </div>
                        <div className="text-right max-w-xs hidden md:block">
                            <span className="text-xs text-gray-400 italic bg-black/30 px-2 py-1 rounded">{song.vibe}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MelodyMaker: React.FC<{ lang: Language }> = ({ lang }) => {
    const [mood, setMood] = useState('Epic Victory');
    const [isPlaying, setIsPlaying] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const [melody, setMelody] = useState<{ note: string, duration: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "AI Composer",
            ph: "e.g. Relaxing Rain, Cyberpunk Chase, Medieval Village",
            btn: "Generate Melody",
            btnPlay: "Play Loop",
            btnStop: "Stop",
            loading: "Composing..."
        },
        zh: {
            title: "AI 作曲家",
            ph: "例如：轻松雨声，赛博朋克追逐，中世纪村庄",
            btn: "生成旋律",
            btnPlay: "循环播放",
            btnStop: "停止",
            loading: "作曲中..."
        }
    }[lang];

    const generateMelody = useCallback(async () => {
        if (!ai || !mood) return;
        setIsLoading(true);
        setIsPlaying(false);
        if (audioCtxRef.current) audioCtxRef.current.close();
        audioCtxRef.current = null;

        try {
            const prompt = `Compose a short, looping melody (4-8 bars) for this mood: "${mood}".
            Format: Return a JSON array of objects. Each object has "note" (frequency in Hz, e.g. 261.63 for C4) and "duration" (in seconds, e.g. 0.5).
            Keep it simple monophonic. Use a variety of notes appropriate for the mood.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                note: { type: Type.NUMBER },
                                duration: { type: Type.NUMBER }
                            },
                            required: ["note", "duration"]
                        }
                    }
                }
            });

            if (response.text) {
                const data = JSON.parse(response.text);
                setMelody(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, mood]);

    const play = async () => {
        if (!melody.length) return;
        setIsPlaying(true);
        
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioCtxRef.current!.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        let startTime = audioCtxRef.current!.currentTime + 0.1;

        const scheduleNote = (freq: any, dur: number, time: number) => {
            const osc = audioCtxRef.current!.createOscillator();
            const gain = audioCtxRef.current!.createGain();
            
            osc.type = 'triangle'; // Softer sound
            osc.frequency.value = freq;
            
            osc.connect(gain);
            gain.connect(analyserRef.current!);
            analyserRef.current!.connect(audioCtxRef.current!.destination);
            
            osc.start(time);
            
            // Envelope
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.05);
            
            osc.stop(time + dur);
        };

        // Loop schedule logic handled simply by scheduling a chunk
        // For infinite loop, we'd need a lookahead scheduler, but for this demo, let's just schedule one pass or a few loops
        for(let i=0; i<4; i++) { // Loop 4 times
            melody.forEach(m => {
                scheduleNote(m.note, m.duration, startTime);
                startTime += m.duration;
            });
        }
        
        // Visualizer
        const draw = () => {
            if (!canvasRef.current || !analyserRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            analyserRef.current.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            const barWidth = (canvasRef.current.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                ctx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
                ctx.fillRect(x, canvasRef.current.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
            
            if(audioCtxRef.current?.state === 'running') {
                animationRef.current = requestAnimationFrame(draw);
            }
        };
        draw();
        
        // Auto stop visualizer roughly when music ends
        setTimeout(() => {
            setIsPlaying(false);
            if(animationRef.current) cancelAnimationFrame(animationRef.current);
        }, (startTime - audioCtxRef.current!.currentTime) * 1000);
    };

    const stop = () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsPlaying(false);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="w-full glass-panel p-6 rounded-2xl border border-white/10 mb-8 bg-black/50 relative overflow-hidden h-64 flex items-end">
                <canvas ref={canvasRef} width={600} height={256} className="w-full h-full absolute inset-0 z-0" />
                <div className="relative z-10 w-full text-center pb-8 pointer-events-none">
                    {!isPlaying && <div className="text-gray-500 text-sm">Visualizer Ready</div>}
                </div>
            </div>

            <div className="w-full flex gap-4 mb-4">
                <input 
                    type="text" 
                    value={mood} 
                    onChange={e => setMood(e.target.value)} 
                    placeholder={t.ph}
                    className="flex-1 bg-black/40 border border-gray-600 rounded-xl p-4 text-white focus:border-pink-500 outline-none"
                />
                <button 
                    onClick={generateMelody} 
                    disabled={isLoading}
                    className="bg-white/10 text-white font-bold px-6 rounded-xl hover:bg-white/20 disabled:opacity-50 transition-all border border-white/20"
                >
                    {isLoading ? t.loading : t.btn}
                </button>
            </div>

            <div className="flex gap-4 w-full">
                <button 
                    onClick={play} 
                    disabled={isPlaying || melody.length === 0}
                    className="flex-1 bg-pink-600 text-white font-bold py-4 rounded-xl hover:bg-pink-500 disabled:opacity-50 transition-all shadow-lg text-xl flex items-center justify-center gap-2"
                >
                    <span>▶</span> {t.btnPlay}
                </button>
                <button 
                    onClick={stop} 
                    disabled={!isPlaying}
                    className="px-8 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-all border border-gray-600"
                >
                    ■
                </button>
            </div>
        </div>
    );
};