import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getGeminiAI } from '../services/geminiService';
import type { Language } from '../App';
import { IconBoard, IconCheck } from './Icons';

export const SmartWhiteboard: React.FC<{ lang: Language }> = ({ lang }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#FFFFFF');
    const [lineWidth, setLineWidth] = useState(3);
    const [mode, setMode] = useState<'draw' | 'erase'>('draw');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = getGeminiAI();

    const t = {
        en: {
            title: "Smart Whiteboard",
            subtitle: "Draw, sketch, and let AI analyze your board.",
            tools: { draw: "Pen", erase: "Eraser", clear: "Clear Board" },
            actions: { solve: "Solve Math", explain: "Explain Diagram" },
            loading: "Analyzing Board...",
            placeholder: "Draw something on the board to begin!"
        },
        zh: {
            title: "智能白板",
            subtitle: "绘画、素描，让 AI 分析您的白板。",
            tools: { draw: "画笔", erase: "橡皮擦", clear: "清空白板" },
            actions: { solve: "解数学题", explain: "解释图表" },
            loading: "正在分析白板...",
            placeholder: "在白板上画点什么开始吧！"
        }
    }[lang];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set initial background to black (or dark slate to match theme)
        ctx.fillStyle = '#1e293b'; // gem-slate
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const resize = () => {
            const parent = canvas.parentElement;
            if(parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);
                
                // Resize
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                
                // Restore content
                const newCtx = canvas.getContext('2d');
                if(newCtx) {
                    newCtx.fillStyle = '#1e293b';
                    newCtx.fillRect(0, 0, canvas.width, canvas.height);
                    newCtx.drawImage(tempCanvas, 0, 0);
                }
            }
        };
        
        window.addEventListener('resize', resize);
        resize(); // Initial sizing

        return () => window.removeEventListener('resize', resize);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) ctx.beginPath(); // Reset path
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = mode === 'draw' ? color : '#1e293b'; // Eraser paints background color

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearBoard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setResult('');
    };

    const analyzeBoard = useCallback(async (action: 'solve' | 'explain') => {
        if (!ai || !canvasRef.current) return;
        setIsLoading(true);
        setResult('');

        try {
            const base64Image = canvasRef.current.toDataURL('image/png').split(',')[1];
            
            let prompt = "";
            if (action === 'solve') {
                prompt = `Analyze this whiteboard image containing a math problem. 
                1. Identify the equation or problem.
                2. Solve it step-by-step.
                Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.`;
            } else {
                prompt = `Analyze this whiteboard image. 
                Explain the diagram, notes, or concept drawn on the board clearly.
                Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: 'image/png', data: base64Image } }
                    ]
                }
            });

            setResult(response.text || "Could not analyze board.");
        } catch (e) {
            console.error(e);
            setResult("Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    }, [ai, lang]);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="text-teal-400"><IconBoard /></span> {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                
                {/* AI Actions */}
                <div className="flex gap-2">
                    <button 
                        onClick={() => analyzeBoard('solve')}
                        disabled={isLoading}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
                    >
                        {isLoading ? "..." : t.actions.solve}
                    </button>
                    <button 
                        onClick={() => analyzeBoard('explain')}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 text-sm"
                    >
                        {isLoading ? "..." : t.actions.explain}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Toolbar */}
                <div className="w-16 bg-black/40 rounded-xl flex flex-col items-center py-4 gap-4 border border-white/10 shrink-0">
                    <button 
                        onClick={() => setMode('draw')} 
                        className={`p-3 rounded-lg transition-all ${mode === 'draw' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
                        title={t.tools.draw}
                    >
                        ✎
                    </button>
                    <button 
                        onClick={() => setMode('erase')} 
                        className={`p-3 rounded-lg transition-all ${mode === 'erase' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
                        title={t.tools.erase}
                    >
                        ⌫
                    </button>
                    
                    <div className="w-full h-px bg-white/10 my-2"></div>
                    
                    {/* Colors */}
                    {['#FFFFFF', '#ef4444', '#3b82f6', '#22c55e', '#eab308'].map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setMode('draw'); }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${color === c && mode === 'draw' ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}

                    <div className="w-full h-px bg-white/10 my-2"></div>

                    <button 
                        onClick={clearBoard} 
                        className="text-red-400 hover:text-red-300 text-2xl"
                        title={t.tools.clear}
                    >
                        🗑
                    </button>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 relative rounded-2xl border border-white/10 overflow-hidden bg-[#1e293b] cursor-crosshair">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                        className="absolute inset-0 w-full h-full touch-none"
                    />
                    
                    {/* Result Overlay */}
                    {result && (
                        <div className="absolute top-4 right-4 max-w-sm w-full bg-black/80 backdrop-blur-md p-6 rounded-xl border border-teal-500/30 shadow-2xl animate-fade-in max-h-[80%] overflow-y-auto">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-teal-400 font-bold text-lg">AI Analysis</h3>
                                <button onClick={() => setResult('')} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="prose prose-invert prose-sm">
                                <p className="whitespace-pre-wrap">{result}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};