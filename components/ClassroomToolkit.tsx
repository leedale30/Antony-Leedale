import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';

export const ClassroomToolkit: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = {
        en: {
            title: "Classroom Toolkit",
            subtitle: "Daily utilities for classroom management.",
            timer: "Focus Timer",
            noise: "Noise Monitor",
            group: "Group Maker",
            qr: "QR Generator"
        },
        zh: {
            title: "课堂工具箱",
            subtitle: "课堂管理的日常实用工具。",
            timer: "专注计时器",
            noise: "噪音监测器",
            group: "分组生成器",
            qr: "二维码生成器"
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimerWidget lang={lang} title={t.timer} />
                <NoiseMonitorWidget lang={lang} title={t.noise} />
                <GroupMakerWidget lang={lang} title={t.group} />
                <QRCodeWidget lang={lang} title={t.qr} />
            </div>
        </div>
    );
};

const TimerWidget: React.FC<{ lang: Language, title: string }> = ({ lang, title }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins default
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(5); // in minutes
    
    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
        }
        return () => { if(interval) clearInterval(interval); };
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const reset = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center">
            <h3 className="text-xl font-bold text-gem-blue mb-4">{title}</h3>
            <div className="text-6xl font-mono font-bold text-white mb-6 tabular-nums tracking-widest">
                {formatTime(timeLeft)}
            </div>
            
            <div className="w-full flex justify-between items-center mb-6 px-4">
                 <button onClick={() => { setDuration(Math.max(1, duration-1)); setTimeLeft((duration-1)*60); setIsActive(false); }} className="text-2xl text-gray-400 hover:text-white">-</button>
                 <span className="text-gray-300">{duration} min</span>
                 <button onClick={() => { setDuration(duration+1); setTimeLeft((duration+1)*60); setIsActive(false); }} className="text-2xl text-gray-400 hover:text-white">+</button>
            </div>

            <div className="flex gap-3 w-full">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gem-blue hover:bg-blue-500'} text-white`}
                >
                    {isActive ? (lang === 'zh' ? '暂停' : 'Pause') : (lang === 'zh' ? '开始' : 'Start')}
                </button>
                <button 
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                    {lang === 'zh' ? '重置' : 'Reset'}
                </button>
            </div>
        </div>
    );
};

const NoiseMonitorWidget: React.FC<{ lang: Language, title: string }> = ({ lang, title }) => {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number | null>(null);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            
            analyser.fftSize = 256;
            source.connect(analyser);
            
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;
            setIsListening(true);
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const update = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const average = sum / bufferLength;
                // Normalize roughly to 0-100
                setVolume(Math.min(100, Math.round(average * 1.5)));
                requestRef.current = requestAnimationFrame(update);
            };
            update();

        } catch (err) {
            console.error(err);
            alert("Microphone access denied.");
        }
    };

    const stopListening = () => {
        if(requestRef.current) cancelAnimationFrame(requestRef.current);
        sourceRef.current?.disconnect();
        audioContextRef.current?.close();
        setIsListening(false);
        setVolume(0);
    };

    useEffect(() => {
        return () => {
             if(requestRef.current) cancelAnimationFrame(requestRef.current);
             audioContextRef.current?.close();
        };
    }, []);

    // Color Logic
    const getColor = (v: number) => {
        if (v < 40) return 'bg-green-500';
        if (v < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-between">
            <h3 className="text-xl font-bold text-gem-teal mb-4">{title}</h3>
            
            <div className="flex-1 w-full flex items-end justify-center space-x-1 h-32 mb-6">
                {[...Array(10)].map((_, i) => {
                    const threshold = (i + 1) * 10;
                    const isActive = volume >= threshold;
                    return (
                        <div 
                            key={i} 
                            className={`w-4 rounded-t-sm transition-all duration-100 ${isActive ? getColor(volume) : 'bg-white/5'}`}
                            style={{ height: isActive ? `${(i+1)*10}%` : '10%' }}
                        />
                    )
                })}
            </div>

            <button 
                onClick={isListening ? stopListening : startListening}
                className={`w-full py-3 rounded-xl font-bold transition-all text-white ${isListening ? 'bg-red-500/80 hover:bg-red-600' : 'bg-gem-teal/80 hover:bg-teal-600'}`}
            >
                {isListening ? (lang === 'zh' ? '停止监测' : 'Stop Monitoring') : (lang === 'zh' ? '开始监测' : 'Start Monitoring')}
            </button>
        </div>
    );
};

const GroupMakerWidget: React.FC<{ lang: Language, title: string }> = ({ lang, title }) => {
    const [names, setNames] = useState('');
    const [groupSize, setGroupSize] = useState(3);
    const [groups, setGroups] = useState<string[][]>([]);

    const makeGroups = () => {
        const nameList = names.split('\n').filter(n => n.trim() !== '');
        if (nameList.length === 0) return;

        // Shuffle
        for (let i = nameList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nameList[i], nameList[j]] = [nameList[j], nameList[i]];
        }

        const newGroups: string[][] = [];
        for (let i = 0; i < nameList.length; i += groupSize) {
            newGroups.push(nameList.slice(i, i + groupSize));
        }
        setGroups(newGroups);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col">
            <h3 className="text-xl font-bold text-gem-purple mb-4">{title}</h3>
            <textarea 
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder={lang === 'zh' ? "输入名字 (每行一个)..." : "Enter names (one per line)..."}
                className="w-full h-32 bg-black/40 border border-gray-600 rounded-lg p-2 text-white text-sm mb-4 resize-none focus:border-gem-purple outline-none"
            />
            
            <div className="flex items-center justify-between mb-4">
                 <span className="text-gray-400 text-sm">{lang === 'zh' ? '每组人数:' : 'Group Size:'} {groupSize}</span>
                 <input 
                    type="range" min="2" max="10" value={groupSize} 
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-1/2 accent-gem-purple" 
                 />
            </div>

            <button onClick={makeGroups} className="w-full py-2 bg-gem-purple text-white font-bold rounded-lg hover:bg-purple-600 mb-4">
                 {lang === 'zh' ? '生成分组' : 'Randomize Groups'}
            </button>

            {groups.length > 0 && (
                <div className="overflow-y-auto max-h-32 space-y-2 pr-2 scrollbar-hide">
                    {groups.map((g, i) => (
                        <div key={i} className="bg-white/5 p-2 rounded text-xs flex flex-wrap gap-2">
                            <span className="font-bold text-gem-purple">#{i+1}</span>
                            {g.join(', ')}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const QRCodeWidget: React.FC<{ lang: Language, title: string }> = ({ lang, title }) => {
    const [url, setUrl] = useState('');
    const [qrUrl, setQrUrl] = useState('');

    const generate = () => {
        if(!url) return;
        // Using a public API for QR generation to keep it simple without heavy libraries
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center">
            <h3 className="text-xl font-bold text-gem-pink mb-4">{title}</h3>
            
            <div className="bg-white p-2 rounded-lg mb-4 w-32 h-32 flex items-center justify-center">
                {qrUrl ? <img src={qrUrl} alt="QR Code" className="w-full h-full" /> : <span className="text-gray-400 text-xs text-center">QR Code</span>}
            </div>

            <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/40 border border-gray-600 rounded-lg p-2 text-white text-sm mb-4 focus:border-gem-pink outline-none"
            />

            <button onClick={generate} className="w-full py-2 bg-gem-pink text-white font-bold rounded-lg hover:bg-pink-600">
                {lang === 'zh' ? '生成' : 'Generate'}
            </button>
        </div>
    );
};