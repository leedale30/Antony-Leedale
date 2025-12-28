
import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import { IconWheel } from './Icons';

export const ClassroomToolkit: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = {
        en: {
            title: "Classroom Toolkit",
            subtitle: "Daily utilities for classroom management.",
            timer: "Focus Timer",
            noise: "Noise Monitor",
            group: "Group Maker",
            qr: "QR Generator",
            wheel: "Spin Wheel"
        },
        zh: {
            title: "课堂工具箱",
            subtitle: "课堂管理的日常实用工具。",
            timer: "专注计时器",
            noise: "噪音监测器",
            group: "分组生成器",
            qr: "二维码生成器",
            wheel: "大转盘"
        }
    }[lang];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpinWheelWidget lang={lang} title={t.wheel} />
                <TimerWidget lang={lang} title={t.timer} />
                <NoiseMonitorWidget lang={lang} title={t.noise} />
                <GroupMakerWidget lang={lang} title={t.group} />
                <QRCodeWidget lang={lang} title={t.qr} />
            </div>
        </div>
    );
};

const SpinWheelWidget: React.FC<{ lang: Language, title: string }> = ({ lang, title }) => {
    const [items, setItems] = useState<string[]>(['Prize 1', 'Activity A', 'Student 1', 'Student 2', 'Bonus', 'Quiz']);
    const [newItemText, setNewItemText] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [mode, setMode] = useState<'spin' | 'edit'>('spin');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);

    const t = {
        en: {
            spin: "SPIN",
            reset: "Reset",
            edit: "Edit List",
            done: "Done",
            presets: "Presets:",
            names: "Names",
            prizes: "Prizes",
            acts: "Activities",
            placeholder: "Enter items (one per line)...",
            winner: "Winner:"
        },
        zh: {
            spin: "旋转",
            reset: "重置",
            edit: "编辑列表",
            done: "完成",
            presets: "预设:",
            names: "名字",
            prizes: "奖品",
            acts: "活动",
            placeholder: "输入项目 (每行一个)...",
            winner: "获胜者:"
        }
    }[lang];

    const colors = ['#38BDF8', '#A855F7', '#EC4899', '#2DD4BF', '#FBBF24', '#FB7185'];

    const drawWheel = (currentRotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 10;
        const step = (2 * Math.PI) / items.length;

        ctx.clearRect(0, 0, width, height);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentRotation);

        items.forEach((item, i) => {
            const startAngle = i * step;
            const endAngle = (i + 1) * step;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.save();
            ctx.rotate(startAngle + step / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(item.length > 10 ? item.substring(0,8) + '..' : item, radius - 20, 5);
            ctx.restore();
        });
        
        ctx.restore();

        // Pointer
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(centerX + 15, centerY - radius - 5); // top centerish
        ctx.lineTo(centerX - 15, centerY - radius - 5);
        ctx.lineTo(centerX, centerY - radius + 25);
        ctx.fill();
    };

    useEffect(() => {
        drawWheel(rotation);
    }, [items, rotation]);

    const spin = () => {
        if (isSpinning || items.length < 2) return;
        setIsSpinning(true);
        setWinner(null);

        const spinDuration = 3000;
        const startRotation = rotation;
        // Random extra rotation between 5 and 10 full circles
        const totalRotation = startRotation + (Math.PI * 2 * 5) + (Math.random() * Math.PI * 2 * 5);
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRot = startRotation + (totalRotation - startRotation) * easeOut;
            
            setRotation(currentRot);

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                // Calculate winner
                // The pointer is at -90 degrees (top), but our drawing starts at 0 (right).
                // Actually we drew pointer at top. 0 deg is usually 3 o'clock.
                // Our wheel rotated clockwise.
                // Let's simplify: normalize rotation to 0-2PI
                const normalizedRot = currentRot % (Math.PI * 2);
                
                // The pointer is at 270 deg (top) or -PI/2 relative to circle start? 
                // Let's just assume pointer is at 270 degrees (3*PI/2) in standard circle terms.
                // Or simpler: The segment that aligns with the top pointer is the winner.
                // Angle of segment i is [i*step, (i+1)*step]. 
                // The wheel rotated by 'normalizedRot'. 
                // The angle under the top pointer (which is static at -PI/2) is:
                // angleToCheck = (-PI/2 - normalizedRot) % (2PI)
                // We need to handle negative modulo carefully.
                
                const step = (2 * Math.PI) / items.length;
                let angleAtPointer = (Math.PI * 1.5 - normalizedRot) % (Math.PI * 2);
                if (angleAtPointer < 0) angleAtPointer += Math.PI * 2;
                
                const index = Math.floor(angleAtPointer / step);
                setWinner(items[index]);
            }
        };

        requestRef.current = requestAnimationFrame(animate);
    };

    const loadPreset = (type: 'names' | 'prizes' | 'acts') => {
        if(type === 'names') setItems(['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank']);
        if(type === 'prizes') setItems(['Sticker', 'Bonus Pt', 'No HW', 'Choose Seat', 'Candy', 'High Five']);
        if(type === 'acts') setItems(['Read', 'Draw', 'Quiz', 'Debate', 'Stretch', 'Video']);
        setWinner(null);
    };

    const handleEditSave = () => {
        const list = newItemText.split('\n').filter(s => s.trim() !== '');
        if(list.length > 0) setItems(list);
        setMode('spin');
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:col-span-2 lg:col-span-1 min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><IconWheel /> {title}</h3>
                <button onClick={() => { 
                    if(mode === 'spin') { setNewItemText(items.join('\n')); setMode('edit'); } 
                    else { handleEditSave(); }
                }} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors">
                    {mode === 'spin' ? t.edit : t.done}
                </button>
            </div>

            {mode === 'spin' ? (
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <canvas ref={canvasRef} width={300} height={300} className="max-w-full h-auto mb-4" />
                    
                    {winner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm z-10 animate-fade-in">
                            <div className="text-center p-6 bg-gem-blue rounded-2xl border-4 border-white shadow-2xl transform scale-110">
                                <p className="text-xs uppercase font-bold text-blue-900 mb-1">{t.winner}</p>
                                <p className="text-3xl font-black text-white">{winner}</p>
                                <button onClick={() => setWinner(null)} className="mt-4 text-xs bg-black/20 hover:bg-black/40 px-4 py-2 rounded text-white font-bold">OK</button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={spin}
                        disabled={isSpinning || items.length < 2}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg transform active:scale-95"
                    >
                        {t.spin}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        <span className="text-xs text-gray-400 self-center mr-1">{t.presets}</span>
                        <button onClick={() => loadPreset('names')} className="px-3 py-1 bg-white/5 rounded text-xs hover:bg-white/10 text-gray-300 whitespace-nowrap">{t.names}</button>
                        <button onClick={() => loadPreset('prizes')} className="px-3 py-1 bg-white/5 rounded text-xs hover:bg-white/10 text-gray-300 whitespace-nowrap">{t.prizes}</button>
                        <button onClick={() => loadPreset('acts')} className="px-3 py-1 bg-white/5 rounded text-xs hover:bg-white/10 text-gray-300 whitespace-nowrap">{t.acts}</button>
                    </div>
                    <textarea 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        className="flex-1 w-full bg-black/40 border border-gray-600 rounded-xl p-4 text-white text-sm focus:border-purple-500 outline-none resize-none mb-4"
                        placeholder={t.placeholder}
                    />
                    <button onClick={handleEditSave} className="w-full py-3 bg-gem-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-all">{t.done}</button>
                </div>
            )}
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
