import React, { useState, useCallback, useRef } from 'react';
import { getGeminiAI, Modality, Type } from '../services/geminiService';
import type { Language } from '../App';
import { IconAudio, IconImage, IconMagic } from './Icons';
import { decode, decodeAudioData } from '../utils/audioUtils';

type Mode = 'learn' | 'flashcards' | 'twister';

// Common tricky sounds for Chinese learners
const SOUNDS = [
    { id: 'th_v', label: 'TH (Voiced)', example: 'This', symbol: '/ð/' },
    { id: 'th_uv', label: 'TH (Unvoiced)', example: 'Think', symbol: '/θ/' },
    { id: 'l_r', label: 'L vs R', example: 'Light / Right', symbol: '/l/ vs /r/' },
    { id: 'v_w', label: 'V vs W', example: 'Vet / Wet', symbol: '/v/ vs /w/' },
    { id: 'sh_s', label: 'SH vs S', example: 'She / See', symbol: '/ʃ/ vs /s/' },
    { id: 'ee_i', label: 'Long E vs Short I', example: 'Sheep / Ship', symbol: '/i:/ vs /ɪ/' },
];

export const PhonicsLab: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeSound, setActiveSound] = useState(SOUNDS[0]);
    const [activeMode, setActiveMode] = useState<Mode>('learn');
    const [wordList, setWordList] = useState<{word: string, pinyin: string}[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [tongueTwister, setTongueTwister] = useState('');
    const [loading, setLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Phonics Lab",
            subtitle: "Master tricky English sounds with AI.",
            modes: { learn: "Sound Bank", flashcards: "Visual Flashcards", twister: "Tongue Twisters" },
            genWords: "Generate Word List",
            genVisual: "Generate Visual",
            genTwister: "Create Challenge",
            hear: "Hear it",
            loading: "Loading..."
        },
        zh: {
            title: "自然拼读实验室",
            subtitle: "利用 AI 掌握英语难点发音。",
            modes: { learn: "发音库", flashcards: "视觉闪卡", twister: "绕口令挑战" },
            genWords: "生成单词表",
            genVisual: "生成图解",
            genTwister: "创建挑战",
            hear: "试听",
            loading: "加载中..."
        }
    }[lang];

    const generateWords = useCallback(async () => {
        if (!ai) return;
        setLoading(true);
        try {
            const prompt = `Generate 5 common English words containing the sound "${activeSound.label}" (${activeSound.example}). 
            Target audience: Chinese ESL learners.
            Return JSON: array of objects with "word" and "pinyin" (a helpful Chinese explanatory note or similar sound in Pinyin if applicable, otherwise a brief Chinese tip on mouth position).
            `;
            
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
                                word: { type: Type.STRING },
                                pinyin: { type: Type.STRING }
                            },
                            required: ["word", "pinyin"]
                        }
                    }
                }
            });
            
            if (response.text) {
                setWordList(JSON.parse(response.text));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [ai, activeSound]);

    const playTTS = async (text: string) => {
        if (!ai || !text) return;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const generateImage = async (word: string) => {
        if (!ai) return;
        setLoading(true);
        setImageUrl('');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: `Cute, simple, educational vector illustration of "${word}". White background.` }] },
                config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
            });
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part && part.inlineData) {
                setImageUrl(`data:image/png;base64,${part.inlineData.data}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generateTwister = async () => {
        if (!ai) return;
        setLoading(true);
        setTongueTwister('');
        try {
            const prompt = `Write a short, fun, difficult tongue twister focusing on the sound "${activeSound.label}". 
            Context: For ESL students.
            Include a Chinese translation.
            Format: English Line\nChinese Line`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setTongueTwister(response.text || "");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-white/10 pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-gem-pink"><IconAudio /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                    {(Object.keys(t.modes) as Mode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setActiveMode(m)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap text-sm ${activeMode === m ? 'bg-gem-pink text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.modes[m]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Sidebar: Sounds */}
                <div className="w-full lg:w-64 glass-panel rounded-2xl p-4 overflow-y-auto border border-white/10 shrink-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Target Sounds</h3>
                    <div className="space-y-2">
                        {SOUNDS.map(sound => (
                            <button
                                key={sound.id}
                                onClick={() => { setActiveSound(sound); setWordList([]); setImageUrl(''); setTongueTwister(''); }}
                                className={`w-full text-left p-3 rounded-xl transition-all border group ${activeSound.id === sound.id ? 'bg-gem-pink/20 border-gem-pink text-white' : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{sound.label}</span>
                                    <span className="font-mono text-xs opacity-50">{sound.symbol}</span>
                                </div>
                                <div className="text-xs opacity-60 mt-1">{sound.example}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 glass-panel rounded-2xl p-6 overflow-y-auto border border-white/10 relative">
                    {/* Learn Mode */}
                    {activeMode === 'learn' && (
                        <div className="h-full flex flex-col">
                            <div className="text-center mb-8">
                                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-2">{activeSound.symbol}</h1>
                                <p className="text-gem-pink font-bold text-lg">{activeSound.label}</p>
                            </div>

                            {wordList.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <button onClick={generateWords} disabled={loading} className="bg-gem-pink hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105">
                                        {loading ? t.loading : t.genWords}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {wordList.map((item, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-gem-pink/50 transition-all flex justify-between items-center group">
                                            <div>
                                                <div className="text-xl font-bold text-white">{item.word}</div>
                                                <div className="text-sm text-gray-400">{item.pinyin}</div>
                                            </div>
                                            <button onClick={() => playTTS(item.word)} className="p-3 rounded-full bg-white/10 hover:bg-gem-pink text-white transition-colors">
                                                <IconAudio />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={generateWords} className="col-span-1 md:col-span-2 mt-4 text-sm text-gray-500 hover:text-white underline">Refresh List</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Flashcards Mode */}
                    {activeMode === 'flashcards' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            {imageUrl ? (
                                <div className="relative group max-w-sm w-full perspective-1000">
                                    <img src={imageUrl} alt="Flashcard" className="rounded-2xl shadow-2xl border-4 border-white/10 w-full" />
                                    <button onClick={() => setImageUrl('')} className="mt-6 text-gray-400 hover:text-white">Close Card</button>
                                </div>
                            ) : (
                                <div className="w-full max-w-md">
                                    <p className="mb-6 text-gray-300">Type a word containing <strong>{activeSound.label}</strong> to visualize it.</p>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="e.g. Three" id="flashcard-input" className="flex-1 bg-black/40 border border-gray-600 rounded-xl p-3 text-white focus:border-gem-pink outline-none" />
                                        <button 
                                            onClick={() => {
                                                const input = document.getElementById('flashcard-input') as HTMLInputElement;
                                                if(input.value) generateImage(input.value);
                                            }}
                                            disabled={loading}
                                            className="bg-gem-pink text-white px-6 rounded-xl font-bold"
                                        >
                                            {loading ? "..." : <IconImage />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tongue Twister Mode */}
                    {activeMode === 'twister' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            {tongueTwister ? (
                                <div className="max-w-xl">
                                    <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 p-8 rounded-2xl border border-pink-500/30 mb-6">
                                        <p className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed">{tongueTwister.split('\n')[0]}</p>
                                        <p className="text-gray-400 text-lg">{tongueTwister.split('\n')[1]}</p>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => playTTS(tongueTwister.split('\n')[0])} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full font-bold transition-all">
                                            <IconAudio /> {t.hear}
                                        </button>
                                        <button onClick={generateTwister} className="flex items-center gap-2 bg-gem-pink hover:bg-pink-600 px-6 py-3 rounded-full font-bold transition-all">
                                            <IconMagic /> New One
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🌪️</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ready for a challenge?</h3>
                                    <button onClick={generateTwister} disabled={loading} className="mt-4 bg-gem-pink hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all">
                                        {loading ? t.loading : t.genTwister}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};