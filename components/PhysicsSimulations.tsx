import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';

type SimType = 'projectile' | 'pendulum' | 'spring';

export const PhysicsSimulations: React.FC<{ lang: Language }> = ({ lang }) => {
    const [simType, setSimType] = useState<SimType>('projectile');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Sim State Refs (to avoid re-renders during animation loop)
    const simStateRef = useRef<any>({});
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);

    // AI Service
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Physics Lab",
            subtitle: "Interactive simulations powered by Gemini analysis.",
            btnAnalyze: "Analyze with AI",
            btnAnalyzing: "Calculating...",
            types: {
                projectile: "Projectile Motion",
                pendulum: "Simple Pendulum",
                spring: "Spring Oscillator"
            },
            controls: {
                velocity: "Velocity (m/s)",
                angle: "Angle (deg)",
                gravity: "Gravity (m/s²)",
                length: "Length (m)",
                mass: "Mass (kg)",
                k: "Spring Constant (N/m)",
                damping: "Damping"
            }
        },
        zh: {
            title: "物理实验室",
            subtitle: "由 Gemini 分析提供支持的交互式模拟。",
            btnAnalyze: "AI 分析",
            btnAnalyzing: "计算中...",
            types: {
                projectile: "抛体运动",
                pendulum: "单摆",
                spring: "弹簧振子"
            },
            controls: {
                velocity: "速度 (m/s)",
                angle: "角度 (deg)",
                gravity: "重力 (m/s²)",
                length: "长度 (m)",
                mass: "质量 (kg)",
                k: "劲度系数 (N/m)",
                damping: "阻尼"
            }
        }
    }[lang];

    // Initial Setup
    useEffect(() => {
        if (simType === 'projectile') {
            simStateRef.current = { v: 50, angle: 45, g: 9.8, t: 0, path: [], running: false };
        } else if (simType === 'pendulum') {
            simStateRef.current = { length: 2, angle: Math.PI / 4, aVel: 0, aAcc: 0, g: 9.8, running: true };
        } else if (simType === 'spring') {
            simStateRef.current = { k: 5, m: 2, damping: 0.1, y: 100, vy: 0, g: 9.8, running: true }; // y is displacement from equilibrium
        }
        
        // Start Loop
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [simType]);

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<width; i+=50) { ctx.moveTo(i,0); ctx.lineTo(i,height); }
        for(let i=0; i<height; i+=50) { ctx.moveTo(0,i); ctx.lineTo(width,i); }
        ctx.stroke();

        const state = simStateRef.current;
        const dt = 0.16; // Time step simulation speed

        if (simType === 'projectile') {
            if (state.running) {
                state.t += dt;
                const rad = state.angle * (Math.PI / 180);
                const vx = state.v * Math.cos(rad);
                const vy = state.v * Math.sin(rad) - state.g * state.t;
                
                // Simple Euler integration for pos
                let x = vx * state.t;
                let y = (state.v * Math.sin(rad) * state.t) - (0.5 * state.g * state.t * state.t);
                
                if (y < 0) {
                    y = 0;
                    state.running = false;
                }
                
                // Scaling for visual
                const scale = 5; 
                state.currentX = 50 + x * scale;
                state.currentY = height - 50 - y * scale;
                
                state.path.push({x: state.currentX, y: state.currentY});
            } else if (!state.running && state.path.length === 0) {
                // Initial draw at start
                state.currentX = 50;
                state.currentY = height - 50;
            }

            // Draw Path
            ctx.beginPath();
            ctx.strokeStyle = '#0EA5E9'; // gem-blue
            ctx.lineWidth = 2;
            if (state.path.length > 0) {
                ctx.moveTo(state.path[0].x, state.path[0].y);
                for (let p of state.path) ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // Draw Ball
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(state.currentX, state.currentY, 8, 0, Math.PI*2);
            ctx.fill();
            
            // Ground
            ctx.fillStyle = '#4ADE80';
            ctx.fillRect(0, height - 50, width, 5);

        } else if (simType === 'pendulum') {
             if (state.running) {
                // Angular acceleration = -g/L * sin(theta)
                const num = -1 * state.g;
                const den = state.length * 10; // Scale length for visuals
                state.aAcc = (num / den) * Math.sin(state.angle);
                state.aVel += state.aAcc * dt;
                // Damping
                state.aVel *= 0.995;
                state.angle += state.aVel * dt;
             }

             const originX = width / 2;
             const originY = 50;
             const len = state.length * 100; // Visual scale
             const bobX = originX + len * Math.sin(state.angle);
             const bobY = originY + len * Math.cos(state.angle);

             // String
             ctx.beginPath();
             ctx.moveTo(originX, originY);
             ctx.lineTo(bobX, bobY);
             ctx.strokeStyle = '#A855F7'; // gem-purple
             ctx.lineWidth = 2;
             ctx.stroke();

             // Bob
             ctx.beginPath();
             ctx.arc(bobX, bobY, 20, 0, Math.PI*2);
             ctx.fillStyle = '#fff';
             ctx.fill();

        } else if (simType === 'spring') {
            if (state.running) {
                const displacement = state.y; 
                const force = -state.k * displacement;
                const dampingForce = -state.damping * state.vy;
                const accel = (force + dampingForce) / state.m;
                
                state.vy += accel * dt * 5; // speed up visual
                state.y += state.vy * dt * 5;
            }
            
            const originX = width / 2;
            const originY = 100;
            const eqY = height / 2;
            const currentPixelY = eqY + state.y;

            // Draw Spring (Zig Zag)
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            const segments = 12;
            const segmentHeight = (currentPixelY - originY) / segments;
            for(let i=1; i<=segments; i++) {
                const xOffset = i % 2 === 0 ? -15 : 15;
                ctx.lineTo(originX + (i===segments ? 0 : xOffset), originY + i * segmentHeight);
            }
            ctx.strokeStyle = '#F472B6'; // gem-pink
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw Mass
            ctx.fillStyle = '#fff';
            ctx.fillRect(originX - 25, currentPixelY, 50, 50);
            
            // Equilibrium Line
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, eqY + 25); // center of box
            ctx.lineTo(width, eqY + 25);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    const handleAnalyze = useCallback(async () => {
        if (!ai) return;
        setIsLoading(true);
        setAnalysis('');

        try {
            const state = simStateRef.current;
            let prompt = `Analyze this physics simulation state. 
            Type: ${simType}.
            Parameters: ${JSON.stringify(state)}.
            Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            Task:
            1. Explain the physics principles at play.
            2. Calculate theoretical maximums (e.g., max height/range for projectile, period for pendulum).
            3. Provide a real-world example of this system.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 4000 } }
            });

            setAnalysis(response.text || "Analysis failed.");
        } catch (e) {
            console.error(e);
            setAnalysis("Error analyzing simulation.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, simType, lang]);

    const resetSim = () => {
        if (simType === 'projectile') {
            simStateRef.current.t = 0;
            simStateRef.current.path = [];
            simStateRef.current.running = false;
        } else if (simType === 'pendulum') {
             simStateRef.current.aVel = 0;
             simStateRef.current.angle = Math.PI / 4; // Reset to 45 deg
        } else if (simType === 'spring') {
            simStateRef.current.y = 100;
            simStateRef.current.vy = 0;
        }
    };

    const fireProjectile = () => {
        if (simType === 'projectile') {
            simStateRef.current.t = 0;
            simStateRef.current.path = [];
            simStateRef.current.running = true;
        }
    };

    // Helper to update ref state safely
    const updateState = (key: string, val: number) => {
        simStateRef.current[key] = val;
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{t.title}</h2>
            <p className="text-gray-400 mb-8 text-center">{t.subtitle}</p>

            {/* Type Selector */}
            <div className="flex justify-center space-x-4 mb-8">
                {(Object.keys(t.types) as SimType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => { setSimType(type); setAnalysis(''); }}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${simType === type ? 'bg-gem-blue text-white shadow-lg' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        {t.types[type]}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Canvas Area */}
                <div className="flex-1 glass-panel p-1 rounded-2xl border border-white/10 bg-black">
                     <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={500} 
                        className="w-full h-full rounded-xl"
                     />
                </div>

                {/* Controls Area */}
                <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
                    <h3 className="font-bold text-gem-blue uppercase text-sm tracking-wider">Parameters</h3>
                    
                    {simType === 'projectile' && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.velocity}</label>
                                <input type="range" min="10" max="100" defaultValue="50" onChange={(e) => updateState('v', Number(e.target.value))} className="w-full accent-gem-blue" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.angle}</label>
                                <input type="range" min="0" max="90" defaultValue="45" onChange={(e) => updateState('angle', Number(e.target.value))} className="w-full accent-gem-blue" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.gravity}</label>
                                <input type="range" min="1" max="20" defaultValue="9.8" onChange={(e) => updateState('g', Number(e.target.value))} className="w-full accent-gem-blue" />
                            </div>
                            <button onClick={fireProjectile} className="w-full py-3 bg-gem-blue text-white font-bold rounded-xl hover:bg-blue-500">FIRE</button>
                        </>
                    )}

                    {simType === 'pendulum' && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.length}</label>
                                <input type="range" min="1" max="5" step="0.1" defaultValue="2" onChange={(e) => updateState('length', Number(e.target.value))} className="w-full accent-gem-purple" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.gravity}</label>
                                <input type="range" min="1" max="20" defaultValue="9.8" onChange={(e) => updateState('g', Number(e.target.value))} className="w-full accent-gem-purple" />
                            </div>
                             <button onClick={resetSim} className="w-full py-3 bg-gem-purple text-white font-bold rounded-xl hover:bg-purple-600">RESET</button>
                        </>
                    )}

                    {simType === 'spring' && (
                        <>
                             <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.k}</label>
                                <input type="range" min="1" max="20" defaultValue="5" onChange={(e) => updateState('k', Number(e.target.value))} className="w-full accent-gem-pink" />
                            </div>
                             <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.mass}</label>
                                <input type="range" min="1" max="10" defaultValue="2" onChange={(e) => updateState('m', Number(e.target.value))} className="w-full accent-gem-pink" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{t.controls.damping}</label>
                                <input type="range" min="0" max="1" step="0.01" defaultValue="0.1" onChange={(e) => updateState('damping', Number(e.target.value))} className="w-full accent-gem-pink" />
                            </div>
                             <button onClick={resetSim} className="w-full py-3 bg-gem-pink text-white font-bold rounded-xl hover:bg-pink-600">RESET</button>
                        </>
                    )}

                    <div className="border-t border-white/10 pt-6 mt-auto">
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isLoading}
                            className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/20"
                        >
                            {isLoading ? t.btnAnalyzing : t.btnAnalyze}
                        </button>
                    </div>
                </div>
            </div>

            {analysis && (
                <div className="mt-6 glass-panel p-8 rounded-2xl border border-gem-teal/30 animate-fade-in relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gem-teal to-blue-500"></div>
                     <h3 className="text-lg font-bold text-gem-teal mb-4">Gemini Analysis</h3>
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {analysis}
                    </div>
                </div>
            )}
        </div>
    );
};