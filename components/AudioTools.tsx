import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GeminiBlob } from '@google/genai';
import { getGeminiAI } from '../services/geminiService';
import { decode, decodeAudioData, encode } from '../utils/audioUtils';
import type { Language } from '../App';

type AudioTool = 'live' | 'tts' | 'transcribe';
type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const AudioTools: React.FC<{ lang: Language }> = ({ lang }) => {
    const [activeTool, setActiveTool] = useState<AudioTool>('live');

    const t = {
        en: { live: "Live Conversation", tts: "Text-to-Speech", transcribe: "Transcribe Audio" },
        zh: { live: "实时对话", tts: "文本转语音", transcribe: "音频转录" }
    }[lang];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="flex justify-center space-x-2 mb-6 bg-gem-slate p-2 rounded-xl">
                <button onClick={() => setActiveTool('live')} className={`px-4 py-2 w-full rounded-lg ${activeTool === 'live' ? 'bg-gem-blue text-white' : 'hover:bg-gem-onyx'}`}>{t.live}</button>
                <button onClick={() => setActiveTool('tts')} className={`px-4 py-2 w-full rounded-lg ${activeTool === 'tts' ? 'bg-gem-blue text-white' : 'hover:bg-gem-onyx'}`}>{t.tts}</button>
                <button onClick={() => setActiveTool('transcribe')} className={`px-4 py-2 w-full rounded-lg ${activeTool === 'transcribe' ? 'bg-gem-blue text-white' : 'hover:bg-gem-onyx'}`}>{t.transcribe}</button>
            </div>
            {activeTool === 'live' && <LiveConversation lang={lang} />}
            {activeTool === 'tts' && <TextToSpeech lang={lang} />}
            {activeTool === 'transcribe' && <TranscribeAudio lang={lang} />}
        </div>
    )
};

const LiveConversation: React.FC<{ lang: Language }> = ({ lang }) => {
    const [status, setStatus] = useState<LiveStatus>('disconnected');
    const [transcription, setTranscription] = useState<string[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const currentInputTranscriptionRef = useRef('');

    const t = {
        en: { 
            title: "Real-time Conversation", 
            subtitle: "Speak into your microphone and have a conversation with Gemini.",
            connect: "Start Conversation",
            connecting: "Connecting...",
            stop: "Stop Conversation" 
        },
        zh: { 
            title: "实时对话", 
            subtitle: "对着麦克风说话，与 Gemini 实时交谈。",
            connect: "开始对话",
            connecting: "连接中...",
            stop: "停止对话" 
        }
    }[lang];
    
    const startConversation = useCallback(async () => {
        const ai = getGeminiAI();
        if (!ai) {
            setStatus('error');
            return;
        }
        
        setStatus('connecting');
        setTranscription([]);
        currentInputTranscriptionRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            const sysInstruct = lang === 'zh' 
                ? "You are a helpful language tutor. Speak Chinese." 
                : "You are a helpful language tutor. Speak English.";

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { 
                    responseModalities: [Modality.AUDIO], 
                    inputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: sysInstruct
                },
                callbacks: {
                    onopen: () => {
                        setStatus('connected');
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
                       if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            currentInputTranscriptionRef.current += text;
                            if (message.serverContent.inputTranscription.isFinal) {
                                setTranscription(prev => [...prev, `You: ${currentInputTranscriptionRef.current.trim()}`]);
                                currentInputTranscriptionRef.current = '';
                            }
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current!.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                            const sourceNode = outputAudioContextRef.current!.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContextRef.current!.destination);
                            sourceNode.addEventListener('ended', () => sources.delete(sourceNode));
                            sourceNode.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(sourceNode);
                        }
                    },
                    onerror: (e) => {
                        console.error("Live session error:", e);
                        setStatus('error');
                        stopConversation();
                    },
                    onclose: () => {
                        setStatus('disconnected');
                    },
                },
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('error');
        }
    }, [lang]);

    const stopConversation = useCallback(async () => {
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();

        setStatus('disconnected');
    }, []);

    useEffect(() => {
        return () => {
            stopConversation();
        }
    }, [stopConversation]);

    const isConnected = status === 'connected';

    return (
        <div className="text-center p-4 bg-gem-slate rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{t.title}</h3>
            <p className="text-gray-400 mb-4">{t.subtitle}</p>
            <div className="flex justify-center items-center space-x-4">
                <button
                    onClick={isConnected ? stopConversation : startConversation}
                    className={`px-6 py-3 rounded-full font-bold text-white transition-all duration-300 ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-gem-blue hover:bg-gem-blue-light'}`}
                    disabled={status === 'connecting'}
                >
                    {status === 'connecting' ? t.connecting : isConnected ? t.stop : t.connect}
                </button>
                 <div className={`w-6 h-6 rounded-full ${isConnected ? 'bg-green-500 animate-pulse-fast' : 'bg-gray-500'}`}></div>
            </div>
            <div className="mt-6 text-left bg-gem-onyx p-4 rounded-lg min-h-[100px]">
                {transcription.map((line, i) => <p key={i}>{line}</p>)}
                {currentInputTranscriptionRef.current && <p className="text-gray-400"><em>{currentInputTranscriptionRef.current}</em></p>}
            </div>
        </div>
    );
};

const TextToSpeech: React.FC<{ lang: Language }> = ({ lang }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const t = {
        en: { title: "Text-to-Speech", ph: "Type text for Gemini to speak...", btn: "Speak", btnLoading: "Generating..." },
        zh: { title: "文本转语音", ph: "输入文字让 Gemini 朗读...", btn: "朗读", btnLoading: "生成中..." }
    }[lang];

    const handleSpeak = useCallback(async () => {
        const ai = getGeminiAI();
        if (!text || !ai) return;
        setIsLoading(true);
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
        } catch (error) {
            console.error("TTS failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [text]);
    
    return (
        <div className="p-4 bg-gem-slate rounded-lg">
             <h3 className="text-xl font-semibold mb-4 text-center">{t.title}</h3>
             <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full p-2.5 bg-gem-onyx border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gem-blue" placeholder={t.ph} />
             <button onClick={handleSpeak} disabled={isLoading || !text} className="w-full mt-4 bg-gem-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-gem-blue-light disabled:bg-gray-500 transition-colors">
                {isLoading ? t.btnLoading : t.btn}
             </button>
        </div>
    );
};


const TranscribeAudio: React.FC<{ lang: Language }> = ({ lang }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);

    const t = {
        en: { title: "Transcribe from Microphone", start: "Start Listening", stop: "Stop Listening", ph: "Transcription will appear here..." },
        zh: { title: "麦克风录音转录", start: "开始听写", stop: "停止听写", ph: "转录内容将显示在这里..." }
    }[lang];

    const startListening = useCallback(async () => {
        const ai = getGeminiAI();
        if (!ai) return;
        
        setIsListening(true);
        setTranscription('');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { inputAudioTranscription: {} },
                callbacks: {
                    onopen: () => {
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        processorRef.current = processor;

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob: GeminiBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(processor);
                        processor.connect(audioContextRef.current!.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                    },
                    onerror: console.error,
                    onclose: () => {},
                },
            });
        } catch (error) {
            console.error("Transcription failed:", error);
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(async () => {
        setIsListening(false);
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }
        processorRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        audioContextRef.current?.close();
    }, []);

    return (
        <div className="p-4 bg-gem-slate rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">{t.title}</h3>
            <button onClick={isListening ? stopListening : startListening} className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${isListening ? 'bg-red-500' : 'bg-gem-blue'}`}>
                {isListening ? t.stop : t.start}
            </button>
            <div className="mt-4 p-4 bg-gem-onyx rounded-lg min-h-[100px] whitespace-pre-wrap">
                {transcription || t.ph}
            </div>
        </div>
    );
};