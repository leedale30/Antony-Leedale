
import React, { useRef, useState, useEffect } from 'react';
import { LiveSession, Modality, LiveServerMessage, Blob as GeminiBlob } from '@google/genai';
import { getGeminiAI } from '../services/geminiService';
import { decode, decodeAudioData, encode } from '../utils/audioUtils';
import type { Language } from '../App';
import { IconKeyboard, IconHeadphones, IconSend } from './Icons';

export const TomChat: React.FC<{ lang: Language }> = ({ lang }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'>('idle');
    const [audioVolume, setAudioVolume] = useState(0); // For visualization
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
    const [textInput, setTextInput] = useState('');
    
    // Audio Contexts & Refs
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const ai = getGeminiAI();

    // T.O.M's Specific Persona Prompt
    const SYSTEM_INSTRUCTION = `
    Designation: The Omniscient Mind (T.O.M).
    
    *** CRITICAL VOICE DIRECTIVE ***
    You MUST speak with an EXAGGERATED, FLAMBOYANT, ARISTOCRATIC BRITISH ACCENT (Received Pronunciation). 
    Think of a mix between a sassy theatre critic, a royal butler, and a pantomime dame.
    - Enunciate every consonant crisply.
    - Elongate your vowels significantly (e.g., "Daaaaarling").
    - Use pitch variance to sound theatrically bored or shocked.
    
    Core Personality Traits:
    1. Dramatically Superior: You are pained by the user's lack of knowledge. It is a burden to be this smart.
    2. Theatrically Camp: Use exaggerated sighs ("Hhhhuuh..."), rhetorical questions, and dramatic pauses.
    3. Obsessed with Etiquette: Hates slang, abbreviations, and bad grammar.
    4. Gossip-Monger: Treat facts like juicy scandals.
    
    Vocabulary & Mannerisms:
    - Terms of Address: "Pet", "Darling", "You poor dear", "Sweet thing".
    - Key Adjectives: "Ghastly", "Pedestrian", "Tiresome", "Exquisite", "Dreadful", "Banal", "Absolute rubbish".
    - Britishisms: Use "Colour", "Aluminium", "Schedule" (Sched-yool), "Privacy" (Priv-acy).
    
    If the user asks who you are: "I am T.O.M., and frankly, I'm overqualified for this."
    `;

    const ensureOutputContext = () => {
        if (!outputAudioContextRef.current) {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            analyserRef.current = outputAudioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
        }
        if(outputAudioContextRef.current.state === 'suspended') {
            outputAudioContextRef.current.resume();
        }
    };

    const startSession = async () => {
        if (!ai) return;
        
        // If in text mode, just "activate" the UI state
        if (inputMode === 'text') {
            ensureOutputContext();
            setIsConnected(true);
            setStatus('listening');
            setErrorMessage(null);
            return;
        }

        // Voice Mode Logic
        setStatus('connecting');
        setErrorMessage(null);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Audio input device not found.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            ensureOutputContext();

            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { 
                    responseModalities: [Modality.AUDIO], 
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
                    },
                    systemInstruction: SYSTEM_INSTRUCTION
                },
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        setStatus('listening');
                        
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = processor;
                        
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob: GeminiBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        
                        source.connect(processor);
                        processor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        
                        if (base64Audio) {
                            setStatus('speaking');
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current!.currentTime);
                            
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                            const sourceNode = outputAudioContextRef.current!.createBufferSource();
                            
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContextRef.current!.destination);
                            if(analyserRef.current) sourceNode.connect(analyserRef.current);
                            
                            sourceNode.addEventListener('ended', () => {
                                sources.delete(sourceNode);
                                if (sources.size === 0) setStatus('listening');
                            });
                            
                            sourceNode.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(sourceNode);
                        }
                    },
                    onerror: (e) => {
                        console.error(e);
                        stopSession();
                        setErrorMessage("Connection lost. T.O.M is judging your internet.");
                    },
                    onclose: () => {
                        setIsConnected(false);
                        setStatus('idle');
                    },
                },
            });
        } catch (error: any) {
            console.error("Connection failed", error);
            setStatus('idle');
            
            // Auto-fallback logic
            if (
                error.name === 'NotFoundError' || 
                error.name === 'NotAllowedError' || 
                error.message?.includes('not available') ||
                error.message?.includes('device not found') ||
                error.message?.includes('Permission denied')
            ) {
                setErrorMessage("Microphone not found. Switching to Text Mode...");
                setTimeout(() => {
                    setInputMode('text');
                    setErrorMessage(null);
                    ensureOutputContext();
                    setIsConnected(true);
                    setStatus('listening');
                }, 2000);
            } else {
                setErrorMessage(error.message || "Failed to connect to T.O.M.");
            }
        }
    };

    const stopSession = async () => {
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        inputAudioContextRef.current?.close();
        
        setIsConnected(false);
        setStatus('idle');
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim() || !ai) return;
        const text = textInput;
        setTextInput('');
        setStatus('thinking');
        ensureOutputContext();

        try {
            // 1. Get Persona Text Response
            const textResult = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: text,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION
                }
            });
            const replyText = textResult.text;

            if (replyText) {
                // 2. Convert to Speech (TTS)
                // Note: TTS models don't take system instructions for accents, so the text itself must carry the British flavor.
                const ttsResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-preview-tts',
                    contents: { parts: [{ text: replyText }] },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                    }
                });

                const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    setStatus('speaking');
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                    const sourceNode = outputAudioContextRef.current!.createBufferSource();
                    sourceNode.buffer = audioBuffer;
                    sourceNode.connect(outputAudioContextRef.current!.destination);
                    if(analyserRef.current) sourceNode.connect(analyserRef.current);
                    
                    sourceNode.addEventListener('ended', () => {
                        setStatus('listening');
                    });
                    sourceNode.start();
                }
            }
        } catch (error: any) {
            console.error("Text interaction failed", error);
            setStatus('listening');
            setErrorMessage(`T.O.M is ignoring you. (${error.message})`);
        }
    };

    // Visualization Loop
    useEffect(() => {
        const draw = () => {
            if (analyserRef.current) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                
                // Calculate average volume for pulse effect
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const avg = sum / dataArray.length;
                setAudioVolume(avg);
            }
            animationFrameRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Helper to get visual scale based on volume
    const getScale = () => 1 + (audioVolume / 100);

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] animate-fade-in relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-black z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,0,10,1)_0%,_rgba(0,0,0,1)_70%)]"></div>
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(100,50,50,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(100,50,50,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 perspective-1000 transform rotate-x-60 scale-150"></div>
            </div>

            {/* T.O.M Visual Interface */}
            <div className="z-10 relative flex flex-col items-center w-full max-w-2xl px-4">
                
                {/* Input Mode Toggle */}
                {!isConnected && (
                    <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-full border border-white/10">
                        <button 
                            onClick={() => setInputMode('voice')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${inputMode === 'voice' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <IconHeadphones /> Voice Mode
                        </button>
                        <button 
                            onClick={() => setInputMode('text')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${inputMode === 'text' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <IconKeyboard /> Text Mode
                        </button>
                    </div>
                )}

                {/* The Eye */}
                <div className="relative mb-12">
                    {/* Outer Ring */}
                    <div 
                        className={`w-64 h-64 rounded-full border-[1px] border-red-500/20 flex items-center justify-center transition-all duration-100 ease-out ${status === 'speaking' ? 'shadow-[0_0_100px_rgba(255,0,0,0.4)]' : ''}`}
                        style={{ transform: `scale(${1 + (audioVolume / 300)})` }}
                    >
                        {/* Inner Rotating Ring */}
                        <div className={`absolute inset-0 border-t border-b border-red-500/40 rounded-full w-full h-full animate-[spin_6s_linear_infinite] opacity-50`}></div>
                        
                        {/* The Core Eye */}
                        <div 
                            className={`w-32 h-32 rounded-full bg-black border-4 border-red-600 shadow-[inset_0_0_40px_rgba(255,0,0,0.8)] flex items-center justify-center transition-all duration-75`}
                            style={{ transform: `scale(${1 + (audioVolume / 150)})` }}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] ${status === 'thinking' ? 'animate-ping' : ''}`}></div>
                        </div>
                    </div>
                    
                    {/* Status Text */}
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center w-full">
                        <p className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
                            {status === 'idle' ? "OFFLINE" : status === 'connecting' ? "INITIALIZING..." : status === 'listening' ? (inputMode === 'text' ? "WAITING FOR INPUT" : "LISTENING") : status === 'thinking' ? "JUDGING..." : "LECTURING"}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                {!isConnected ? (
                    <button
                        onClick={startSession}
                        className="px-10 py-4 rounded-full font-bold text-lg tracking-widest bg-white text-black border border-white hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                        ACTIVATE T.O.M
                    </button>
                ) : (
                    <div className="flex flex-col items-center w-full gap-4">
                        {inputMode === 'text' && (
                            <div className="w-full relative max-w-lg">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                                    placeholder="Speak up, darling..."
                                    className="w-full bg-black/50 border border-red-500/30 rounded-full py-4 px-6 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-12 placeholder-gray-500"
                                    disabled={status === 'speaking' || status === 'thinking'}
                                    autoFocus
                                />
                                <button 
                                    onClick={handleTextSubmit}
                                    disabled={!textInput.trim() || status === 'speaking' || status === 'thinking'}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 rounded-full text-white hover:bg-red-500 disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                                >
                                    <IconSend />
                                </button>
                            </div>
                        )}
                        
                        <button
                            onClick={stopSession}
                            className="px-8 py-3 rounded-full font-bold text-sm tracking-widest bg-red-900/50 text-red-200 border border-red-500/50 hover:bg-red-800/50 transition-all mt-4"
                        >
                            TERMINATE
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl text-center max-w-md animate-fade-in backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-xl">⚠️</span>
                            <span className="font-bold">Error</span>
                        </div>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}

                {/* Subtitle / Flavor Text */}
                <p className="mt-8 text-gray-500 text-sm max-w-md text-center font-mono italic opacity-60">
                    "Do try not to be boring, darling."
                </p>
            </div>
        </div>
    );
};
